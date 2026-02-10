import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  People as PeopleIcon,
  Badge as BadgeIcon,
  AssignmentTurnedIn as ApprovedIcon,
  HourglassTop as PendingIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { useDocuments } from "../../hooks/useDocuments";
import DocumentList from "../../components/common/DocumentList";
import HRDashboardMetrics from "./HRDashboardMetrics";

const HRDashboard: React.FC = () => {
  const theme = useTheme();

  const { documents, loading } = useDocuments("all");

  const pendingDocs = documents.filter((d) => d.status === "pending");
  const pendingOnboardingCount = pendingDocs.filter(
    (d) => d.category === "onboarding",
  ).length;
  const pendingVisaCount = pendingDocs.filter(
    (d) => d.category === "visa",
  ).length;

  const stats = [
    {
      title: "Total Employees",
      value: "156",
      change: "+12 this month",
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
      value: "5",
      change: "Within 90 days",
      icon: <BadgeIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.error.main,
    },
    {
      title: "Approved This Week",
      value: "12",
      change: "+20% vs last week",
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

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Performance Metrics
        </Typography>
        <HRDashboardMetrics />
      </Box>
      
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Pending Documents
          </Typography>

          {pendingDocs.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No pending documents 🎉
            </Typography>
          )}

          <DocumentList documents={pendingDocs} readonly />
        </CardContent>
      </Card>
    </Box>
  );
};

export default HRDashboard;
