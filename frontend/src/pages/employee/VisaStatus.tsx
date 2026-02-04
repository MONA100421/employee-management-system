import React from "react";
import { Grid, TextField, MenuItem } from "@mui/material";
import type { OnboardingForm } from "./PersonalInformation";

type Props = {
  formData: OnboardingForm;
  onChange: (
    field: keyof OnboardingForm,
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function VisaStatus({ formData, onChange }: Props) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          select
          label="Work Authorization Type"
          value={formData.workAuthType || ""}
          onChange={onChange("workAuthType")}
          helperText="Select your current authorization"
        >
          <MenuItem value="">Select...</MenuItem>
          <MenuItem value="citizen">U.S. Citizen</MenuItem>
          <MenuItem value="green-card">Green Card</MenuItem>
          <MenuItem value="opt">OPT</MenuItem>
          <MenuItem value="opt-stem">OPT STEM Extension</MenuItem>
          <MenuItem value="h1b">H1-B</MenuItem>
          <MenuItem value="l2">L2</MenuItem>
          <MenuItem value="h4">H4</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>
      </Grid>

      {formData.workAuthType === "other" && (
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Please Specify"
            value={formData.workAuthOther || ""}
            onChange={onChange("workAuthOther")}
          />
        </Grid>
      )}
    </Grid>
  );
}
