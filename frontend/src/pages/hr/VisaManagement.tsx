import React, { useState } from "react";
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

interface VisaRecord {
  id: string;
  employeeName: string;
  email: string;
  visaType: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  currentStep: string;
  stepStatus: "pending" | "approved" | "rejected";
  nextAction: string;
}

const mockInProgressRecords: VisaRecord[] = [
  {
    id: "1",
    employeeName: "John Doe",
    email: "john.doe@company.com",
    visaType: "OPT",
    startDate: "2024-01-15",
    endDate: "2025-01-14",
    daysRemaining: 280,
    currentStep: "EAD Card",
    stepStatus: "pending",
    nextAction: "Review EAD document",
  },
  {
    id: "2",
    employeeName: "David Lee",
    email: "david.lee@company.com",
    visaType: "OPT STEM",
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    daysRemaining: 15,
    currentStep: "I-20",
    stepStatus: "pending",
    nextAction: "Review I-20 document",
  },
  {
    id: "3",
    employeeName: "Emma Chen",
    email: "emma.chen@company.com",
    visaType: "OPT",
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    daysRemaining: 320,
    currentStep: "I-983",
    stepStatus: "pending",
    nextAction: "Review I-983 form",
  },
];

const mockAllRecords: VisaRecord[] = [
  ...mockInProgressRecords,
  {
    id: "4",
    employeeName: "Sarah Miller",
    email: "sarah.miller@company.com",
    visaType: "Green Card",
    startDate: "2020-03-15",
    endDate: "2030-03-14",
    daysRemaining: 2200,
    currentStep: "Complete",
    stepStatus: "approved",
    nextAction: "-",
  },
  {
    id: "5",
    employeeName: "Michael Chen",
    email: "michael.chen@company.com",
    visaType: "H1-B",
    startDate: "2022-10-01",
    endDate: "2025-09-30",
    daysRemaining: 600,
    currentStep: "Complete",
    stepStatus: "approved",
    nextAction: "-",
  },
];

const VisaManagement: React.FC = () => {
  const theme = useTheme();
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

  const records = tabValue === 0 ? mockInProgressRecords : mockAllRecords;

  const handleApprove = (record: VisaRecord) => {
    setFeedbackDialog({ open: true, type: "approve", record });
  };

  const handleReject = (record: VisaRecord) => {
    setFeedbackDialog({ open: true, type: "reject", record });
  };

  const handleFeedbackSubmit = (feedback: string) => {
    console.log(
      `${feedbackDialog.type}d:`,
      feedbackDialog.record?.employeeName,
      "Feedback:",
      feedback,
    );
    setFeedbackDialog({ open: false, type: "approve", record: null });
  };

  const getDaysRemainingColor = (days: number) => {
    if (days <= 30) return theme.palette.error.main;
    if (days <= 90) return theme.palette.warning.main;
    return theme.palette.success.main;
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
            <Tab label={`In Progress (${mockInProgressRecords.length})`} />
            <Tab label={`All (${mockAllRecords.length})`} />
          </Tabs>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Visa Type</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Days Remaining</TableCell>
                <TableCell>Current Step</TableCell>
                <TableCell>Next Action</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          width: 36,
                          height: 36,
                        }}
                      >
                        {record.employeeName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {record.employeeName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
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
                  <TableCell>{record.startDate}</TableCell>
                  <TableCell>{record.endDate}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: getDaysRemainingColor(record.daysRemaining),
                      }}
                    >
                      {record.daysRemaining} days
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2">
                        {record.currentStep}
                      </Typography>
                      <StatusChip status={record.stepStatus} size="small" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {record.nextAction}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {record.stepStatus === "pending" && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title="View Document">
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
                        {record.currentStep === "I-983" && (
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

        {records.length === 0 && (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography
              variant="body1"
              sx={{ color: theme.palette.text.secondary }}
            >
              No records found
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
