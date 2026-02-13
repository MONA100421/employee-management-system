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
  Alert,
  InputAdornment,
  Grid,
  Stack,
} from "@mui/material";
import {
  Send as SendIcon,
  ContentCopy as CopyIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Email as EmailIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import StatusChip from "../../components/common/StatusChip";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import {
  getHROnboardings,
  reviewOnboarding,
  sendInvitation,
  getInvitationHistory,
  type HROnboardingListItem,
  type InvitationRecord,
} from "../../lib/onboarding";
import { useNavigate } from "react-router-dom";

const HiringManagement: React.FC = () => {
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Invitation token states
  const [newHireEmail, setNewHireEmail] = useState("");
  const [newHireName, setNewHireName] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  // Onboarding applications states
  const [applications, setApplications] = useState<HROnboardingListItem[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Invitation history states
  const [inviteHistory, setInviteHistory] = useState<InvitationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    application: HROnboardingListItem | null;
  }>({
    open: false,
    type: "approve",
    application: null,
  });

  const [submitting, setSubmitting] = useState(false);

  // Fetch all onboarding applications
  const loadApplications = async () => {
    setLoadingApps(true);
    try {
      const res: any = await getHROnboardings();

      if (res && res.grouped) {
        const { pending = [], approved = [], rejected = [] } = res.grouped;
        setApplications([...pending, ...approved, ...rejected]);
      } else if (Array.isArray(res)) {
        setApplications(res);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
      setApplications([]);
    } finally {
      setLoadingApps(false);
    }
  };

  // Fetch invitation history
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getInvitationHistory();
      setInviteHistory(data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadApplications();
    loadHistory();
  }, []);

  const applicationTabs = ["pending", "approved", "rejected"] as const;

  const filteredApplications = applications
    .filter((app) => app.status === applicationTabs[tabValue])
    .filter((app) => {
      const query = searchQuery.toLowerCase();
      const username = app.employee?.username?.toLowerCase() || "";
      const email = app.employee?.email?.toLowerCase() || "";

      return username.includes(query) || email.includes(query);
    });



  /**
   * Handles the generation of a registration token and sends the invitation email.
   * Includes error handling to notify HR if the process fails.
   */
  const handleGenerateToken = async () => {
    if (!newHireName || !newHireEmail) {
      alert("Please provide both name and email.");
      return;
    }

    setLoading(true);
    try {
      // API call to generate token and send email
      const res = await sendInvitation(newHireEmail, newHireName);

      if (res.ok) {
        // Notify HR of success and clear the form
        setGeneratedLink(res.registrationLink);
        setTokenGenerated(true);
        alert(`Invitation sent to ${newHireName} successfully!`);
        setNewHireName("");
        setNewHireEmail("");

        // Refresh the invitation history list to show the new record
        loadHistory();
      } else {
        // Handle specific API error responses
        alert(
          res.message ||
            "Failed to send invitation. Please check if the email is already invited.",
        );
      }
    } catch (err: any) {
      // Log the error for debugging
      console.error("handleGenerateToken error:", err);
      const errorMsg =
        err.response?.data?.message ||
        "An unexpected error occurred. Please try again later.";
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
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

  const handleApprove = (app: HROnboardingListItem) => {
    setFeedbackDialog({ open: true, type: "approve", application: app });
  };

  const handleReject = (app: HROnboardingListItem) => {
    setFeedbackDialog({ open: true, type: "reject", application: app });
  };

  // Handles the approval/rejection submission with loading state.
  const handleFeedbackSubmit = async (feedback: string) => {
    if (!feedbackDialog.application) return;

    setSubmitting(true);
    try {
      await reviewOnboarding(
        feedbackDialog.application.id,
        feedbackDialog.type === "approve" ? "approved" : "rejected",
        feedbackDialog.type === "reject" ? feedback : undefined,
        feedbackDialog.application.version,
      );

      setFeedbackDialog({ open: false, type: "approve", application: null });
      await loadApplications();
      alert("Application status updated successfully.");
    } catch (err) {
      console.error("Review submission failed", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Hiring Management
      </Typography>

      <Grid container spacing={3}>
        {/* Registration Token Generation Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                <SendIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Generate Registration Token
                </Typography>
              </Box>

              {!tokenGenerated ? (
                <Box
                  component="form"
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <TextField
                    fullWidth
                    label="New Hire Full Name"
                    value={newHireName}
                    onChange={(e) => setNewHireName(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={newHireEmail}
                    onChange={(e) => setNewHireEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGenerateToken}
                    disabled={loading || !newHireEmail || !newHireName}
                  >
                    Send Invitation Email
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Token sent successfully!
                  </Alert>
                  <Typography variant="caption" color="text.secondary">
                    Registration Link:
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      bgcolor: "action.hover",
                      p: 1,
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                      {generatedLink}
                    </Typography>
                    <IconButton size="small" onClick={handleCopyLink}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Button variant="outlined" fullWidth onClick={handleReset}>
                    Send Another
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Invitation History Table */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
              >
                <HistoryIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Invitation History
                </Typography>
              </Box>
              <TableContainer sx={{ maxHeight: 280 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Recipient</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inviteHistory.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {item.email}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Sent:{" "}
                            {new Date(item.createdAt).toLocaleString([], {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip status={item.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {inviteHistory.length === 0 && !loadingHistory && (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No history
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Onboarding Applications Table */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Onboarding Applications
              </Typography>
              <TextField
                fullWidth
                placeholder="Search employee..."
                sx={{ mb: 2 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Tabs
                value={tabValue}
                onChange={(_, v) => setTabValue(v)}
                sx={{ mb: 2 }}
              >
                {applicationTabs.map((label) => (
                  <Tab label={label.toUpperCase()} key={label} />
                ))}
              </Tabs>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Submitted At</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingApps ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((app) => (
                        <TableRow key={app.id} hover>
                          <TableCell>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {app.employee?.username?.[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {app.employee?.username}
                                </Typography>
                                <Typography variant="caption">
                                  {app.employee?.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {app.submittedAt
                              ? new Date(app.submittedAt).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <StatusChip status={app.status} />
                          </TableCell>
                          <TableCell align="right">
                            {app.status === "pending" && (
                              <Stack direction="row" justifyContent="flex-end">
                                <IconButton
                                  color="success"
                                  onClick={() => handleApprove(app)}
                                >
                                  <ApproveIcon />
                                </IconButton>
                                <IconButton
                                  color="error"
                                  onClick={() => handleReject(app)}
                                >
                                  <RejectIcon />
                                </IconButton>
                              </Stack>
                            )}
                            <IconButton
                              onClick={() =>
                                navigate(`/hr/onboarding/${app.id}`)
                              }
                            >
                              <ViewIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    {!loadingApps && filteredApplications.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No applications found for this status.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reusable Feedback/Approval Dialog */}
      <FeedbackDialog
        open={feedbackDialog.open}
        loading={submitting}
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
