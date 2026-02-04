import React from "react";
import { Grid, TextField } from "@mui/material";

export type OnboardingForm = {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  ssn?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelationship?: string;
  workAuthType?: string;
  workAuthOther?: string;
};

type Props = {
  formData: OnboardingForm;
  errors: Record<string, string>;
  onChange: (
    field: keyof OnboardingForm,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function PersonalInformation({
  formData,
  errors,
  onChange,
}: Props) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="First Name"
          required
          value={formData.firstName}
          onChange={onChange("firstName")}
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
          onChange={onChange("lastName")}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Middle Name"
          value={formData.middleName || ""}
          onChange={onChange("middleName")}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Preferred Name"
          value={formData.preferredName || ""}
          onChange={onChange("preferredName")}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Social Security Number"
          required
          value={formData.ssn || ""}
          onChange={onChange("ssn")}
          error={!!errors.ssn}
          helperText={errors.ssn}
          placeholder="XXX-XX-XXXX"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Date of Birth"
          type="date"
          required
          value={formData.dateOfBirth || ""}
          onChange={onChange("dateOfBirth")}
          error={!!errors.dateOfBirth}
          helperText={errors.dateOfBirth}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          label="Gender"
          select
          InputLabelProps={{ shrink: true }}
          SelectProps={{ native: true }}
          value={formData.gender || ""}
          onChange={onChange("gender")}
        >
          <option value="" disabled>
            Select...
          </option>{" "}
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer-not">Prefer not to say</option>
        </TextField>
      </Grid>
    </Grid>
  );
}
