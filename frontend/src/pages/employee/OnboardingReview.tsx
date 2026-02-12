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
  Button,
} from "@mui/material";
import type { OnboardingFormValues } from "./onboarding.schema";
import type { OnboardingDocument } from "../../types/document";
import StatusChip from "../../components/common/StatusChip";

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
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography
          variant="subtitle2"
          sx={{
            color: "text.secondary",
            mb: 1,
            textTransform: "uppercase",
            fontSize: "0.7rem",
            fontWeight: 700,
          }}
        >
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
      <Typography variant="h6" fontWeight={600} mb={1}>
        Review Your Application
      </Typography>

      {readOnly && (
        <Alert severity="info" sx={{ mb: 3 }}>
          This application is currently locked because it is under review or has
          been approved.
        </Alert>
      )}

      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.secondary, mb: 3 }}
      >
        Please confirm all details below are accurate.
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
              <strong>DOB:</strong> {formData.dateOfBirth || "—"}
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
          <InfoBlock title="Contact & Address">
            <Typography variant="body2">
              <strong>Phone:</strong> {formData.phone || "—"}
            </Typography>
            <Typography variant="body2">
              <strong>Address:</strong> {formData.address || "—"}
            </Typography>
            <Typography variant="body2">
              {formData.city}, {formData.state} {formData.zipCode}
            </Typography>
          </InfoBlock>
        </Grid>

        {/* Documents Section */}
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ mt: 2, mb: 2 }}
          >
            Uploaded Documents
          </Typography>
          <Grid container spacing={2}>
            {documents.map((doc) => (
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
                    bgcolor:
                      doc.status === "rejected"
                        ? "rgba(211, 47, 47, 0.04)"
                        : "background.paper",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {doc.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {doc.fileName
                        ? `File: ${doc.fileName}`
                        : "No file selected"}
                    </Typography>

                    {!readOnly && doc.status === "rejected" && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => onFixDocument?.(doc.id)}
                        sx={{ mt: 1, fontSize: "0.7rem" }}
                      >
                        Re-upload required
                      </Button>
                    )}
                  </Box>

                  <StatusChip status={doc.status} size="small" />
                </Box>

                {doc.status === "rejected" && doc.hrFeedback && (
                  <Alert severity="error" sx={{ mt: 1, py: 0 }}>
                    <Typography variant="caption">
                      <strong>HR Feedback:</strong> {doc.hrFeedback}
                    </Typography>
                  </Alert>
                )}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Status: {readOnly ? "Locked (Submitted)" : "Draft (Editable)"}
        </Typography>
      </Box>
    </Box>
  );
}
