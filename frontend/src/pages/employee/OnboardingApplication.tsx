import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Send as SendIcon,
} from "@mui/icons-material";

import StatusChip from "../../components/common/StatusChip";
import type { StatusType } from "../../components/common/StatusChip";

import { getMyOnboarding, submitOnboarding } from "../../lib/onboarding";
import type { UIOnboardingStatus } from "../../lib/onboarding";
import PersonalInformation from "./PersonalInformation";
import type { OnboardingForm } from "./PersonalInformation";
import VisaStatus from "./VisaStatus";
import OnboardingReview from "./OnboardingReview";
import type { OnboardingDocument } from "./types";
import DocumentCard from "./DocumentCard";

const steps = [
  "Personal Info",
  "Address",
  "Work Authorization",
  "Documents",
  "Review",
];

const Onboarding: React.FC = () => {
  const theme = useTheme();

  const handleFixDocument = () => {
    setActiveStep(3); // Documents step
  };

  const [documents, setDocuments] = useState<OnboardingDocument[]>([
    {
      id: "id-card",
      title: "Driver's License / State ID",
      type: "ID",
      status: "not-started",
    },
    {
      id: "work-auth",
      title: "Work Authorization Document",
      type: "Work Auth",
      status: "not-started",
    },
    {
      id: "photo",
      title: "Profile Photo",
      type: "Photo",
      status: "not-started",
    },
  ]);

  const handleDocumentUpload = (docId: string, file: File) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              status: "pending",
              fileName: file.name,
              uploadedAt: new Date().toISOString().split("T")[0],
              feedback: undefined,
            }
          : doc,
      ),
    );
  };

  const [loading, setLoading] = useState(true);
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

  // ===== Load onboarding from API =====
  useEffect(() => {
    const load = async () => {
      try {
        const app = await getMyOnboarding();
        setStatus(app.status);
        setRejectionFeedback(app.hrFeedback);
        if (app.formData) {
          setFormData((prev) => ({ ...prev, ...app.formData }));
        }
      } catch (err) {
        console.error("Failed to load onboarding", err);
      } finally {
        setLoading(false);
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
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.ssn) newErrors.ssn = "SSN is required";
      if (!formData.dateOfBirth)
        newErrors.dateOfBirth = "Date of birth is required";
    } else if (step === 1) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.zipCode) newErrors.zipCode = "ZIP code is required";
    } else if (step === 2) {
      if (!formData.workAuthType)
        newErrors.workAuthType = "Work authorization is required";
      if (formData.workAuthType === "other" && !formData.workAuthOther) {
        newErrors.workAuthOther = "Please specify your work authorization";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      const res = await submitOnboarding(formData);
      if (res.ok) {
        setStatus(res.status);
      }
    } catch (err) {
      console.error("Submit onboarding failed", err);
    }
  };

  const hasIncompleteDocuments = documents.some(
    (doc) => doc.status !== "approved",
  );

  const getStatusBanner = () => {
    switch (status) {
      case "pending":
        return (
          <Alert severity="info" icon={<PendingIcon />} sx={{ mb: 3 }}>
            <Typography fontWeight={600}>Application Pending Review</Typography>
            <Typography>
              Your onboarding application is under HR review.
            </Typography>
          </Alert>
        );
      case "approved":
        return (
          <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
            <Typography fontWeight={600}>Application Approved</Typography>
            <Typography>Welcome to the team!</Typography>
          </Alert>
        );
      case "rejected":
        return (
          <Alert severity="error" icon={<RejectedIcon />} sx={{ mb: 3 }}>
            <Typography fontWeight={600}>Application Rejected</Typography>
            <Typography>{rejectionFeedback}</Typography>
          </Alert>
        );
      default:
        return null;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <PersonalInformation
            formData={formData}
            errors={errors}
            onChange={handleChange}
          />
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Street Address"
                required
                value={formData.address || ""}
                onChange={handleChange("address")}
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="City"
                required
                value={formData.city || ""}
                onChange={handleChange("city")}
                error={!!errors.city}
                helperText={errors.city}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="State"
                required
                value={formData.state || ""}
                onChange={handleChange("state")}
                error={!!errors.state}
                helperText={errors.state}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <TextField
                fullWidth
                label="ZIP Code"
                required
                value={formData.zipCode || ""}
                onChange={handleChange("zipCode")}
                error={!!errors.zipCode}
                helperText={errors.zipCode}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Emergency Contact
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Contact Name"
                value={formData.emergencyContact || ""}
                onChange={handleChange("emergencyContact")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.emergencyPhone || ""}
                onChange={handleChange("emergencyPhone")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Relationship"
                value={formData.emergencyRelationship || ""}
                onChange={handleChange("emergencyRelationship")}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return <VisaStatus formData={formData} onChange={handleChange} />;
      case 3:
        return (
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Documents
            </Typography>

            <Box sx={{ display: "grid", gap: 2 }}>
              {documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onUpload={(file: File) => handleDocumentUpload(doc.id, file)}
                />
              ))}
            </Box>
          </Box>
        );
      case 4:
        return (
          <OnboardingReview
            formData={formData}
            documents={documents}
            onFixDocument={handleFixDocument}
          />
        );
      default:
        return null;
    }
  };

  // ===== Loading =====
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ===== Pending / Approved =====
  if (status === "pending" || status === "approved") {
    return (
      <Box>
        {getStatusBanner()}
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            {status === "pending" ? (
              <PendingIcon
                sx={{ fontSize: 64, color: theme.palette.info.main }}
              />
            ) : (
              <CheckIcon
                sx={{ fontSize: 64, color: theme.palette.success.main }}
              />
            )}
            <Typography variant="h5" fontWeight={600} mt={2}>
              {status === "pending" ? "Under Review" : "Onboarding Complete"}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ===== Form =====
  return (
    <Box>
      {getStatusBanner()}

      <Card>
        <CardContent>
          <Box mb={4}>
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Onboarding Application
              </Typography>
              <StatusChip status={status as StatusType} />
            </Box>

            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ minHeight: 260, mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box display="flex" justifyContent="space-between">
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              variant="outlined"
            >
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<SendIcon />}
                disabled={hasIncompleteDocuments}
              >
                Submit Application
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
