import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  useTheme,
  Alert,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

import { useAuth } from "../../contexts/useAuth";
import StatusChip from "../../components/common/StatusChip";
import { useDocuments } from "../../hooks/useDocuments";
import { getMyOnboarding } from "../../lib/onboarding";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import type { UIOnboardingStatus } from "../../lib/onboarding";
import { useNotifications } from "../../hooks/useNotifications";

const EmployeeDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Onboarding status from single source of truth (Backend Application)
  const [onboardingStatus, setOnboardingStatus] =
    useState<UIOnboardingStatus>("never-submitted");
  const [hrFeedback, setHrFeedback] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const app = await getMyOnboarding();
        setOnboardingStatus(app.status);
        setHrFeedback(app.hrFeedback);
      } catch {
        setOnboardingStatus("never-submitted");
      }
    })();
  }, []);

  // Visa documents
  const { documents: visaDocs, loading } = useDocuments("visa");

  const visaApprovedCount = visaDocs.filter(
    (d) => d.status === "approved",
  ).length;

  const visaTotal = 4; // Expected OPT steps

  // Progress Calculation
  // If approved, 100%. If pending/rejected, base it on form submission + visa progress
  const onboardingProgress =
    onboardingStatus === "approved"
      ? 100
      : onboardingStatus === "never-submitted"
        ? 0
        : 25;

  // Dashboard cards configuration
  const dashboardCards = [
    {
      title: "Personal Information",
      description: "View and update your profile details",
      icon: <PersonIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
      status: onboardingStatus === "approved" ? "completed" : "locked",
      link: "/employee/personal-info",
      disabled: onboardingStatus !== "approved",
    },
    {
      title: "Onboarding Application",
      description: "Complete your onboarding process",
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
      status: onboardingStatus,
      link: "/employee/onboarding",
      disabled: false,
    },
    {
      title: "Visa Status",
      description: "Track your visa application progress",
      icon: <DescriptionIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.warning.main,
      status: visaApprovedCount === visaTotal ? "approved" : "in-progress",
      link: "/employee/visa-status",
      disabled: onboardingStatus !== "approved",
    },
  ];

  const { notifications } = useNotifications();
  const recentActivity = notifications.slice(0, 3).map((n) => ({
    action: n.message,
    date: new Date(n.createdAt).toLocaleDateString(),
    icon: <CheckIcon />,
    color: theme.palette.success.main,
  }));

  const firstPending = visaDocs.find((d) => d.status !== "approved");

  if (loading) {
    return <Typography sx={{ p: 3 }}>Loading dashboard...</Typography>;
  }

  return (
    <Box>
      {/* Critical Status Alerts */}
      {onboardingStatus === "rejected" && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate("/employee/onboarding")}
            >
              EDIT FORM
            </Button>
          }
        >
          <strong>Onboarding Rejected:</strong>{" "}
          {hrFeedback || "Please review your documents and resubmit."}
        </Alert>
      )}

      {onboardingStatus === "pending" && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Your onboarding application is currently under review by HR.
        </Alert>
      )}

      {firstPending && onboardingStatus === "approved" && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Action Required: Your <strong>{firstPending.type}</strong> is
          currently {firstPending.status}.
        </Alert>
      )}

      {/* Welcome Section */}
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        }}
      >
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: "rgba(255,255,255,0.2)",
                fontSize: "1.5rem",
                fontWeight: 700,
              }}
            >
              {user?.username?.[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: 700, mb: 0.5 }}
              >
                Welcome back, {user?.username}!
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                {onboardingStatus === "approved"
                  ? "Your onboarding is complete. You can now manage your visa and profile."
                  : "Please complete your onboarding to unlock all features."}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {dashboardCards.map((card) => (
          <Grid size={{ xs: 12, md: 4 }} key={card.title}>
            <Card
              sx={{
                height: "100%",
                cursor: card.disabled ? "not-allowed" : "pointer",
                opacity: card.disabled ? 0.7 : 1,
                transition: "all 0.2s ease",
                "&:hover": !card.disabled
                  ? {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[4],
                    }
                  : {},
              }}
              onClick={() => !card.disabled && navigate(card.link)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: `${card.color}15`,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                  <StatusChip status={card.status} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {card.disabled
                    ? "Unlock after onboarding approval"
                    : card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Progress Tracker */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Onboarding Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography color="text.secondary">
                    Current Stage: {onboardingStatus}
                  </Typography>
                  <Typography fontWeight={600}>
                    {onboardingProgress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={onboardingProgress}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.palette.grey[200],
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Recent Activity
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentActivity.length === 0 ? (
                  <Typography color="text.secondary">
                    No recent updates
                  </Typography>
                ) : (
                  recentActivity.map((activity, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.5,
                        bgcolor: theme.palette.background.default,
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ color: activity.color }}>{activity.icon}</Box>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.date}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;
