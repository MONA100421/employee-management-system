import { Grid, TextField } from "@mui/material";

type PersonalFormData = {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
};

type Props = {
  formData: PersonalFormData;
  errors: Record<string, string>;
  onChange: (
    field: keyof PersonalFormData,
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
    </Grid>
  );
}
