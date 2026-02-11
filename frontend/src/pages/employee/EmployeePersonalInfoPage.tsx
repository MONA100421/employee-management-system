import { useEffect, useState, useCallback } from "react";
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
import {
  useForm,
  Controller,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAuth } from "../../contexts/useAuth";
import { getMyEmployee, patchMyEmployee } from "../../lib/employees";
import { useDocuments } from "../../hooks/useDocuments";
import type { EmployeeProfile } from "../../types/user";
import type { BaseDocument } from "../../types/document";
import {
  employeeProfileSchema,
  type EmployeeProfileFormValues,
} from "./employeeProfile.schema";

// Types 

type SectionProps = {
  title: string;
  icon: React.ReactNode;
  editing: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
};

type FieldProps = {
  name: keyof EmployeeProfileFormValues;
  label: string;
  control: Control<EmployeeProfileFormValues>;
  editing: boolean;
  getValues: (
    name: keyof EmployeeProfileFormValues,
  ) => string | number | boolean | undefined;
  disabled?: boolean;
  type?: string;
  errors: FieldErrors<EmployeeProfileFormValues>;
};

// Reusable UI Components

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
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <IconButton
                  onClick={onSave}
                  sx={{ color: theme.palette.success.main }}
                >
                  <SaveIcon />
                </IconButton>
                <IconButton
                  onClick={onCancel}
                  sx={{ color: theme.palette.error.main }}
                >
                  <CancelIcon />
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
            value={field.value ?? ""}
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

// Main Page Component

export default function EmployeePersonalInfoPage() {
  const theme = useTheme();
  const { user: authUser } = useAuth();
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
    formState: { errors },
  } = useForm<EmployeeProfileFormValues>({
    resolver: zodResolver(employeeProfileSchema),
    mode: "onTouched",
  });

  const loadData = useCallback(async () => {
    try {
      const res = await getMyEmployee();
      setProfile(res.employee);

      reset({
        firstName: res.user.firstName || "",
        lastName: res.user.lastName || "",
        middleName: res.user.middleName || "",
        preferredName: res.user.preferredName || "",
        email: res.user.email || "",
        phone: res.employee?.phone || "",
        workPhone: "",
        street: res.employee?.address?.street || "",
        apt: "",
        city: res.employee?.address?.city || "",
        state: res.employee?.address?.state || "",
        zipCode: res.employee?.address?.zipCode || "",
        country: res.employee?.address?.country || "",
        employeeId: res.employee?.employment?.employeeId || "",
        title: res.employee?.employment?.title || "",
        department: res.employee?.employment?.department || "",
        manager: res.employee?.employment?.manager || "",
        startDate: res.employee?.employment?.startDate || "",
        workAuthorization: res.employee?.employment?.workAuthorization || "",
        emergencyContactName: res.employee?.emergency?.contactName || "",
        emergencyRelationship: res.employee?.emergency?.relationship || "",
        emergencyPhone: res.employee?.emergency?.phone || "",
        emergencyEmail: res.employee?.emergency?.email || "",
      });
    } catch (error) {
      console.error("Failed to load employee data:", error);
    }
  }, [reset]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadData();
      }
    };
    void init();
    return () => {
      isMounted = false;
    };
  }, [loadData]);

  const sectionFields: Record<string, (keyof EmployeeProfileFormValues)[]> = {
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

  const saveSection = async (section: string) => {
    const fields = sectionFields[section];
    const isValid = await trigger(fields);
    if (isValid) {
      await submitSection(section);
    }
  };

  const submitSection = (section: string) =>
    handleSubmit(async (values) => {
      const payload: Partial<EmployeeProfile & Record<string, unknown>> = {};

      if (section === "name") {
        payload.firstName = values.firstName;
        payload.lastName = values.lastName;
        payload.middleName = values.middleName;
        payload.preferredName = values.preferredName;
      } else if (section === "address") {
        payload.address = {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        };
      } else if (section === "contact") {
        payload.phone = values.phone;
        payload.email = values.email;
      } else if (section === "emergency") {
        payload.emergency = {
          contactName: values.emergencyContactName,
          relationship: values.emergencyRelationship,
          phone: values.emergencyPhone,
          email: values.emergencyEmail,
        };
      }

      try {
        await patchMyEmployee(payload);
        setEditing(null);
        await loadData();
      } catch (err) {
        console.error("Update failed:", err);
      }
    })();

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: theme.palette.primary.main,
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              {authUser?.firstName?.[0]}
              {authUser?.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {authUser?.firstName} {authUser?.lastName}
              </Typography>
              <Typography color="text.secondary">
                {profile?.employment?.title || "Staff"} •{" "}
                {profile?.employment?.department || "General"}
              </Typography>
              <Typography color="text.secondary">{authUser?.email}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Name Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section
            title="Name Information"
            icon={<PersonIcon />}
            editing={editing === "name"}
            onEdit={() => setEditing("name")}
            onSave={() => void saveSection("name")}
            onCancel={() => setConfirmOpen(true)}
          >
            {(
              ["firstName", "lastName", "middleName", "preferredName"] as const
            ).map((f) => (
              <Grid size={{ xs: 6 }} key={f}>
                <Field
                  name={f}
                  label={f.charAt(0).toUpperCase() + f.slice(1)}
                  control={control}
                  editing={editing === "name"}
                  getValues={getValues}
                  errors={errors}
                />
              </Grid>
            ))}
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
            {(
              ["street", "apt", "city", "state", "zipCode", "country"] as const
            ).map((f) => (
              <Grid size={{ xs: 6 }} key={f}>
                <Field
                  name={f}
                  label={f.toUpperCase()}
                  control={control}
                  editing={editing === "address"}
                  getValues={getValues}
                  errors={errors}
                />
              </Grid>
            ))}
          </Section>
        </Grid>

        {/* Contact Information */}
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

        {/* Employment Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Section title="Employment" icon={<WorkIcon />} editing={false}>
            {(
              [
                "employeeId",
                "title",
                "department",
                "manager",
                "startDate",
                "workAuthorization",
              ] as const
            ).map((f) => (
              <Grid size={{ xs: 6 }} key={f}>
                <Field
                  name={f}
                  label={f.replace(/([A-Z])/g, " $1").toUpperCase()}
                  control={control}
                  editing={false}
                  getValues={getValues}
                  errors={errors}
                />
              </Grid>
            ))}
          </Section>
        </Grid>

        {/* Emergency Contact */}
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
        message="Your unsaved changes will be lost. Are you sure?"
        confirmText="Discard"
        confirmColor="error"
        onConfirm={() => {
          setEditing(null);
          setConfirmOpen(false);
          loadData();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </Box>
  );
}
