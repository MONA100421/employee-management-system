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
import type { OnboardingFormValues } from "./onboarding.schema";
import type { OnboardingDocument } from "../../types/document";
import StatusChip from "../../components/common/StatusChip";
import { Schedule as ScheduleIcon } from "@mui/icons-material";

type Props = {
  formData: OnboardingFormValues;
  documents: OnboardingDocument[];
  onFixDocument?: (docId: string) => void;
  readOnly?: boolean;
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

export default function OnboardingReview({
  formData,
  documents,
  onFixDocument,
  readOnly = false,
}: Props) {
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
        Please review your information carefully before submitting.
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
              <strong>SSN:</strong> ***-**-{formData.ssn?.slice(-4) || "****"}
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

        {/* Documents */}
        <Grid size={{ xs: 12 }}>
          <InfoBlock title="Documents">
            <Grid container spacing={2}>
              {documents.map((doc) => (
                <Grid size={{ xs: 12, md: 6 }} key={doc.id}>
                  <Box
                    onClick={
                      !readOnly && doc.status === "rejected"
                        ? () => onFixDocument?.(doc.id)
                        : undefined
                    }
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      cursor:
                        !readOnly && doc.status === "rejected"
                          ? "pointer"
                          : "default",
                      bgcolor:
                        doc.status === "rejected"
                          ? "rgba(198,40,40,0.06)"
                          : "transparent",
                    }}
                  >
                    <Box>
                      <Typography fontWeight={600}>{doc.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.fileName
                          ? `Uploaded ${doc.uploadedAt}`
                          : "Not uploaded"}
                      </Typography>

                      {!readOnly && doc.status === "rejected" && (
                        <Typography variant="caption" color="error">
                          Click to re-upload
                        </Typography>
                      )}

                      {!readOnly && doc.status === "pending" && (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <ScheduleIcon fontSize="inherit" color="warning" />
                          <Typography variant="caption" color="warning.main">
                            Pending HR review
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    <StatusChip status={doc.status} size="small" />
                  </Box>

                  {doc.status === "rejected" && doc.hrFeedback && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      <strong>Feedback:</strong> {doc.hrFeedback}
                    </Alert>
                  )}
                </Grid>
              ))}
            </Grid>
          </InfoBlock>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        By submitting, you confirm that the information provided is accurate and
        complete.
      </Typography>
    </Box>
  );
}
