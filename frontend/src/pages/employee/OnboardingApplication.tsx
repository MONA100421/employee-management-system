import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  CircularProgress,
  Grid,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { getMyOnboarding, submitOnboarding } from "../../lib/onboarding";
import type { UIOnboardingStatus } from "../../lib/onboarding";
import PersonalInformation from "./PersonalInformation";
import OnboardingReview from "./OnboardingReview";
import DocumentList from "../../components/common/DocumentList";
import { useDocuments } from "../../hooks/useDocuments";
import type { BaseDocument, OnboardingDocument } from "../../types/document";
import type { OnboardingFormValues } from "./onboarding.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "./onboarding.schema";

const stepsLabels = [
  "Personal Info",
  "Address",
  "Work Authorization",
  "Documents",
  "Review",
];

const toOnboardingDoc = (d: BaseDocument): OnboardingDocument => ({
  ...d,
  title:
    d.type === "id_card"
      ? "Driver's License / State ID"
      : d.type === "work_auth"
        ? "Work Authorization Document"
        : d.type === "profile_photo"
          ? "Profile Photo"
          : d.type,
});

const Onboarding = () => {
  const {
    control,
    formState: { errors },
    trigger,
    getValues,
    watch,
    reset,
  } = useForm<OnboardingFormValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      preferredName: "",
      ssn: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      emergencyContact: "",
      emergencyPhone: "",
      emergencyRelationship: "",
      workAuthType: "",
      workAuthOther: "",
    },
    mode: "onTouched",
    resolver: zodResolver(onboardingSchema),
  });

  const workAuthType = watch("workAuthType");

  const {
    documents: onboardingDocs,
    loading: onboardingLoading,
    uploadDocument: uploadOnboardingDoc,
  } = useDocuments("onboarding");

  const {
    documents: visaDocs,
    loading: visaLoading,
    uploadDocument: uploadVisaDoc,
  } = useDocuments("visa");

  const rawDocs =
    workAuthType === "f1" ? [...onboardingDocs, ...visaDocs] : onboardingDocs;

  const loading = onboardingLoading || visaLoading;

  const handleUpload = async (type: string, file: File) => {
    const isVisaDoc = visaDocs.some((d) => d.type === type);
    if (isVisaDoc) {
      await uploadVisaDoc(type, file);
    } else {
      await uploadOnboardingDoc(type, file);
    }
  };

  const documents = rawDocs.map(toOnboardingDoc);

  const [status, setStatus] = useState<UIOnboardingStatus>("never-submitted");
  const [activeStep, setActiveStep] = useState(0);
  const [rejectionFeedback, setRejectionFeedback] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const load = async () => {
      try {
        const app = await getMyOnboarding();
        if (app && app.status) {
          setStatus(
            (app.status || "never_submitted").replace(
              "_",
              "-",
            ) as UIOnboardingStatus,
          );
          setRejectionFeedback(app.hrFeedback ?? null);
          if (app.formData) {
            reset(app.formData);
          }
        }
      } catch (err) {
        console.error("Failed to load onboarding data:", err);
        setStatus("never-submitted");
      }
    };

    load();
  }, [reset]);

  const navigate = useNavigate();
  useEffect(() => {
    if (status === "approved") {
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status, navigate]);

  const isReadOnly = status === "pending" || status === "approved";

  const requiredDocTypes = ["profile_photo", "id_card", "work_auth"];
  if (workAuthType === "f1") {
    requiredDocTypes.push("opt_receipt");
  }

  const hasRequiredDocs = requiredDocTypes.every((type) =>
    documents.some((d) => d.type === type && d.fileName),
  );

  const canSubmit =
    !isReadOnly &&
    hasRequiredDocs &&
    (status === "never-submitted" || status === "rejected");

  const validateStep = async (step: number) => {
    if (isReadOnly) return true;
    if (step === 0) {
      return await trigger(["firstName", "lastName", "ssn", "dateOfBirth"]);
    } else if (step === 1) {
      return await trigger(["address", "city", "state", "zipCode"]);
    } else if (step === 2) {
      return await trigger(["workAuthType", "workAuthOther"]);
    }
    return true;
  };

  const handleNext = async () => {
    const ok = await validateStep(activeStep);
    if (!ok) return;
    setActiveStep((s) => Math.min(stepsLabels.length - 1, s + 1));
  };

  const handleBack = () => {
    setActiveStep((s) => Math.max(0, s - 1));
  };

  const handleSubmit = async () => {
    try {
      const formData = getValues();
      const res = await submitOnboarding(formData);

      if (res.ok) {
        setStatus(
          (res.status?.replace("_", "-") as UIOnboardingStatus) ?? "pending",
        );
        setRejectionFeedback(null);
        setActiveStep(0);
      } else {
        console.error("Submission failed with status:", res.status);
      }
    } catch (err) {
      console.error("Network error during submission:", err);
      alert("Submission failed, please try again later.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {status === "pending" && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Application Pending Review — your uploaded documents are read-only
          while HR reviews.
        </Alert>
      )}

      {status === "approved" && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Application Approved
        </Alert>
      )}
      {status === "rejected" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Your application was rejected.</strong>
          <br />
          Please review the feedback below, fix the issues, and resubmit.
          {rejectionFeedback && (
            <Box mt={1}>
              <strong>HR Feedback:</strong> {rejectionFeedback}
            </Box>
          )}
        </Alert>
      )}

      <Card>
        <CardContent>
          {status === "pending" && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Submitted documents (read-only while pending)
              </Typography>
              <DocumentList documents={documents} onUpload={undefined} />
            </Box>
          )}

          {isReadOnly && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Your application is currently {status}. Fields are locked for
              editing.
            </Alert>
          )}

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
            {stepsLabels.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ my: 3 }} />

          {/* Personal Info */}
          {activeStep === 0 && (
            <PersonalInformation
              control={control}
              errors={errors}
              mode="personal"
              readOnly={isReadOnly}
            />
          )}

          {/* Address */}
          {activeStep === 1 && (
            <PersonalInformation
              control={control}
              errors={errors}
              mode="address"
              readOnly={isReadOnly}
            />
          )}

          {/* Work Authorization */}
          {activeStep === 2 && (
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="workAuthType"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label="Work Authorization Type"
                        required
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.workAuthType}
                        helperText={errors.workAuthType?.message as string}
                        disabled={isReadOnly}
                      >
                        <MenuItem value="">
                          <em>Select...</em>
                        </MenuItem>
                        <MenuItem value="citizen">U.S. Citizen</MenuItem>
                        <MenuItem value="green-card">Green Card</MenuItem>
                        <MenuItem value="f1">F1 (CPT/OPT)</MenuItem>
                        <MenuItem value="h1b">H1-B</MenuItem>
                        <MenuItem value="l2">L2</MenuItem>
                        <MenuItem value="h4">H4</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>

                {workAuthType === "other" && (
                  <Grid size={{ xs: 12 }}>
                    <Controller
                      name="workAuthOther"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Please specify (Visa Title)"
                          required
                          InputLabelProps={{ shrink: true }}
                          disabled={isReadOnly}
                        />
                      )}
                    />
                  </Grid>
                )}

                {workAuthType === "f1" && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info">
                      Per OPT flow requirements, you will be required to upload
                      your OPT Receipt in the next step.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          {/* Documents */}
          {activeStep === 3 && (
            <DocumentList
              documents={documents}
              onUpload={isReadOnly ? undefined : handleUpload}
            />
          )}

          {/* Review */}
          {activeStep === 4 && (
            <OnboardingReview
              formData={getValues()}
              documents={documents}
              onFixDocument={() => setActiveStep(3)}
            />
          )}

          <Divider sx={{ my: 3 }} />

          <Box display="flex" justifyContent="space-between">
            <Button onClick={handleBack} disabled={activeStep === 0}>
              Back
            </Button>

            {activeStep === stepsLabels.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {status === "rejected" ? "Resubmit" : "Submit"}
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Onboarding;
