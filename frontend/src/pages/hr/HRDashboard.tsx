import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  AvatarGroup,
  useTheme,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  People as PeopleIcon,
  Badge as BadgeIcon,
  AssignmentTurnedIn as ApprovedIcon,
  HourglassTop as PendingIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import StatusChip from '../../components/common/StatusChip';

const HRDashboard: React.FC = () => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Total Employees',
      value: '156',
      change: '+12 this month',
      icon: <PeopleIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Pending Applications',
      value: '8',
      change: '3 onboarding, 5 visa',
      icon: <PendingIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Visa Expiring Soon',
      value: '5',
      change: 'Within 90 days',
      icon: <BadgeIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.error.main,
    },
    {
      title: 'Approved This Week',
      value: '12',
      change: '+20% vs last week',
      icon: <ApprovedIcon sx={{ fontSize: 28 }} />,
      color: theme.palette.success.main,
    },
  ];

  const pendingOnboarding = [
    { name: 'Alice Johnson', email: 'alice@company.com', submittedAt: '2 hours ago' },
    { name: 'Bob Smith', email: 'bob@company.com', submittedAt: '5 hours ago' },
    { name: 'Carol White', email: 'carol@company.com', submittedAt: '1 day ago' },
  ];

  const visaAlerts = [
    { name: 'David Lee', visaType: 'OPT', expiresIn: '15 days', step: 'EAD Pending' },
    { name: 'Emma Chen', visaType: 'H1-B', expiresIn: '45 days', step: 'Transfer' },
    { name: 'Frank Garcia', visaType: 'OPT STEM', expiresIn: '60 days', step: 'I-20 Needed' },
  ];

  const recentActivity = [
    { action: 'Approved onboarding for Sarah Miller', time: '10 min ago', type: 'approved' },
    { action: 'Rejected visa document for Mike Johnson', time: '1 hour ago', type: 'rejected' },
    { action: 'Generated token for new hire', time: '2 hours ago', type: 'pending' },
    { action: 'Approved EAD for Lisa Wang', time: '3 hours ago', type: 'approved' },
  ];

  return (
    <Box>
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 500 }}>
                  {stat.title}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Pending Onboarding */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Pending Onboarding Applications
                </Typography>
                <StatusChip status="pending" />
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {pendingOnboarding.map((applicant, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      bgcolor: theme.palette.background.default,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {applicant.name.split(' ').map((n) => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {applicant.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {applicant.email}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {applicant.submittedAt}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Visa Alerts */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Visa Expiration Alerts
                </Typography>
                <StatusChip status="in-progress" />
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {visaAlerts.map((alert, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      bgcolor: theme.palette.background.default,
                      borderRadius: 2,
                      border: `1px solid ${parseInt(alert.expiresIn) <= 30 ? theme.palette.error.main : theme.palette.warning.main}30`,
                    }}
                  >
                    <Avatar sx={{ bgcolor: parseInt(alert.expiresIn) <= 30 ? theme.palette.error.main : theme.palette.warning.main }}>
                      {alert.name.split(' ').map((n) => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {alert.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {alert.visaType} • {alert.step}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: parseInt(alert.expiresIn) <= 30 ? theme.palette.error.main : theme.palette.warning.main,
                        }}
                      >
                        {alert.expiresIn}
                      </Typography>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        until expiration
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12 }}>
          <Card>
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
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor:
                          activity.type === 'approved'
                            ? theme.palette.success.main
                            : activity.type === 'rejected'
                            ? theme.palette.error.main
                            : theme.palette.warning.main,
                      }}
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {activity.time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HRDashboard;
