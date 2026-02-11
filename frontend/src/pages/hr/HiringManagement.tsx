import React, { useEffect, useState } from "react";
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
  Email as EmailIcon,
  Link as LinkIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import StatusChip from "../../components/common/StatusChip";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import {
  getHROnboardings,
  reviewOnboarding,
  type HROnboardingListItem,
} from "../../lib/onboarding";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

// Component

// ... (imports remain the same)

const HiringManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);

  // Invitation token states
  const [newHireEmail, setNewHireEmail] = useState("");
  const [newHireName, setNewHireName] = useState("");
  const [tokenGenerated, setTokenGenerated] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  // Onboarding applications states
  const [applications, setApplications] = useState<HROnboardingListItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    application: HROnboardingListItem | null;
  }>({
    open: false,
    type: "approve",
    application: null,
  });

  // Load all onboarding applications for HR
  const loadApplications = async () => {
    setLoadingApps(true);
    const data = await getHROnboardings();
    setApplications(data);
    setLoadingApps(false);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  // Filter applications based on selected tab
  const applicationTabs = ["pending", "approved", "rejected"] as const;

  const filteredApplications = applications.filter(
    (app) => app.status === applicationTabs[tabValue],
  );

  // Request backend to generate token and send email
  const handleGenerateToken = async () => {
    if (!newHireEmail || !newHireName) return;

    try {
      const response = await api.post("/hr/invite", {
        email: newHireEmail,
        name: newHireName,
      });

      const { registrationLink } = response.data;
      setGeneratedLink(registrationLink);
      setTokenGenerated(true);
    } catch (error) {
      console.error("Failed to generate token:", error);
      alert("Failed to send invitation. Please check backend logs.");
    }
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

  // Approval/Rejection handlers
  const handleApprove = (app: HROnboardingListItem) => {
    setFeedbackDialog({ open: true, type: "approve", application: app });
  };

  const handleReject = (app: HROnboardingListItem) => {
    setFeedbackDialog({ open: true, type: "reject", application: app });
  };

  const handleFeedbackSubmit = async (feedback: string) => {
    if (!feedbackDialog.application) return;

    await reviewOnboarding(
      feedbackDialog.application.id,
      feedbackDialog.type === "approve" ? "approved" : "rejected",
      feedbackDialog.type === "reject" ? feedback : undefined,
    );

    setFeedbackDialog({ open: false, type: "approve", application: null });
    await loadApplications();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Hiring Management
      </Typography>

      {/* Invitation Token Section */}
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
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {generatedLink}
                </Typography>
                <Tooltip title="Copy link">
                  <IconButton onClick={handleCopyLink}>
                    <CopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Button variant="outlined" onClick={handleReset}>
                Generate Another
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Onboarding Applications Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Onboarding Applications
          </Typography>

          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            {/* Added explicit keys to Tabs to prevent warnings */}
            {applicationTabs.map((label, index) => (
              <Tab label={label.charAt(0).toUpperCase() + label.slice(1)} key={`tab-${label}`} />
            ))}
          </Tabs>

          {loadingApps ? (
            <Typography sx={{ mt: 2 }}>Loading…</Typography>
          ) : (
            <TableContainer sx={{ mt: 2 }}>
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
                    // Ensure app.id is unique; fallback to index if absolutely necessary
                    <TableRow key={app.id || app.employee?.email} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            {app.employee?.username?.[0]?.toUpperCase() || "U"}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={500}>
                              {app.employee?.username || "Unknown"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {app.employee?.email}
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
                          {app.status === "rejected" ? "Review required" : "-"}
                        </TableCell>
                      )}
                      <TableCell align="right">
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
                            <Tooltip title="View Application">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  navigate(`/hr/onboarding/${app.id}`)
                                }
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredApplications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        No applications found for this status.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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
        itemName={feedbackDialog.application?.employee?.username}
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
