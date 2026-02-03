import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/useAuth';
import StatusChip from '../../components/common/StatusChip';

const EmployeeDashboard: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const dashboardCards = [
    {
      title: 'Personal Information',
      description: 'View and update your profile details',
      icon: <PersonIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
      status: 'completed' as const,
      link: '/employee/personal-info',
    },
    {
      title: 'Onboarding Application',
      description: 'Complete your onboarding process',
      icon: <AssignmentIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
      status: 'approved' as const,
      link: '/employee/onboarding',
    },
    {
      title: 'Visa Status',
      description: 'Track your visa application progress',
      icon: <DescriptionIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.warning.main,
      status: 'in-progress' as const,
      link: '/employee/visa-status',
    },
  ];

  const recentActivity = [
    {
      action: 'OPT Receipt uploaded',
      date: '2 days ago',
      icon: <CheckIcon />,
      color: theme.palette.success.main,
    },
    {
      action: 'Personal information updated',
      date: '1 week ago',
      icon: <PersonIcon />,
      color: theme.palette.primary.main,
    },
    {
      action: 'Visa status updated to In Progress',
      date: '2 weeks ago',
      icon: <ScheduleIcon />,
      color: theme.palette.warning.main,
    },
  ];

  const onboardingProgress = 75;

  return (
    <Box>
      {/* Welcome Section */}
      <Card sx={{ mb: 3, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})` }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              sx={{
                width: 72,
                height: 72,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                Welcome back, {user?.firstName}!
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
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
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                },
              }}
              onClick={() => window.location.href = card.link}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
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
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Onboarding Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Overall completion
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Box sx={{ flex: 1, p: 2, bgcolor: theme.palette.success.main + '15', borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    3
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Steps Completed
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2, bgcolor: theme.palette.warning.main + '15', borderRadius: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    1
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Steps Remaining
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivity.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
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
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: `${activity.color}15`,
                        color: activity.color,
                      }}
                    >
                      {activity.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {activity.action}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {activity.date}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      <Card sx={{ mt: 3, bgcolor: theme.palette.warning.main + '10', border: `1px solid ${theme.palette.warning.main}30` }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <WarningIcon sx={{ color: theme.palette.warning.main, fontSize: 28 }} />
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              Action Required
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Your EAD document is pending upload. Please upload it to continue your visa process.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeDashboard;
