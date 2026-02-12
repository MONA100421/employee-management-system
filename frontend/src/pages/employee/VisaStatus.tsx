import React, { useMemo, useState } from "react";
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
  useTheme,
  Paper,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Visibility as PreviewIcon,
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Description as DocIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

import StatusChip from "../../components/common/StatusChip";
import FileUpload from "../../components/common/FileUpload";
import PreviewDialog from "../../components/common/PreviewDialog";
import { useDocuments } from "../../hooks/useDocuments";
import { getPresignedGet } from "../../lib/upload";
import { forceDownloadPresigned } from "../../lib/download";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";


/**
 * Visa step definition (UI only)
 * ❗不是資料來源
 */
const VISA_FLOW = [
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
    description: "Download, complete, and upload the I-983 Training Plan form",
  },
  {
    type: "i_20",
    title: "I-20",
    description: "Upload your updated I-20 with STEM extension",
  },
];

const VisaStatus: React.FC = () => {
  const theme = useTheme();

  const { documents, loading, isUploading, uploadDocument } =
    useDocuments("visa");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [previewName, setPreviewName] = useState<string>();

  /**
   * 將 documents → stepper steps（純 UI 映射）
   */
  const steps = useMemo(() => {
    return VISA_FLOW.map((step) => {
      const doc = documents.find((d) => d.type === step.type);

      return {
        ...step,
        status: doc?.status ?? "not-started",
        fileName: doc?.fileName,
        uploadedAt: doc?.uploadedAt,
        fileUrl: doc?.fileUrl,
        hrFeedback: doc?.hrFeedback,
      };
    });
  }, [documents]);

  const completedSteps = steps.filter((s) => s.status === "approved").length;
  const activeStepIndex = steps.findIndex((s) => s.status !== "approved");
  const activeStep = activeStepIndex === -1 ? steps.length : activeStepIndex;

  const location = useLocation();

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    const docId = state?.scrollTo;
    if (!docId) return;

    const el = document.querySelector(`[data-docid="${docId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [location.state]);


  const handlePreview = async (
    fileUrl?: string | null,
    fileName?: string | null,
  ) => {
    if (!fileUrl) return; 
    const res = await getPresignedGet({ fileUrl });
    setPreviewUrl(res.downloadUrl);
    setPreviewName(fileName ?? undefined);
    setPreviewOpen(true);
  };

  const handleDownload = async (fileUrl?: string, fileName?: string) => {
    if (!fileUrl) return;
    await forceDownloadPresigned(fileUrl, fileName);
  };

  const getStepIcon = (status: string) => {
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700}>
            Visa Status Management
          </Typography>
          <Typography color="text.secondary">
            Track your OPT / STEM Extension documents
          </Typography>

          <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
            <Chip label="OPT" variant="outlined" />
            <Chip
              label="STEM Extension Eligible"
              color="success"
              variant="outlined"
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" fontWeight={600}>
              Overall Progress: {completedSteps} / {steps.length}
            </Typography>
            <Box
              sx={{ mt: 1, height: 8, bgcolor: "grey.200", borderRadius: 4 }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${(completedSteps / steps.length) * 100}%`,
                  bgcolor: "success.main",
                  borderRadius: 4,
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
        You must complete each step in order. The next step unlocks after HR
        approval.
      </Alert>

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => {
              const isCurrentActive = index === activeStep;
              const isLocked = index > activeStep;

              return (
                <Step key={step.type} completed={step.status === "approved"}>
                  <StepLabel
                    icon={getStepIcon(step.status)}
                    optional={
                      <StatusChip
                        status={isLocked ? "inactive" : step.status}
                        size="small"
                      />
                    }
                  >
                    <Typography fontWeight={600}>{step.title}</Typography>
                  </StepLabel>

                  <StepContent>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {step.description}
                    </Typography>

                    {step.status === "rejected" && step.hrFeedback && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {step.hrFeedback}
                      </Alert>
                    )}

                    {step.fileName ? (
                      <Paper sx={{ p: 2, display: "flex", gap: 2 }}>
                        <DocIcon />
                        <Box sx={{ flex: 1 }}>
                          <Typography>{step.fileName}</Typography>
                          <Typography variant="caption">
                            Uploaded at {step.uploadedAt}
                          </Typography>
                        </Box>
                        <IconButton
                          onClick={() =>
                            handlePreview(
                              step.fileUrl ?? undefined,
                              step.fileName ?? undefined,
                            )
                          }
                        >
                          <PreviewIcon />
                        </IconButton>
                        <IconButton
                          onClick={() =>
                            handleDownload(
                              step.fileUrl ?? undefined,
                              step.fileName ?? undefined,
                            )
                          }
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Paper>
                    ) : (
                      isCurrentActive && (
                        <FileUpload
                          label={`Upload ${step.title}`}
                          disabled={isUploading}
                          onFileSelect={(file) =>
                            uploadDocument(step.type, file)
                          }
                        />
                      )
                    )}

                    {isLocked && (
                      <Typography variant="caption" color="error">
                        Waiting for previous step approval.
                      </Typography>
                    )}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </CardContent>
      </Card>

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={previewUrl}
        fileName={previewName}
      />
    </Box>
  );
};;

export default VisaStatus;
