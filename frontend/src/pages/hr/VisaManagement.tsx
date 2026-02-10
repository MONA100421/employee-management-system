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

type HRVisaDocument = {
  id: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  fileName?: string;
  fileUrl?: string;
  uploadedAt?: string;
  hrFeedback?: string | null;
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/documents/hr/visa");
        const data = await res.json();
        setDocuments(data.documents ?? []);
      } catch (err) {
        console.error("Failed to load visa documents", err);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
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
      await fetch(`/api/documents/${feedbackDialog.record.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: feedbackDialog.type === "approve" ? "approved" : "rejected",
          feedback,
        }),
      });
      // reload
      const res = await fetch("/api/documents/hr/visa");
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } catch (err) {
      console.error("Failed to review document", err);
    } finally {
      setFeedbackDialog({ open: false, type: "approve", record: null });
    }
  };

  // Preview / Download handlers for HR
  const handlePreview = async (doc: HRVisaDocument) => {
    if (!doc.fileUrl) {
      console.warn("No fileUrl for preview");
      return;
    }
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
    if (!doc.fileUrl) {
      console.warn("No fileUrl for download");
      return;
    }
    try {
      await forceDownloadPresigned(doc.fileUrl, doc.fileName);
    } catch (err) {
      console.error("Download failed", err);
      try {
        const res = await getPresignedGet({ fileUrl: doc.fileUrl });
        window.open(res.downloadUrl, "_blank");
      } catch (err2) {
        console.error("Fallback failed", err2);
      }
    }
  };

  // UI mapping
  const inProgress = documents.filter((d) => d.status === "pending");
  const shownRecords = tabValue === 0 ? inProgress : documents;

  return (
    <Box>
      {/* Header */}
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

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label={`In Progress (${inProgress.length})`} />
            <Tab label={`All (${documents.length})`} />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Visa Type</TableCell>
                <TableCell>Current Step</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shownRecords.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                        {record.user?.username
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>
                          {record.user?.username ?? "Unknown"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.user?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip label={record.type} size="small" variant="outlined" />
                  </TableCell>

                  <TableCell>{record.type}</TableCell>

                  <TableCell>
                    <StatusChip status={record.status} size="small" />
                  </TableCell>

                  <TableCell align="right">
                    {record.status === "pending" && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Preview document">
                          <IconButton
                            size="small"
                            onClick={() => handlePreview(record)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download document">
                          <IconButton
                            size="small"
                            onClick={() => handleDownload(record)}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            sx={{ color: theme.palette.success.main }}
                            onClick={() => handleApprove(record)}
                          >
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            sx={{ color: theme.palette.error.main }}
                            onClick={() => handleReject(record)}
                          >
                            <RejectIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {record.type === "i_983" && (
                          <Tooltip title="Send Notification">
                            <IconButton size="small" color="primary">
                              <SendIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {shownRecords.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              {loading ? "Loading..." : "No records found"}
            </Typography>
          </Box>
        )}
      </Card>

      <PreviewDialog
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewUrl(undefined);
          setPreviewName(undefined);
        }}
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
        onCancel={() =>
          setFeedbackDialog({ open: false, type: "approve", record: null })
        }
      />
    </Box>
  );
};

export default VisaManagement;
