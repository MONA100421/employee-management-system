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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";

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
    documents: rawDocs,
    loading,
    uploadDocument,
  } = useDocuments("onboarding");
  const documents = rawDocs.map(toOnboardingDoc);

  const [status, setStatus] = useState<UIOnboardingStatus>("never-submitted");
  const [activeStep, setActiveStep] = useState(0);
  const [rejectionFeedback, setRejectionFeedback] = useState<string | null>(
    null,
  );

  const {
    control,
    formState: { errors },
    trigger,
    getValues,
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

  useEffect(() => {
    const load = async () => {
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
    };
    load();
  }, [reset]);

  const validateStep = async (step: number) => {
    if (step === 0) {
      return await trigger(["firstName", "lastName", "ssn", "dateOfBirth"]);
    } else if (step === 1) {
      return await trigger(["address", "city", "state", "zipCode"]);
    } else if (step === 2) {
      return await trigger(["workAuthType"]);
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
    const formData = getValues();
    const res = await submitOnboarding(formData);
    if (res.ok) {
      setStatus(
        (res.status?.replace("_", "-") as UIOnboardingStatus) ?? "pending",
      );
      setRejectionFeedback(null);
      setActiveStep(0);
    }
  };

  const hasIncompleteDocuments = documents.some((d) => d.status !== "approved");
  const canSubmit =
    !hasIncompleteDocuments &&
    (status === "never-submitted" || status === "rejected");

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
        <Alert severity="info">Application Pending Review</Alert>
      )}
      {status === "approved" && (
        <Alert severity="success">Application Approved</Alert>
      )}
      {status === "rejected" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>Your application was rejected.</strong>
          <br />
          Please review the feedback below, fix the issues, and resubmit.
          {rejectionFeedback && (
            <>
              <br />
              <strong>HR Feedback:</strong> {rejectionFeedback}
            </>
          )}
        </Alert>
      )}

      <Card>
        <CardContent>
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
            />
          )}

          {/* Address */}
          {activeStep === 1 && (
            <PersonalInformation
              control={control}
              errors={errors}
              mode="address"
            />
          )}

          {/*  Work Authorization */}
          {activeStep === 2 && (
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="workAuthType"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label="Work Authorization Type"
                        select
                        SelectProps={{ native: true }}
                        {...field}
                        error={!!errors.workAuthType}
                        helperText={
                          (errors.workAuthType &&
                            (errors.workAuthType.message as string)) ??
                          ""
                        }
                      >
                        <option value="">Select...</option>
                        <option value="citizen">U.S. Citizen</option>
                        <option value="green-card">Green Card</option>
                        <option value="opt">OPT</option>
                        <option value="opt-stem">OPT STEM Extension</option>
                        <option value="h1b">H1-B</option>
                        <option value="l2">L2</option>
                        <option value="h4">H4</option>
                        <option value="other">Other</option>
                      </TextField>
                    )}
                  />
                </Grid>

                {/* other */}
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="workAuthOther"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label="Please specify (if Other)"
                        {...field}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Documents */}
          {activeStep === 3 && (
            <DocumentList documents={documents} onUpload={uploadDocument} />
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
