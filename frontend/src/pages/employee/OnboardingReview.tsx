import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  useTheme,
  Alert,
} from "@mui/material";
import type { OnboardingForm } from "./PersonalInformation";
import type { OnboardingDocument } from "./types";
import StatusChip from "../../components/common/StatusChip";


type Props = {
  formData: OnboardingForm;
  documents: OnboardingDocument[];
};

function InfoBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 1 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

export default function OnboardingReview({ formData, documents }: Props) {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Review Your Information
      </Typography>

      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.secondary, mb: 3 }}
      >
        Please review your information carefully before submitting. You can go
        back to any step to make changes.
      </Typography>

      <Grid container spacing={3}>
        {/* Personal Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoBlock title="Personal Information">
            <Typography variant="body2">
              <strong>Name:</strong> {formData.firstName} {formData.middleName}{" "}
              {formData.lastName}
            </Typography>
            <Typography variant="body2">
              <strong>Date of Birth:</strong> {formData.dateOfBirth || "—"}
            </Typography>
            <Typography variant="body2">
              <strong>SSN:</strong> ***-**-
              {formData.ssn?.slice(-4) || "****"}
            </Typography>
            <Typography variant="body2">
              <strong>Gender:</strong> {formData.gender || "—"}
            </Typography>
          </InfoBlock>
        </Grid>
        {/* Address */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoBlock title="Address">
            <Typography variant="body2">{formData.address || "—"}</Typography>
            <Typography variant="body2">
              {formData.city}, {formData.state} {formData.zipCode}
            </Typography>
          </InfoBlock>
        </Grid>

        {/* Documents Summary */}
        <Grid size={{ xs: 12 }}>
          <InfoBlock title="Documents">
            <Grid container spacing={2}>
              {documents.map((doc: OnboardingDocument) => (
                <Grid size={{ xs: 12, md: 6 }} key={doc.id}>
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      bgcolor:
                        doc.status === "approved"
                          ? "success.light"
                          : doc.status === "pending"
                            ? "warning.light"
                            : doc.status === "rejected"
                              ? "error.light"
                              : "background.default",
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={600} noWrap>
                        {doc.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.fileName
                          ? `Uploaded ${doc.uploadedAt}`
                          : "Not uploaded"}
                      </Typography>
                    </Box>

                    <StatusChip status={doc.status} size="small" />
                  </Box>
                </Grid>
              ))}
            </Grid>

            {documents.some(
              (d: OnboardingDocument) => d.status !== "approved",
            ) && (
              <Alert severity="warning" sx={{ mt: 3 }}>
                All required documents must be uploaded and approved before
                submission.
              </Alert>
            )}
          </InfoBlock>
        </Grid>

        {/* Work Authorization */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoBlock title="Work Authorization">
            <Typography variant="body2">
              <strong>Type:</strong> {formData.workAuthType || "—"}
            </Typography>
            {formData.workAuthType === "other" && (
              <Typography variant="body2">
                <strong>Details:</strong> {formData.workAuthOther || "—"}
              </Typography>
            )}
          </InfoBlock>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography
        variant="caption"
        sx={{ color: theme.palette.text.secondary }}
      >
        By submitting, you confirm that the information provided is accurate and
        complete.
      </Typography>
    </Box>
  );
}
