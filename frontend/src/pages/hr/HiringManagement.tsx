import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  useTheme,
  InputAdornment,
} from "@mui/material";
import {
  Send as SendIcon,
  ContentCopy as CopyIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  Link as LinkIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import StatusChip from "../../components/common/StatusChip";
import FeedbackDialog from "../../components/common/FeedbackDialog";

interface TokenRecord {
  id: string;
  email: string;
  name: string;
  link: string;
  status: "sent" | "used" | "expired";
  createdAt: string;
  expiresAt: string;
}

interface OnboardingApplication {
  id: string;
  name: string;
  email: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  feedback?: string;
}

const mockTokens: TokenRecord[] = [
  {
    id: "1",
    email: "alice.johnson@company.com",
    name: "Alice Johnson",
    link: "https://ems.company.com/register?token=abc123",
    status: "used",
    createdAt: "2024-01-10",
    expiresAt: "2024-01-17",
  },
  {
    id: "2",
    email: "bob.smith@company.com",
    name: "Bob Smith",
    link: "https://ems.company.com/register?token=def456",
    status: "sent",
    createdAt: "2024-01-15",
    expiresAt: "2024-01-22",
  },
  {
    id: "3",
    email: "carol.white@company.com",
    name: "Carol White",
    link: "https://ems.company.com/register?token=ghi789",
    status: "expired",
    createdAt: "2024-01-01",
    expiresAt: "2024-01-08",
  },
];

const mockApplications: OnboardingApplication[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@company.com",
    submittedAt: "2024-01-12",
    status: "pending",
  },
  {
    id: "2",
    name: "David Lee",
    email: "david.lee@company.com",
    submittedAt: "2024-01-14",
    status: "pending",
  },
  {
    id: "3",
    name: "Emma Chen",
    email: "emma.chen@company.com",
    submittedAt: "2024-01-08",
    status: "approved",
  },
  {
    id: "4",
    name: "Frank Garcia",
    email: "frank.garcia@company.com",
    submittedAt: "2024-01-05",
    status: "rejected",
    feedback: "Missing work authorization documents",
  },
];

const HiringManagement: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [newHireEmail, setNewHireEmail] = useState("");
  const [newHireName, setNewHireName] = useState("");
  const [tokenGenerated, setTokenGenerated] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    application: OnboardingApplication | null;
  }>({
    open: false,
    type: "approve",
    application: null,
  });

  const applicationTabs = ["pending", "approved", "rejected"];
  const filteredApplications = mockApplications.filter(
    (app) => app.status === applicationTabs[tabValue],
  );

  const handleGenerateToken = () => {
    if (!newHireEmail || !newHireName) return;

    const token = Math.random().toString(36).substring(2, 15);
    const link = `https://ems.company.com/register?token=${token}&email=${encodeURIComponent(newHireEmail)}`;
    setGeneratedLink(link);
    setTokenGenerated(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
  };

  const handleReset = () => {
    setNewHireEmail("");
    setNewHireName("");
    setTokenGenerated(false);
    setGeneratedLink("");
  };

  const handleApprove = (app: OnboardingApplication) => {
    setFeedbackDialog({ open: true, type: "approve", application: app });
  };

  const handleReject = (app: OnboardingApplication) => {
    setFeedbackDialog({ open: true, type: "reject", application: app });
  };

  const handleFeedbackSubmit = (feedback: string) => {
    console.log(
      `${feedbackDialog.type}d:`,
      feedbackDialog.application?.name,
      "Feedback:",
      feedback,
    );
    setFeedbackDialog({ open: false, type: "approve", application: null });
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Hiring Management
      </Typography>

      {/* Generate Token Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
              }}
            >
              <SendIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Generate Registration Token
            </Typography>
          </Box>

          {!tokenGenerated ? (
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "flex-start",
              }}
            >
              <TextField
                label="Full Name"
                value={newHireName}
                onChange={(e) => setNewHireName(e.target.value)}
                sx={{ minWidth: 200, flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Email Address"
                type="email"
                value={newHireEmail}
                onChange={(e) => setNewHireEmail(e.target.value)}
                sx={{ minWidth: 250, flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={handleGenerateToken}
                disabled={!newHireEmail || !newHireName}
                sx={{ height: 56 }}
              >
                Generate & Send Token
              </Button>
            </Box>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Registration token generated successfully!
              </Alert>
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.background.default,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 2,
                }}
              >
                <LinkIcon sx={{ color: theme.palette.primary.main }} />
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {generatedLink}
                </Typography>
                <Tooltip title="Copy link">
                  <IconButton onClick={handleCopyLink}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary, mb: 2 }}
              >
                Sent to: <strong>{newHireName}</strong> ({newHireEmail})
              </Typography>
              <Button variant="outlined" onClick={handleReset}>
                Generate Another
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Token History */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: `${theme.palette.secondary.main}15`,
                color: theme.palette.secondary.main,
              }}
            >
              <HistoryIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Token History
            </Typography>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Registration Link</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockTokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {token.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {token.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {token.link}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigator.clipboard.writeText(token.link)
                          }
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{token.createdAt}</TableCell>
                    <TableCell>{token.expiresAt}</TableCell>
                    <TableCell>
                      <StatusChip status={token.status} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Onboarding Applications */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Onboarding Applications
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
              <Tab
                label={`Pending (${mockApplications.filter((a) => a.status === "pending").length})`}
              />
              <Tab
                label={`Approved (${mockApplications.filter((a) => a.status === "approved").length})`}
              />
              <Tab
                label={`Rejected (${mockApplications.filter((a) => a.status === "rejected").length})`}
              />
            </Tabs>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Status</TableCell>
                  {tabValue === 2 && <TableCell>Feedback</TableCell>}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: theme.palette.primary.main,
                            width: 36,
                            height: 36,
                          }}
                        >
                          {app.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {app.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            {app.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{app.submittedAt}</TableCell>
                    <TableCell>
                      <StatusChip status={app.status} />
                    </TableCell>
                    {tabValue === 2 && (
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {app.feedback || "-"}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          justifyContent: "flex-end",
                        }}
                      >
                        <Tooltip title="View Application">
                          <IconButton size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {app.status === "pending" && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                sx={{ color: theme.palette.success.main }}
                                onClick={() => handleApprove(app)}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                sx={{ color: theme.palette.error.main }}
                                onClick={() => handleReject(app)}
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
              </TableBody>
            </Table>
          </TableContainer>

          {filteredApplications.length === 0 && (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary }}
              >
                No {applicationTabs[tabValue]} applications
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <FeedbackDialog
        open={feedbackDialog.open}
        type={feedbackDialog.type}
        title={
          feedbackDialog.type === "approve"
            ? "Approve Application"
            : "Reject Application"
        }
        itemName={feedbackDialog.application?.name}
        requireFeedback={feedbackDialog.type === "reject"}
        onSubmit={handleFeedbackSubmit}
        onCancel={() =>
          setFeedbackDialog({ open: false, type: "approve", application: null })
        }
      />
    </Box>
  );
};

export default HiringManagement;
