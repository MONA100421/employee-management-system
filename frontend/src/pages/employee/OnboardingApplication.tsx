import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  useTheme,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  CheckCircle as CheckIcon,
  Schedule as PendingIcon,
  Cancel as RejectedIcon,
  Send as SendIcon,
} from '@mui/icons-material';

import StatusChip from '../../components/common/StatusChip';
import type { StatusType } from '../../components/common/StatusChip';
import FileUpload from '../../components/common/FileUpload';

import {
  getMyOnboarding,
  submitOnboarding,
} from '../../lib/onboarding';
import type { UIOnboardingStatus } from '../../lib/onboarding';

const steps = ['Personal Info', 'Address', 'Work Authorization', 'Documents', 'Review'];

const Onboarding: React.FC = () => {
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<UIOnboardingStatus>('never-submitted');
  const [activeStep, setActiveStep] = useState(0);
  const [rejectionFeedback, setRejectionFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    preferredName: '',
    ssn: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    workAuthType: '',
    workAuthOther: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ===== Load onboarding from API =====
  useEffect(() => {
    const load = async () => {
      try {
        const app = await getMyOnboarding();
        setStatus(app.status);
        setRejectionFeedback(app.hrFeedback);
        if (app.formData) {
          setFormData((prev) => ({ ...prev, ...app.formData }));
        }
      } catch (err) {
        console.error('Failed to load onboarding', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }
    };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.ssn) newErrors.ssn = 'SSN is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    } else if (step === 1) {
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      const res = await submitOnboarding(formData);
      if (res.ok) {
        setStatus(res.status);
      }
    } catch (err) {
      console.error('Submit onboarding failed', err);
    }
  };

  const getStatusBanner = () => {
    switch (status) {
      case 'pending':
        return (
          <Alert severity="info" icon={<PendingIcon />} sx={{ mb: 3 }}>
            <Typography fontWeight={600}>Application Pending Review</Typography>
            <Typography>Your onboarding application is under HR review.</Typography>
          </Alert>
        );
      case 'approved':
        return (
          <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
            <Typography fontWeight={600}>Application Approved</Typography>
            <Typography>Welcome to the team!</Typography>
          </Alert>
        );
      case 'rejected':
        return (
          <Alert severity="error" icon={<RejectedIcon />} sx={{ mb: 3 }}>
            <Typography fontWeight={600}>Application Rejected</Typography>
            <Typography>{rejectionFeedback}</Typography>
          </Alert>
        );
      default:
        return null;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={formData.firstName}
                onChange={handleChange('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={formData.lastName}
                onChange={handleChange('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Address"
                required
                value={formData.address}
                onChange={handleChange('address')}
                error={!!errors.address}
                helperText={errors.address}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Work Authorization Type"
                value={formData.workAuthType}
                onChange={handleChange('workAuthType')}
              />
            </Grid>
          </Grid>
        );
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FileUpload label="Driver's License / ID" onFileSelect={() => {}} />
            </Grid>
          </Grid>
        );
      case 4:
        return (
          <Alert severity="info">
            Please review your information before submitting.
          </Alert>
        );
      default:
        return null;
    }
  };

  // ===== Loading =====
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // ===== Pending / Approved =====
  if (status === 'pending' || status === 'approved') {
    return (
      <Box>
        {getStatusBanner()}
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            {status === 'pending' ? (
              <PendingIcon sx={{ fontSize: 64, color: theme.palette.info.main }} />
            ) : (
              <CheckIcon sx={{ fontSize: 64, color: theme.palette.success.main }} />
            )}
            <Typography variant="h5" fontWeight={600} mt={2}>
              {status === 'pending' ? 'Under Review' : 'Onboarding Complete'}
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ===== Form =====
  return (
    <Box>
      {getStatusBanner()}

      <Card>
        <CardContent>
          <Box mb={4}>
            <Box display="flex" justifyContent="space-between" mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Onboarding Application
              </Typography>
              <StatusChip status={status as StatusType} />
            </Box>

            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Box sx={{ minHeight: 260, mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box display="flex" justifyContent="space-between">
            <Button onClick={handleBack} disabled={activeStep === 0} variant="outlined">
              Back
            </Button>
            {activeStep === steps.length - 1 ? (
              <Button variant="contained" onClick={handleSubmit} startIcon={<SendIcon />}>
                Submit Application
              </Button>
            ) : (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Onboarding;
