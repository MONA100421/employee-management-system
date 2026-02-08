import { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Avatar,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAuth } from "../../contexts/useAuth";

type EmployeeProfileForm = {
  firstName: string;
  lastName: string;
  preferredName?: string;
  phone?: string;
};

const sections = [
  {
    id: "name",
    title: "Name Information",
    icon: <PersonIcon />,
    fields: [
      { name: "firstName", label: "First Name" },
      { name: "lastName", label: "Last Name" },
      { name: "preferredName", label: "Preferred Name" },
    ],
  },
  {
    id: "contact",
    title: "Contact Information",
    icon: <PhoneIcon />,
    fields: [{ name: "phone", label: "Phone" }],
  },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function EmployeePersonalInfoPage() {
  const { user } = useAuth();

  const [editingSection, setEditingSection] = useState<SectionId | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const defaultValues = useMemo<EmployeeProfileForm>(
    () => ({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      preferredName: "",
      phone: "",
    }),
    [user],
  );

  const { control, handleSubmit, reset, getValues } =
    useForm<EmployeeProfileForm>({
      defaultValues,
    });

  const handleEdit = (sectionId: SectionId) => {
    setEditingSection(sectionId);
  };

  const handleSave = (sectionId: SectionId) =>
    handleSubmit((data) => {
      console.log("Save section:", sectionId, data);
      setEditingSection(null);
    })();

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    reset(defaultValues);
    setEditingSection(null);
    setCancelDialogOpen(false);
  };

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar sx={{ width: 96, height: 96 }}>
              {getValues("firstName")?.[0]}
              {getValues("lastName")?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {getValues("firstName")} {getValues("lastName")}
              </Typography>
              <Typography color="text.secondary">{user?.email}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {sections.map((section) => (
          <Grid size={{ xs: 12, md: 6 }} key={section.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">{section.title}</Typography>

                  {editingSection === section.id ? (
                    <>
                      <IconButton onClick={() => handleSave(section.id)}>
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={handleCancel}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton onClick={() => handleEdit(section.id)}>
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {section.fields.map((field) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={field.name}>
                      {editingSection === section.id ? (
                        <Controller
                          name={field.name as keyof EmployeeProfileForm}
                          control={control}
                          render={({ field: rhfField }) => (
                            <TextField
                              {...rhfField}
                              fullWidth
                              size="small"
                              label={field.label}
                            />
                          )}
                        />
                      ) : (
                        <>
                          <Typography variant="caption">
                            {field.label}
                          </Typography>
                          <Typography>
                            {getValues(
                              field.name as keyof EmployeeProfileForm,
                            ) || "-"}
                          </Typography>
                        </>
                      )}
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ConfirmDialog
        open={cancelDialogOpen}
        title="Discard changes?"
        message="Your changes will be lost."
        confirmText="Discard"
        confirmColor="error"
        onConfirm={confirmCancel}
        onCancel={() => setCancelDialogOpen(false)}
      />
    </Box>
  );
}
