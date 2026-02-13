import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import StatusChip from "../../components/common/StatusChip";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import PreviewDialog from "../../components/common/PreviewDialog";
import { getPresignedGet } from "../../lib/upload";
import { forceDownloadPresigned } from "../../lib/download";
// IMPORTANT: Import your axios instance
import api from "../../lib/api";

type HRVisaDocument = {
  id: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  fileName?: string;
  fileUrl?: string;
  uploadedAt?: string;
  version?: number;
  hrFeedback?: string | null;
  nextStep?: string;
  daysRemaining?: number | null;
  workAuthTitle?: string;
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
};

const VisaManagement: React.FC = () => {
  const theme = useTheme();
  const [documents, setDocuments] = useState<HRVisaDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [previewName, setPreviewName] = useState<string | undefined>();

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    record: HRVisaDocument | null;
  }>({
    open: false,
    type: "approve",
    record: null,
  });

  // Load all visa documents using the authenticated API instance
  const loadDocuments = async () => {
    setLoading(true);
    try {
      // Replaced fetch with api.get to include JWT token
      const res = await api.get("/documents/hr/visa");
      setDocuments(res.data.documents ?? []);
    } catch (err) {
      console.error("Failed to load visa documents", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleApprove = (record: HRVisaDocument) => {
    setFeedbackDialog({ open: true, type: "approve", record });
  };

  const handleReject = (record: HRVisaDocument) => {
    setFeedbackDialog({ open: true, type: "reject", record });
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    if (!feedbackDialog.record) return;
    try {
      await api.post(`/documents/${feedbackDialog.record.id}/review`, {
        decision: feedbackDialog.type === "approve" ? "approved" : "rejected",
        feedback,
        version: feedbackDialog.record.version,
      });
      setFeedbackDialog({ open: false, type: "approve", record: null });
      await loadDocuments();
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert(
          "This document has been modified by another HR. The list will refresh.",
        );
        await loadDocuments();
        setFeedbackDialog({ open: false, type: "approve", record: null });
      } else {
        console.error("Failed to review document", err);
      }
    }
  };

  const handlePreview = async (doc: HRVisaDocument) => {
    if (!doc.fileUrl) return;
    try {
      const res = await getPresignedGet({ fileUrl: doc.fileUrl });
      setPreviewUrl(res.downloadUrl);
      setPreviewName(doc.fileName);
      setPreviewOpen(true);
    } catch (err) {
      console.error("Failed to get preview URL", err);
      if ((doc.fileUrl || "").startsWith("http")) {
        window.open(doc.fileUrl, "_blank");
      }
    }
  };

  const handleDownload = async (doc: HRVisaDocument) => {
    if (!doc.fileUrl) return;
    try {
      await forceDownloadPresigned(doc.fileUrl, doc.fileName);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const handleSendNotification = async (record: HRVisaDocument) => {
    try {
      await api.post(`/documents/${record.id}/notify`);
      alert(`Notification sent to ${record.user?.username}`);
    } catch (err) {
      console.error("Failed to send notification", err);
      alert("Failed to send notification");
    }
  };

  const inProgress = documents.filter((d) => d.status === "pending");
  const shownRecords = tabValue === 0 ? inProgress : documents;

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            Visa Status Management
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary }}
          >
            Review and manage employee visa documents and applications
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            {/* Added keys to Tabs to prevent warnings */}
            <Tab
              label={`In Progress (${inProgress.length})`}
              key="tab-progress"
            />
            <Tab label={`All (${documents.length})`} key="tab-all" />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Visa Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Next Step</TableCell>
                <TableCell>Time Remaining</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shownRecords.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {record.user?.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>
                          {record.user?.username}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            color: "primary.main",
                            fontWeight: 600,
                          }}
                        >
                          Work Auth: {record.workAuthTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.user?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.type.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={record.status} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: record.status === "pending" ? 700 : 400,
                        color:
                          record.status === "pending"
                            ? "primary.main"
                            : "text.secondary",
                      }}
                    >
                      {record.nextStep || "N/A"}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {typeof record.daysRemaining === "number" ? (
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          color={
                            record.daysRemaining < 30
                              ? "error.main"
                              : "text.primary"
                          }
                        >
                          {record.daysRemaining} days
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          until expiration
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        N/A
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="right">
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      <Tooltip title="Send Notification">
                        <IconButton
                          size="small"
                          sx={{ color: theme.palette.info.main }}
                          onClick={() => handleSendNotification(record)}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Preview">
                        <IconButton
                          size="small"
                          onClick={() => handlePreview(record)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(record)}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {record.status === "pending" && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              sx={{ color: "success.main" }}
                              onClick={() => handleApprove(record)}
                            >
                              <ApproveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              sx={{ color: "error.main" }}
                              onClick={() => handleReject(record)}
                            >
                              <RejectIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {shownRecords.length === 0 && !loading && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">No records found</Typography>
          </Box>
        )}
      </Card>

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fileUrl={previewUrl}
        fileName={previewName}
      />

      <FeedbackDialog
        open={feedbackDialog.open}
        type={feedbackDialog.type}
        title={
          feedbackDialog.type === "approve"
            ? "Approve Document"
            : "Reject Document"
        }
        itemName={
          feedbackDialog.record
            ? `${feedbackDialog.record.user?.username} - ${feedbackDialog.record.type}`
            : ""
        }
        requireFeedback={feedbackDialog.type === "reject"}
        onSubmit={handleFeedbackSubmit}
        onCancel={() => setFeedbackDialog({ ...feedbackDialog, open: false })}
      />
    </Box>
  );
};;

export default VisaManagement;
