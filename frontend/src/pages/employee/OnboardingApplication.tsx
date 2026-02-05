import React, { useState } from "react";
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
import Grid from "@mui/material/Grid";

import { getMyOnboarding, submitOnboarding } from "../../lib/onboarding";
import type { UIOnboardingStatus } from "../../lib/onboarding";
import PersonalInformation from "./PersonalInformation";
import type { OnboardingForm } from "./PersonalInformation";
import VisaStatus from "./VisaStatus";
import OnboardingReview from "./OnboardingReview";
import FileUpload from "../../components/common/FileUpload";
import { useDocuments } from "../../hooks/useDocuments";

const steps = [
  "Personal Info",
  "Address",
  "Work Authorization",
  "Documents",
  "Review",
];

const mapDocStatusToUploadStatus = (
  status: "not-started" | "pending" | "approved" | "rejected",
) => {
  switch (status) {
    case "pending":
      return "uploading";
    case "approved":
      return "success";
    case "rejected":
      return "error";
    default:
      return "idle";
  }
};

const Onboarding: React.FC = () => {
  const { documents, loading, uploadDocument } = useDocuments("onboarding");

  const [status, setStatus] = useState<UIOnboardingStatus>("never-submitted");
  const [activeStep, setActiveStep] = useState(0);
  const [rejectionFeedback, setRejectionFeedback] = useState<string | null>(
    null,
  );

  const [formData, setFormData] = useState<OnboardingForm>({
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    const load = async () => {
      const app = await getMyOnboarding();
      setStatus(app.status.replace("_", "-") as UIOnboardingStatus);
      setRejectionFeedback(app.hrFeedback ?? null);

      if (app.formData) {
        setFormData((prev) => ({ ...prev, ...app.formData }));
      }
    };
    load();
  }, []);

  const handleChange =
    (field: keyof OnboardingForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
      }
    };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!formData.firstName) errs.firstName = "Required";
      if (!formData.lastName) errs.lastName = "Required";
      if (!formData.ssn) errs.ssn = "Required";
      if (!formData.dateOfBirth) errs.dateOfBirth = "Required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () =>
    validateStep(activeStep) && setActiveStep((s) => s + 1);

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
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
            <PersonalInformation
              formData={formData}
              errors={errors}
              onChange={handleChange}
            />
          )}

          {activeStep === 2 && <VisaStatus />}

          {activeStep === 3 && (
            <Grid container spacing={3}>
              {documents.map((doc) => (
                <Grid key={doc.type} size={{ xs: 12, md: 6 }}>
                  <FileUpload
                    label={doc.title}
                    fileName={doc.fileName}
                    status={mapDocStatusToUploadStatus(doc.status)}
                    disabled={doc.status === "approved"}
                    onFileSelect={(file) => uploadDocument(doc.type, file)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {activeStep === 4 && (
            <OnboardingReview
              formData={formData}
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
