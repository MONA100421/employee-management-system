import React, { useMemo, useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  People as PeopleIcon,
  Badge as BadgeIcon,
  AssignmentTurnedIn as ApprovedIcon,
  HourglassTop as PendingIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { useDocuments } from "../../hooks/useDocuments";
import api from "../../lib/api";

const HRDashboard: React.FC = () => {
  const theme = useTheme();

  // Documents (real data)
  const { documents, loading } = useDocuments("all");

  const [now] = useState<number>(() => Date.now());

  // Pending
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

  // Approved this week (last 7 days)
  const approvedThisWeek = useMemo(() => {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    return documents.filter((d) => {
      if (d.status !== "approved" || !d.reviewedAt) return false;
      const reviewedTime = new Date(d.reviewedAt).getTime();
      return now - reviewedTime <= sevenDaysMs;
    }).length;
  }, [documents, now]);

  // Total employees (real API)
  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);

  useEffect(() => {
    api
      .get("/hr/employees")
      .then((res) => setTotalEmployees(res.data.employees.length))
      .catch(() => setTotalEmployees(null));
  }, []);

  // Dashboard cards
  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees ?? "—",
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
    </Box>
  );
};

export default HRDashboard;
