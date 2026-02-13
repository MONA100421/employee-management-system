import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  Avatar,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  People as PeopleIcon,
  Badge as BadgeIcon,
  AssignmentTurnedIn as ApprovedIcon,
  HourglassTop as PendingIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { useDocuments } from "../../hooks/useDocuments";
import { useNotifications } from "../../hooks/useNotifications";
import api from "../../lib/api";
import type { DashboardNotification } from "../../types/notification";

const HRDashboard: React.FC = () => {
  const theme = useTheme();

  // Documents (real data)
  const { documents, loading } = useDocuments("all");

  const { notifications } = useNotifications();
  const recentActivity = notifications;

  const [now] = useState<number>(() => Date.now());

  const pendingDocs = useMemo(
    () => documents.filter((d) => d.status === "pending"),
    [documents],
  );

  const pendingOnboardingCount = pendingDocs.filter(
    (d) => d.category === "onboarding",
  ).length;

  const pendingVisaCount = pendingDocs.filter(
    (d) => d.category === "visa",
  ).length;

  const approvedThisWeek = useMemo(() => {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return documents.filter((d) => {
      if (d.status !== "approved" || !d.reviewedAt) return false;
      const reviewedTime = new Date(d.reviewedAt).getTime();
      return now - reviewedTime <= sevenDaysMs;
    }).length;
  }, [documents, now]);

  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);

  useEffect(() => {
    api
      .get("/hr/employees")
      .then((res) => setTotalEmployees(res.data.employees.length))
      .catch(() => setTotalEmployees(null));
  }, []);

  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees ?? (loading ? "..." : "0"),
      change: "Live data",
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: "Pending Applications",
      value: loading ? "—" : pendingDocs.length.toString(),
      change: loading
        ? "Loading…"
        : `${pendingOnboardingCount} onboarding, ${pendingVisaCount} visa`,
      icon: <PendingIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.warning.main,
    },
    {
      title: "Visa Expiring Soon",
      value: "—",
      change: "Coming soon",
      icon: <BadgeIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.error.main,
    },
    {
      title: "Approved This Week",
      value: approvedThisWeek.toString(),
      change: "Last 7 days",
      icon: <ApprovedIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.success.main,
    },
  ];

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
            <Card>
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
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <TrendingIcon sx={{ color: theme.palette.success.main }} />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}
                >
                  {stat.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <NotificationsIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Recent Activity
                </Typography>
              </Box>

              {recentActivity.length === 0 ? (
                <Typography
                  color="text.secondary"
                  sx={{ py: 2, textAlign: "center" }}
                >
                  No recent activities found.
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxHeight: 400,
                    overflowY: "auto",
                    pr: 1,
                  }}
                >
                  {recentActivity.map(
                    (activity: DashboardNotification, index: number) => (
                      <React.Fragment key={activity.id || index}>
                        <Box
                          sx={{
                            display: "flex",
                            gap: 2,
                            alignItems: "flex-start",
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              width: 32,
                              height: 32,
                              fontSize: "0.875rem",
                            }}
                          >
                            {activity.type?.[0]?.toUpperCase() || "N"}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {activity.message}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(activity.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                        {index < recentActivity.length - 1 && (
                          <Divider sx={{ my: 1 }} />
                        )}
                      </React.Fragment>
                    ),
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HRDashboard;
