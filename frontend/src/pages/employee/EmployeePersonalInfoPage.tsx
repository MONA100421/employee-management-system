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
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAuth } from "../../contexts/useAuth";
import { getMyEmployee, patchMyEmployee } from "../../lib/employees";
import type { EmployeeProfile } from "../../types/user";

/* ---------- Form type (THIS PAGE ONLY) ---------- */
type EmployeePersonalInfoForm = {
  // name (User)
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;

  // contact
  phone?: string;
  workPhone?: string;

  // address
  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  // employment (read-only)
  employeeId?: string;
  title?: string;
  department?: string;
  manager?: string;
  startDate?: string;
  workAuthorization?: string;

  // emergency
  emergencyContactName?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;
  emergencyEmail?: string;
};

export default function EmployeePersonalInfoPage() {
  const theme = useTheme();
  const { user } = useAuth();

  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ---------- RHF ---------- */
  const { control, reset, getValues, handleSubmit } =
    useForm<EmployeePersonalInfoForm>({
      defaultValues: {},
    });

  /* ---------- Load data ---------- */
  useEffect(() => {
    (async () => {
      const res = await getMyEmployee();
      setProfile(res.employee);

      reset({
        firstName: res.user.firstName,
        lastName: res.user.lastName,
        preferredName: res.user.preferredName ?? "",
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

  /* ---------- Save ---------- */
  const saveSection = (section: string) =>
    handleSubmit(async (values) => {
      setSaving(true);

      const payload: Partial<EmployeeProfile> = {};

      if (section === "contact") {
        payload.phone = values.phone;
      }

      if (section === "address") {
        payload.address = {
          street: values.street,
          city: values.city,
          state: values.state,
          zipCode: values.zipCode,
          country: values.country,
        };
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
      setEditingSection(null);
      setSaving(false);
    })();

  /* ---------- UI ---------- */
  return (
    <Box>
      {/* ===== Profile Header ===== */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
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

      {/* ===== Address / Contact / Employment / Emergency ===== */}
      {/* 為了篇幅可讀性，這裡示範 Address，其餘 section 完全同 pattern */}

      <Grid container spacing={3}>
        {/* Address */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6">Address</Typography>
                {editingSection === "address" ? (
                  <>
                    <IconButton
                      onClick={() => saveSection("address")}
                      disabled={saving}
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => setEditingSection(null)}
                      disabled={saving}
                    >
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <IconButton onClick={() => setEditingSection("address")}>
                    <EditIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {["street", "city", "state", "zipCode", "country"].map(
                  (name) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={name}>
                      {editingSection === "address" ? (
                        <Controller
                          name={name as keyof EmployeePersonalInfoForm}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              size="small"
                              label={name}
                            />
                          )}
                        />
                      ) : (
                        <>
                          <Typography variant="caption">{name}</Typography>
                          <Typography>
                            {getValues(name as keyof EmployeePersonalInfoForm)}
                          </Typography>
                        </>
                      )}
                    </Grid>
                  ),
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 👉 Contact / Employment / Emergency / Documents 同 lovable 結構複製即可 */}
      </Grid>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Discard Changes?"
        message="Your changes will be lost."
        confirmText="Discard"
        confirmColor="error"
        onConfirm={() => {
          setEditingSection(null);
          setCancelDialogOpen(false);
        }}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </Box>
  );
}
