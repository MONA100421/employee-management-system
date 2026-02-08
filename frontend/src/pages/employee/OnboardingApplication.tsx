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
} from "@mui/material";
import { useForm } from "react-hook-form";

import { getMyOnboarding, submitOnboarding } from "../../lib/onboarding";
import type { UIOnboardingStatus } from "../../lib/onboarding";
import PersonalInformation from "./PersonalInformation";
import VisaStatus from "./VisaStatus";
import OnboardingReview from "./OnboardingReview";
import DocumentList from "../../components/common/DocumentList";
import { useDocuments } from "../../hooks/useDocuments";
import type { BaseDocument, OnboardingDocument } from "../../types/document";
import type { OnboardingFormValues } from "./onboarding.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "./onboarding.schema";

const steps = [
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
      setStatus(app.status.replace("_", "-") as UIOnboardingStatus);
      setRejectionFeedback(app.hrFeedback ?? null);

      if (app.formData) {
        reset(app.formData);
      }
    };

    load();
  }, [reset]);

  const handleNext = async () => {
    if (activeStep === 0) {
      const valid = await trigger([
        "firstName",
        "lastName",
        "ssn",
        "dateOfBirth",
      ]);

      if (!valid) return;
    }

    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setActiveStep((s) => Math.max(0, s - 1));
  };

  const handleSubmit = async () => {
    const formData = getValues();
    const res = await submitOnboarding(formData);
    if (res.ok) setStatus(res.status);
  };

  const hasIncompleteDocuments = documents.some((d) => d.status !== "approved");

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
        <Alert severity="error">{rejectionFeedback}</Alert>
      )}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Divider sx={{ my: 4 }} />

          {activeStep === 0 && (
            <PersonalInformation control={control} errors={errors} />
          )}

          {activeStep === 2 && <VisaStatus />}

          {activeStep === 3 && (
            <DocumentList documents={documents} onUpload={uploadDocument} />
          )}


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

            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={hasIncompleteDocuments}
              >
                Submit
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
