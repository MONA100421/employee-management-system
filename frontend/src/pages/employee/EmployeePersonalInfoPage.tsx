import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Avatar,
  IconButton,
  Button,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  ContactEmergency as EmergencyIcon,
  Description as DocumentIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useForm, Controller, type Control, type FieldErrors } from "react-hook-form";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAuth } from "../../contexts/useAuth";
import { getMyEmployee, patchMyEmployee } from "../../lib/employees";
import { useDocuments } from "../../hooks/useDocuments";
import type { EmployeeProfile } from "../../types/user";
import type { BaseDocument } from "../../types/document";
import { employeeProfileSchema, type EmployeeProfileFormValues } from "./employeeProfile.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type {EmployeePersonalInfoForm} from "./types";

// Reusable UI components

type SectionProps = {
  title: string;
  icon: React.ReactNode;
  editing: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
};

function Section({
  title,
  icon,
  editing,
  onEdit,
  onSave,
  onCancel,
  children,
}: SectionProps) {
  const theme = useTheme();

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: `${theme.palette.primary.main}15`,
                color: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          </Box>

          {onEdit &&
            (editing ? (
              <Box sx={{ display: "flex", gap: 0.3 }}>
                <IconButton
                  onClick={onSave}
                  sx={{ color: theme.palette.success.main }}
                >
                  <SaveIcon fontSize="medium" />
                </IconButton>
                <IconButton
                  onClick={onCancel}
                  sx={{ color: theme.palette.error.main }}
                >
                  <CancelIcon fontSize="medium" />
                </IconButton>
              </Box>
            ) : (
              <IconButton size="small" onClick={onEdit}>
                <EditIcon />
              </IconButton>
            ))}
        </Box>

        <Grid container spacing={2}>
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
}

type FieldProps = {
  name: keyof EmployeePersonalInfoForm;
  label: string;
  control: Control<EmployeePersonalInfoForm>;
  editing: boolean;
  getValues: (name: keyof EmployeePersonalInfoForm) => unknown;
  disabled?: boolean;
  type?: string;
  errors: FieldErrors<EmployeeProfileFormValues>;
};

function Field({
  name,
  label,
  control,
  editing,
  getValues,
  disabled,
  type,
}: FieldProps) {
  if (disabled) {
    return (
      <TextField
        fullWidth
        size="small"
        label={label}
        value={String(getValues(name) ?? "")}
        disabled
      />
    );
  }

  if (editing) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            fullWidth
            size="small"
            label={label}
            type={type ?? "text"}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={500}>{String(getValues(name) ?? "-")}</Typography>
    </Box>
  );
}

// Page

export default function EmployeePersonalInfoPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const { documents } = useDocuments("all");

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    control,
    reset,
    getValues,
    handleSubmit,
    trigger,
    formState: { errors},
  } = useForm<EmployeeProfileFormValues>({
    resolver: zodResolver(employeeProfileSchema),
    mode: "onTouched",
  });

  // Load employee
  useEffect(() => {
    (async () => {
      const res = await getMyEmployee();
      setProfile(res.employee);

      setEditing(null);

      reset({
        firstName: res.user.firstName,
        lastName: res.user.lastName,
        preferredName: res.user.preferredName ?? "",

        email: res.user.email,
        phone: res.employee?.phone ?? "",

        street: res.employee?.address?.street ?? "",
        apt: "",
        city: res.employee?.address?.city ?? "",
        state: res.employee?.address?.state ?? "",
        zipCode: res.employee?.address?.zipCode ?? "",
        country: res.employee?.address?.country ?? "",

        employeeId: res.employee?.employment?.employeeId,
        title: res.employee?.employment?.title,
        department: res.employee?.employment?.department,
        manager: res.employee?.employment?.manager,
        startDate: res.employee?.employment?.startDate,
        workAuthorization: res.employee?.employment?.workAuthorization,

        emergencyContactName: res.employee?.emergency?.contactName ?? "",
        emergencyRelationship: res.employee?.emergency?.relationship ?? "",
        emergencyPhone: res.employee?.emergency?.phone ?? "",
        emergencyEmail: res.employee?.emergency?.email ?? "",
      });
    })();
  }, [reset]);

  const sectionFields: Record<
    "name" | "address" | "contact" | "emergency",
    (keyof EmployeeProfileFormValues)[]
  > = {
    name: ["firstName", "lastName", "middleName", "preferredName"],
    address: ["street", "apt", "city", "state", "zipCode", "country"],
    contact: ["email", "phone", "workPhone"],
    emergency: [
      "emergencyContactName",
      "emergencyRelationship",
      "emergencyPhone",
      "emergencyEmail",
    ],
  };


  const saveSection = async (section: keyof typeof sectionFields) => {
    const fields = sectionFields[section];
    if (fields.length > 0) {
      const valid = await trigger(sectionFields[section]);
      if (!valid) return;
    }
    await submitSection(section);
  };

  const submitSection = (section: string) =>
    handleSubmit(async (values) => {
      const payload: Partial<EmployeeProfile> = {};

      if (section === "address") {
        payload.address = {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        };
      }

      if (section === "contact") {
        payload.phone = values.phone;
        payload.email = values.email;
      }

      if (section === "emergency") {
        payload.emergency = {
          contactName: values.emergencyContactName,
          relationship: values.emergencyRelationship,
          phone: values.emergencyPhone,
          email: values.emergencyEmail,
        };
      }

      await patchMyEmployee(payload);
      setEditing(null);
    })();

  // UI

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: theme.palette.primary.main,
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography color="text.secondary">
                {profile?.employment?.title} • {profile?.employment?.department}
              </Typography>
              <Typography color="text.secondary">{user?.email}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Name */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section
            title="Name Information"
            icon={<PersonIcon />}
            editing={editing === "name"}
            onEdit={() => setEditing("name")}
            onSave={() => void saveSection("name")}
            onCancel={() => setConfirmOpen(true)}
          >
            <Grid size={{ xs: 6 }}>
              <Field
                name="firstName"
                label="First Name"
                control={control}
                editing={editing === "name"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="lastName"
                label="Last Name"
                control={control}
                editing={editing === "name"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="middleName"
                label="Middle Name"
                control={control}
                editing={editing === "name"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="preferredName"
                label="Preferred Name"
                control={control}
                editing={editing === "name"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>
          </Section>
        </Grid>

        {/* Address */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section
            title="Address"
            icon={<HomeIcon />}
            editing={editing === "address"}
            onEdit={() => setEditing("address")}
            onSave={() => void saveSection("address")}
            onCancel={() => setConfirmOpen(true)}
          >
            <Grid size={{ xs: 6 }}>
              <Field
                name="street"
                label="Street Address"
                control={control}
                editing={editing === "address"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="apt"
                label="Apt / Suite"
                control={control}
                editing={editing === "address"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="city"
                label="City"
                control={control}
                editing={editing === "address"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="state"
                label="State"
                control={control}
                editing={editing === "address"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="zipCode"
                label="ZIP Code"
                control={control}
                editing={editing === "address"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="country"
                label="Country"
                control={control}
                editing={editing === "address"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>
          </Section>
        </Grid>

        {/* Contact */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section
            title="Contact Information"
            icon={<PhoneIcon />}
            editing={editing === "contact"}
            onEdit={() => setEditing("contact")}
            onSave={() => void saveSection("contact")}
            onCancel={() => setConfirmOpen(true)}
          >
            <Grid size={{ xs: 6 }}>
              <Field
                name="email"
                label="Email"
                type="email"
                control={control}
                editing={editing === "contact"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="phone"
                label="Personal Phone"
                control={control}
                editing={editing === "contact"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="workPhone"
                label="Work Phone"
                control={control}
                editing={false}
                getValues={getValues}
                errors={errors}
              />
            </Grid>
          </Section>
        </Grid>

        {/* Employment */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Employment" icon={<WorkIcon />} editing={false}>
            <Grid size={{ xs: 6 }}>
              <Field
                name="employeeId"
                label="Employee ID"
                control={control}
                editing={false}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="title"
                label="Job Title"
                control={control}
                editing={false}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="department"
                label="Department"
                control={control}
                editing={false}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="manager"
                label="Manager"
                control={control}
                editing={false}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="startDate"
                label="Start Date"
                control={control}
                editing={false}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="workAuthorization"
                label="Work Authorization"
                control={control}
                editing={false}
                getValues={getValues}
                errors={errors}
              />
            </Grid>
          </Section>
        </Grid>

        {/* Emergency */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section
            title="Emergency Contact"
            icon={<EmergencyIcon />}
            editing={editing === "emergency"}
            onEdit={() => setEditing("emergency")}
            onSave={() => void saveSection("emergency")}
            onCancel={() => setConfirmOpen(true)}
          >
            <Grid size={{ xs: 6 }}>
              <Field
                name="emergencyContactName"
                label="Contact Name"
                control={control}
                editing={editing === "emergency"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="emergencyRelationship"
                label="Relationship"
                control={control}
                editing={editing === "emergency"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="emergencyPhone"
                label="Phone"
                control={control}
                editing={editing === "emergency"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Field
                name="emergencyEmail"
                label="Email"
                control={control}
                editing={editing === "emergency"}
                getValues={getValues}
                errors={errors}
              />
            </Grid>
          </Section>
        </Grid>

        {/* Documents */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: `${theme.palette.primary.main}15`,
                      color: theme.palette.primary.main,
                    }}
                  >
                    <DocumentIcon />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    Documents
                  </Typography>
                </Box>
                <Button
                  startIcon={<UploadIcon />}
                  variant="outlined"
                  size="small"
                >
                  Upload New
                </Button>
              </Box>

              <Grid container spacing={2}>
                {documents.map((doc: BaseDocument) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
                    <Box
                      sx={{
                        p: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2,
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                      }}
                    >
                      <DocumentIcon color="error" />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={500}>{doc.fileName}</Typography>
                        <Typography variant="caption">
                          {doc.type} • {doc.uploadedAt}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <DownloadIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ConfirmDialog
        open={confirmOpen}
        title="Discard Changes?"
        message="Your changes will be lost."
        confirmText="Discard"
        confirmColor="error"
        onConfirm={() => {
          setEditing(null);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
}
