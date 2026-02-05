import React, { useState } from "react";
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
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAuth } from "../../contexts/useAuth";

interface SectionData {
  [key: string]: string;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields: { name: string; label: string; type?: string; disabled?: boolean }[];
}

export default function EmployeePersonalInfoPage() {
  const { user } = useAuth();

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [tempData, setTempData] = useState<SectionData>({});

  const [formData, setFormData] = useState<Record<string, SectionData>>({
    name: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      preferredName: "",
    },
    contact: {
      email: user?.email || "",
      phone: "",
    },
  });

  const sections: Section[] = [
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
      fields: [
        { name: "email", label: "Email", disabled: true },
        { name: "phone", label: "Phone" },
      ],
    },
  ];

  const handleEdit = (sectionId: string) => {
    setEditingSection(sectionId);
    setTempData({ ...formData[sectionId] });
  };

  const handleSave = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      [sectionId]: { ...tempData },
    }));
    setEditingSection(null);
    setTempData({});
  };

  const handleCancel = () => {
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    setEditingSection(null);
    setTempData({});
    setCancelDialogOpen(false);
  };

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Avatar sx={{ width: 96, height: 96 }}>
              {formData.name.firstName?.[0]}
              {formData.name.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                {formData.name.firstName} {formData.name.lastName}
              </Typography>
              <Typography color="text.secondary">
                {formData.contact.email}
              </Typography>
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

                <Grid container spacing={2}>
                  {section.fields.map((field) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={field.name}>
                      {editingSection === section.id && !field.disabled ? (
                        <TextField
                          fullWidth
                          size="small"
                          label={field.label}
                          value={tempData[field.name] || ""}
                          onChange={(e) =>
                            setTempData((p) => ({
                              ...p,
                              [field.name]: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <>
                          <Typography variant="caption">
                            {field.label}
                          </Typography>
                          <Typography>
                            {formData[section.id][field.name] || "-"}
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
