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
} from "@mui/icons-material";
import StatusChip from "../../components/common/StatusChip";
import FeedbackDialog from "../../components/common/FeedbackDialog";

import {
  getHROnboardings,
  reviewOnboarding,
  type HROnboardingListItem,
} from "../../lib/onboarding";

// Component

const HiringManagement: React.FC = () => {
  const theme = useTheme();

  const [tabValue, setTabValue] = useState(0);

  // invite token
  const [newHireEmail, setNewHireEmail] = useState("");
  const [newHireName, setNewHireName] = useState("");
  const [tokenGenerated, setTokenGenerated] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");

  // onboarding applications (REAL)
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

  // Load HR onboardings
  const loadApplications = async () => {
    setLoadingApps(true);
    const data = await getHROnboardings();
    setApplications(data);
    setLoadingApps(false);
  };

  useEffect(() => {
    (async () => {
      await loadApplications();
    })();
  }, []);

  // Tabs / filter
  const applicationTabs = ["pending", "approved", "rejected"] as const;

  const filteredApplications = applications.filter(
    (app) => app.status === applicationTabs[tabValue],
  );

  // Invite token (unchanged)
  const handleGenerateToken = () => {
    if (!newHireEmail || !newHireName) return;

    const token = Math.random().toString(36).substring(2, 15);
    const link = `https://ems.company.com/register?token=${token}&email=${encodeURIComponent(
      newHireEmail,
    )}`;
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

  // Review handlers
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

  // UI

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Hiring Management
      </Typography>

      {/* Invite Token  */}
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

      {/* Onboarding Applications */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Onboarding Applications
          </Typography>

          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
            <Tab label={`Pending`} />
            <Tab label={`Approved`} />
            <Tab label={`Rejected`} />
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
                    <TableRow key={app.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            {app.employee?.username?.[0]?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography fontWeight={500}>
                              {app.employee?.username}
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
                          {app.status === "rejected" ? "—" : "-"}
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
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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
