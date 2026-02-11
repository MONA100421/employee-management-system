import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

import { useAuth } from "../../contexts/useAuth";
import StatusChip from "../../components/common/StatusChip";
import { useDocuments } from "../../hooks/useDocuments";
import { getMyOnboarding } from "../../lib/onboarding";

import { useEffect, useState } from "react";
import type { UIOnboardingStatus } from "../../lib/onboarding";
import { useNotifications } from "../../hooks/useNotifications";

const EmployeeDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  // Onboarding
  const [onboardingStatus, setOnboardingStatus] =
    useState<UIOnboardingStatus>("never-submitted");

  useEffect(() => {
    (async () => {
      try {
        const app = await getMyOnboarding();
        setOnboardingStatus(app.status);
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

  const visaTotal = visaDocs.length || 4;

  // Dashboard cards
  const dashboardCards = [
    {
      title: "Personal Information",
      description: "View and update your profile details",
      icon: <PersonIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
      status: "completed" as const,
      link: "/employee/personal-info",
    },
    {
      title: "Onboarding Application",
      description: "Complete your onboarding process",
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
      status: onboardingStatus,
      link: "/employee/onboarding",
    },
    {
      title: "Visa Status",
      description: "Track your visa application progress",
      icon: <DescriptionIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.warning.main,
      status: visaApprovedCount === visaTotal ? "approved" : "in-progress",
      link: "/employee/visa-status",
    },
  ];

  // Onboarding Progress
  const onboardingProgress = Math.round((visaApprovedCount / visaTotal) * 100);

  // Recent Activity
  const { notifications } = useNotifications();

  const recentActivity = notifications.map((n) => ({
    action: n.message,
    date: new Date(n.createdAt).toLocaleDateString(),
    icon: <CheckIcon />,
    color: theme.palette.success.main,
  }));

  // Action Required
  const firstPending = visaDocs.find((d) => d.status !== "approved");

  if (loading) {
    return <Typography>Loading dashboard…</Typography>;
  }

  return (
    <Box>
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
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography
                variant="h4"
                sx={{ color: "white", fontWeight: 700, mb: 0.5 }}
              >
                Welcome back, {user?.firstName}!
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                Here's an overview of your employee portal
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {dashboardCards.map((card) => (
          <Grid size={{ xs: 12, sm: 4 }} key={card.title}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => (window.location.href = card.link)}
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
                  {card.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Progress and Activity */}
      <Grid container spacing={3}>
        {/* Onboarding Progress */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
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
                    Overall completion
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
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Recent Activity
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentActivity.length === 0 ? (
                  <Typography color="text.secondary">
                    No recent activity
                  </Typography>
                ) : (
                  recentActivity.map((activity, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        bgcolor: theme.palette.background.default,
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: `${activity.color}15`,
                          color: activity.color,
                        }}
                      >
                        {activity.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={500}>
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

      {/* Action Required */}
      {firstPending && (
        <Card
          sx={{
            mt: 3,
            bgcolor: theme.palette.warning.main + "10",
            border: `1px solid ${theme.palette.warning.main}30`,
          }}
        >
          <CardContent sx={{ display: "flex", gap: 2 }}>
            <WarningIcon sx={{ color: theme.palette.warning.main }} />
            <Box>
              <Typography fontWeight={600}>Action Required</Typography>
              <Typography color="text.secondary">
                Your {firstPending.type} document is pending upload or approval.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default EmployeeDashboard;
