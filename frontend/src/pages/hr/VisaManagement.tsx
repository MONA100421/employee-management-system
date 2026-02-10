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
import api from "../../lib/api";

// HR-facing document shape returned by GET /documents/hr/visa
type HRVisaDocument = {
  id: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  fileName?: string;
  uploadedAt?: string;
  hrFeedback?: string | null;
  user: {
    id: string;
    username: string;
    email: string;
  } | null;
};

type VisaRecord = {
  id: string;
  employeeName: string;
  email: string;
  visaType: string;
  currentStep: string;
  stepStatus: "pending" | "approved" | "rejected";
};

const VisaManagement: React.FC = () => {
  const theme = useTheme();
  const [documents, setDocuments] = useState<HRVisaDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    record: VisaRecord | null;
  }>({
    open: false,
    type: "approve",
    record: null,
  });

  // load visa documents for HR
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/documents/hr/visa");
        setDocuments(res.data.documents ?? []);
      } catch (err) {
        console.error("Failed to load visa documents", err);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // map backend docs -> UI rows
  const records: VisaRecord[] = documents.map((d) => ({
    id: d.id,
    employeeName: d.user?.username ?? "Unknown",
    email: d.user?.email ?? "",
    visaType: d.type,
    currentStep: d.type,
    stepStatus: d.status,
  }));

  const inProgress = records.filter((r) => r.stepStatus === "pending");
  const shownRecords = tabValue === 0 ? inProgress : records;

  const handleApprove = (record: VisaRecord) => {
    setFeedbackDialog({ open: true, type: "approve", record });
  };

  const handleReject = (record: VisaRecord) => {
    setFeedbackDialog({ open: true, type: "reject", record });
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    if (!feedbackDialog.record) return;

    try {
      await api.post(`/documents/${feedbackDialog.record.id}/review`, {
        decision: feedbackDialog.type === "approve" ? "approved" : "rejected",
        feedback,
      });

      // reload
      const res = await api.get("/documents/hr/visa");
      setDocuments(res.data.documents ?? []);
    } catch (err) {
      console.error("Failed to review document", err);
    } finally {
      setFeedbackDialog({ open: false, type: "approve", record: null });
    }
  };

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
            <Tab label={`All (${records.length})`} />
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
                        {record.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={500}>
                          {record.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {record.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={record.visaType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>{record.currentStep}</TableCell>

                  <TableCell>
                    <StatusChip status={record.stepStatus} size="small" />
                  </TableCell>

                  <TableCell align="right">
                    {record.stepStatus === "pending" && (
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="View">
                          <IconButton size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small">
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
                        {record.currentStep === "i_983" && (
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
            ? `${feedbackDialog.record.employeeName} - ${feedbackDialog.record.currentStep}`
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
