import React, { useEffect, useState } from "react";
import type { Theme } from "@mui/material/styles";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip,
  Paper,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Download as DownloadIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Description as DocIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

import { useDocuments } from "../../hooks/useDocuments";
import FileUpload from "../../components/common/FileUpload";
import StatusChip from "../../components/common/StatusChip";
import DocumentList from "../../components/common/DocumentList";
import type { BaseDocument } from "../../types/document";

import { type VisaFormValues } from "./visa.schema";
import { useVisaForm } from "../../hooks/useVisaForm";
import { useLocation } from "react-router-dom";

// Types

type StepStatus = "not-started" | "pending" | "approved" | "rejected";

type LocationState = {
  scrollTo?: string;
};

type VisaStep = {
  type: keyof VisaFormValues | string;
  title: string;
  description: string;
  doc?: BaseDocument;
};

const VISA_FLOW: VisaStep[] = [
  {
    type: "opt_receipt",
    title: "OPT Receipt",
    description: "Upload your OPT Receipt Notice (I-797C)",
  },
  {
    type: "opt_ead",
    title: "EAD Card",
    description: "Upload your Employment Authorization Document",
  },
  {
    type: "i_983",
    title: "I-983 Form",
    description: "Download, complete, and upload the I-983 Training Plan",
  },
  {
    type: "i_20",
    title: "I-20",
    description: "Upload your updated I-20 with STEM extension",
  },
];

const getStepIcon = (status: StepStatus, theme: Theme) => {
  switch (status) {
    case "approved":
      return <CheckIcon sx={{ color: theme.palette.success.main }} />;
    case "pending":
      return <PendingIcon sx={{ color: theme.palette.warning.main }} />;
    case "rejected":
      return <RejectedIcon sx={{ color: theme.palette.error.main }} />;
    default:
      return <DocIcon sx={{ color: theme.palette.grey[400] }} />;
  }
};

// Component

const VisaStatus: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;
  const scrollTo = state.scrollTo;

  const { documents, loading, uploadDocument } = useDocuments("visa");
  const { setValue, isUploaded } = useVisaForm(documents, loading);

  const [highlightId, setHighlightId] = useState<string | null>(null);

  /* Notification → scroll + highlight */
  useEffect(() => {
    if (!scrollTo) return;

    const t = setTimeout(() => {
      const el = document.querySelector<HTMLElement>(
        `[data-docid="${scrollTo}"]`,
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightId(scrollTo);
        setTimeout(() => setHighlightId(null), 3000);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [scrollTo]);

  /* Build steps */
  const steps = VISA_FLOW.map((step) => {
    const doc = documents.find((d) => d.type === step.type);
    return {
      ...step,
      doc,
      status: (doc?.status ?? "not-started") as StepStatus,
    };
  });

  const activeStep = steps.findIndex((s) => s.status !== "approved");
  const completed = steps.filter((s) => s.status === "approved").length;
  const progress = (completed / steps.length) * 100;

  if (loading) {
    return <Typography>Loading visa status…</Typography>;
  }

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>
            Visa Status Management
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Track and manage your OPT / STEM Extension documents
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip label="OPT" variant="outlined" color="primary" />
            <Chip label="STEM Eligible" variant="outlined" color="success" />
          </Box>

          {/* Progress */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={600}>
              Overall Progress: {completed} / {steps.length}
            </Typography>
            <Box
              sx={{
                mt: 1,
                height: 8,
                borderRadius: 4,
                bgcolor: theme.palette.grey[200],
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${progress}%`,
                  bgcolor: theme.palette.success.main,
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        Complete each step in order. The next step unlocks after HR approval.
      </Alert>

      {/* Stepper */}
      <Card>
        <CardContent>
          <Stepper
            activeStep={activeStep === -1 ? steps.length : activeStep}
            orientation="vertical"
          >
            {steps.map((step, index) => {
              const prevStep = steps[index - 1];
              const prevApproved =
                index === 0 ? true : prevStep?.status === "approved";
              const prevUploadedFrontend =
                index === 0
                  ? true
                  : isUploaded(prevStep.type as keyof VisaFormValues);

              const disabled =
                index > 0 && !(prevApproved || prevUploadedFrontend);

              return (
                <Step
                  key={String(step.type)}
                  completed={step.status === "approved"}
                >
                  <StepLabel
                    icon={getStepIcon(step.status, theme)}
                    optional={<StatusChip status={step.status} size="small" />}
                  >
                    <Typography fontWeight={600}>{step.title}</Typography>
                  </StepLabel>

                  <StepContent>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>

                    {step.status === "rejected" && step.doc?.hrFeedback && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {step.doc.hrFeedback}
                      </Alert>
                    )}

                    {step.doc?.fileName && step.status !== "rejected" ? (
                      <Paper sx={{ p: 2, display: "flex", gap: 2, mb: 2 }}>
                        <DocIcon />
                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={500}>
                            {step.doc.fileName}
                          </Typography>
                          <Typography variant="caption">
                            Uploaded at {step.doc.uploadedAt}
                          </Typography>
                        </Box>
                        <IconButton>
                          <DownloadIcon />
                        </IconButton>
                      </Paper>
                    ) : (
                      !disabled && (
                        <FileUpload
                          label={`Upload ${step.title}`}
                          disabled={disabled}
                          onFileSelect={(file) => {
                            setValue(step.type as keyof VisaFormValues, true);
                            uploadDocument(String(step.type), file);
                          }}
                        />
                      )
                    )}

                    {disabled && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Complete the previous step (or wait for HR approval).
                      </Alert>
                    )}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </CardContent>
      </Card>

      {/* Document list (for scroll target)*/}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          All Visa Documents
        </Typography>
        <DocumentList
          documents={documents}
          readonly
          highlightId={highlightId}
        />
      </Box>
    </Box>
  );
};

export default VisaStatus;
