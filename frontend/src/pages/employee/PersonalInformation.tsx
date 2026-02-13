import { Grid, TextField, MenuItem } from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control, FieldErrors } from "react-hook-form";
import type { OnboardingFormValues } from "./onboarding.schema";

type Mode = "personal" | "address";

type Props = {
  control: Control<OnboardingFormValues>;
  errors: FieldErrors<OnboardingFormValues>;
  mode: Mode;
  readOnly?: boolean;
};

export default function PersonalInformation({
  control,
  errors,
  mode,
  readOnly,
}: Props) {
  if (mode === "address") {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Street Address"
                disabled={readOnly}
                required
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="City"
                disabled={readOnly}
                required
                error={!!errors.city}
                helperText={errors.city?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="State"
                required
                disabled={readOnly}
                error={!!errors.state}
                helperText={errors.state?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 3 }}>
          <Controller
            name="zipCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="ZIP Code"
                required
                disabled={readOnly}
                error={!!errors.zipCode}
                helperText={errors.zipCode?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    );
  }

  // mode === "personal"
  return (
    <Grid container spacing={3}>
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
              disabled={readOnly}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          )}
        />
      </Grid>

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
              disabled={readOnly}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="middleName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Middle Name"
              disabled={readOnly}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="preferredName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Preferred Name"
              disabled={readOnly}
            />
          )}
        />
      </Grid>

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
              disabled={readOnly}
              error={!!errors.ssn}
              helperText={errors.ssn?.message}
            />
          )}
        />
      </Grid>

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
              disabled={readOnly}
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth?.message}
            />
          )}
        />
      </Grid>

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
              disabled={readOnly}
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
