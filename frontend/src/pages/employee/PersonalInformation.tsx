import { Grid, TextField, MenuItem } from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import type { OnboardingFormValues } from "./onboarding.schema";

type Props = {
  control: Control<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
};

export default function PersonalInformation({ control, errors }: Props) {
  return (
    <Grid container spacing={3}>
      {/* First Name */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="First Name"
              required
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          )}
        />
      </Grid>

      {/* Last Name */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Last Name"
              required
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />
      </Grid>

      {/* Middle Name */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="middleName"
          control={control}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Middle Name" />
          )}
        />
      </Grid>

      {/* Preferred Name */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="preferredName"
          control={control}
          render={({ field }) => (
            <TextField {...field} fullWidth label="Preferred Name" />
          )}
        />
      </Grid>

      {/* SSN */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="ssn"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Social Security Number"
              placeholder="XXX-XX-XXXX"
              required
              error={!!errors.ssn}
              helperText={errors.ssn?.message}
            />
          )}
        />
      </Grid>

      {/* Date of Birth */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="dateOfBirth"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="date"
              label="Date of Birth"
              InputLabelProps={{ shrink: true }}
              required
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth?.message}
            />
          )}
        />
      </Grid>

      {/* Gender */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Gender"
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">Select...</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
              <MenuItem value="prefer-not">Prefer not to say</MenuItem>
            </TextField>
          )}
        />
      </Grid>
    </Grid>
  );
}
