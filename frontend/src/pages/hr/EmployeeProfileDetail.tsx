import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Avatar,
  Chip,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  ContactEmergency as EmergencyIcon,
  Description as DocumentIcon,
  Email as EmailIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import FeedbackDialog from '../../components/common/FeedbackDialog';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import type { HRDocument } from './types';
import api from '../../lib/api';

const EmployeeProfileDetail: React.FC = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | undefined>(undefined);
  const [documents, setDocuments] = useState<HRDocument[]>([]);


  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const res = await api.get("/documents/me");

        type BackendDocument = {
          id: string;
          type: string;
          status: "pending" | "approved" | "rejected";
          fileName?: string;
          uploadedAt?: string;
          hrFeedback?: string;
        };

        const docs: HRDocument[] = res.data.documents.map(
          (d: BackendDocument) => ({
            id: d.id,
            employeeName: "John Doe",
            employeeEmail: "john@company.com",
            type: d.type,
            status: d.status,
            fileName: d.fileName,
            uploadedAt: d.uploadedAt,
            hrFeedback: d.hrFeedback,
          }),
        );

        setDocuments(docs);
      } catch (err) {
        console.error("Failed to load documents", err);
      }
    };

    loadDocuments();
  }, []);


  const employee = {
    id: id,
    firstName: 'John',
    lastName: 'Doe',
    preferredName: 'Johnny',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    workPhone: '+1 (555) 987-6543',
    dateOfBirth: '1990-05-15',
    ssn: '***-**-1234',
    address: {
      street: '123 Main Street',
      apt: 'Apt 4B',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
    },
    employment: {
      employeeId: 'EMP-2024-001',
      title: 'Software Engineer',
      department: 'Engineering',
      manager: 'Sarah Johnson',
      startDate: '2024-01-15',
      workAuthorization: 'OPT',
    },
    emergency: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 111-2222',
      email: 'jane.doe@email.com',
    },
    documents: [
      { name: 'Driver License.pdf', type: 'ID', uploadedAt: '2024-01-15' },
      { name: 'SSN Card.pdf', type: 'SSN', uploadedAt: '2024-01-15' },
      { name: 'OPT EAD.pdf', type: 'Work Auth', uploadedAt: '2024-01-16' },
      { name: 'I-20.pdf', type: 'Immigration', uploadedAt: '2024-01-16' },
    ],
    status: 'active',
  };

  const sections = [
    {
      title: 'Personal Information',
      icon: <PersonIcon />,
      fields: [
        { label: 'Full Name', value: `${employee.firstName} ${employee.lastName}` },
        { label: 'Preferred Name', value: employee.preferredName || '-' },
        { label: 'Date of Birth', value: employee.dateOfBirth },
        { label: 'SSN', value: employee.ssn },
      ],
    },
    {
      title: 'Contact Information',
      icon: <PhoneIcon />,
      fields: [
        { label: 'Email', value: employee.email },
        { label: 'Personal Phone', value: employee.phone },
        { label: 'Work Phone', value: employee.workPhone },
      ],
    },
    {
      title: 'Address',
      icon: <HomeIcon />,
      fields: [
        { label: 'Street', value: `${employee.address.street}, ${employee.address.apt}` },
        { label: 'City', value: employee.address.city },
        { label: 'State', value: employee.address.state },
        { label: 'ZIP Code', value: employee.address.zipCode },
      ],
    },
    {
      title: 'Employment',
      icon: <WorkIcon />,
      fields: [
        { label: 'Employee ID', value: employee.employment.employeeId },
        { label: 'Title', value: employee.employment.title },
        { label: 'Department', value: employee.employment.department },
        { label: 'Manager', value: employee.employment.manager },
        { label: 'Start Date', value: employee.employment.startDate },
        { label: 'Work Authorization', value: employee.employment.workAuthorization },
      ],
    },
    {
      title: 'Emergency Contact',
      icon: <EmergencyIcon />,
      fields: [
        { label: 'Name', value: employee.emergency.name },
        { label: 'Relationship', value: employee.emergency.relationship },
        { label: 'Phone', value: employee.emergency.phone },
        { label: 'Email', value: employee.emergency.email },
      ],
    },
  ];

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<BackIcon />}
        onClick={() => navigate("/hr/employees")}
        sx={{ mb: 2 }}
      >
        Back to Employees
      </Button>

      {/* Profile Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: theme.palette.primary.main,
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              {employee.firstName[0]}
              {employee.lastName[0]}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {employee.firstName} {employee.lastName}
                </Typography>
                <Chip
                  label={employee.status === "active" ? "Active" : "Inactive"}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    bgcolor:
                      employee.status === "active"
                        ? `${theme.palette.success.main}15`
                        : `${theme.palette.grey[500]}15`,
                    color:
                      employee.status === "active"
                        ? theme.palette.success.main
                        : theme.palette.grey[600],
                  }}
                />
              </Box>
              <Typography
                variant="body1"
                sx={{ color: theme.palette.text.secondary, mb: 1 }}
              >
                {employee.employment.title} • {employee.employment.department}
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <EmailIcon
                    sx={{ fontSize: 16, color: theme.palette.text.secondary }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {employee.email}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PhoneIcon
                    sx={{ fontSize: 16, color: theme.palette.text.secondary }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {employee.phone}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Chip
              label={employee.employment.workAuthorization}
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Information Sections */}
      <Grid container spacing={3}>
        {sections.map((section) => (
          <Grid size={{ xs: 12, sm: 6 }} key={section.title}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
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
                    {section.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {section.title}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {section.fields.map((field) => (
                    <Grid size={{ xs: 6 }} key={field.label}>
                      <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                      >
                        {field.label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {field.value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Documents Section */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
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
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Documents
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {documents.map((doc) => (
                  <Grid size={{ xs: 12, sm: 6, md: 3 }} key={doc.id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor:
                            doc.status === "rejected"
                              ? `${theme.palette.error.main}15`
                              : `${theme.palette.primary.main}15`,
                          color:
                            doc.status === "rejected"
                              ? theme.palette.error.main
                              : theme.palette.primary.main,
                        }}
                      >
                        <DocumentIcon fontSize="small" />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {doc.fileName || doc.type}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {doc.type} • {doc.uploadedAt || "—"}
                        </Typography>

                        {doc.status === "rejected" && doc.hrFeedback && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: theme.palette.error.main,
                              display: "block",
                              mt: 0.5,
                            }}
                          >
                            Feedback: {doc.hrFeedback}
                          </Typography>
                        )}
                      </Box>

                      {doc.status === "pending" && (
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => {
                              setReviewAction("approve");
                              setFeedback(undefined);
                              setFeedbackOpen(true);
                              setDocuments((prev) =>
                                prev.map((d) =>
                                  d.id === doc.id ? { ...d } : d,
                                ),
                              );
                            }}
                          >
                            Approve
                          </Button>

                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              setReviewAction("reject");
                              setFeedback(undefined);
                              setFeedbackOpen(true);
                              setDocuments((prev) =>
                                prev.map((d) =>
                                  d.id === doc.id ? { ...d } : d,
                                ),
                              );
                            }}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ===== HR Review Actions ===== */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Application Review
            </Typography>

            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, mb: 3 }}
            >
              Please review the onboarding information carefully before making a
              decision.
            </Typography>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setReviewAction("approve");
                  setFeedbackOpen(true);
                }}
              >
                Approve Application
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  setReviewAction("reject");
                  setFeedbackOpen(true);
                }}
              >
                Reject Application
              </Button>
            </Box>
          </CardContent>
        </Card>

        <FeedbackDialog
          open={feedbackOpen}
          type={reviewAction === "approve" ? "approve" : "reject"}
          title={
            reviewAction === "approve"
              ? "Approve Onboarding Application"
              : "Reject Onboarding Application"
          }
          itemName={`${employee.firstName} ${employee.lastName}`}
          requireFeedback={reviewAction === "reject"}
          onSubmit={(value) => {
            setFeedback(value);
            setFeedbackOpen(false);
            setConfirmOpen(true);
          }}
          onCancel={() => setFeedbackOpen(false)}
        />

        <ConfirmDialog
          open={confirmOpen}
          title="Confirm Decision"
          message={`Are you sure you want to ${
            reviewAction === "approve" ? "approve" : "reject"
          } this onboarding application?`}
          confirmColor={reviewAction === "approve" ? "success" : "error"}
          onConfirm={async () => {
            if (!reviewAction) return;

            const targetDoc = documents.find((d) => d.status === "pending");
            if (!targetDoc) return;

            try {
              await api.post(`/documents/${targetDoc.id}/review`, {
                decision: reviewAction === "approve" ? "approved" : "rejected",
                feedback: reviewAction === "reject" ? feedback : undefined,
              });

              setDocuments((prev) =>
                prev.map((d) =>
                  d.id === targetDoc.id
                    ? {
                        ...d,
                        status:
                          reviewAction === "approve" ? "approved" : "rejected",
                        hrFeedback: feedback,
                      }
                    : d,
                ),
              );
            } catch (err) {
              console.error("Document review failed", err);
              alert("Review failed");
            } finally {
              setConfirmOpen(false);
            }
          }}
          onCancel={() => setConfirmOpen(false)}
        />
      </Grid>
    </Box>
  );
};

export default EmployeeProfileDetail;
