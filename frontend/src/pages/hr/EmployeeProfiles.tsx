import { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Button,
  Stack,
  TextField
} from '@mui/material';

import StatusChip from '../../components/common/StatusChip';
import type { StatusType } from '../../components/common/StatusChip';
import FeedbackDialog from '../../components/common/FeedbackDialog';
import {
  reviewOnboarding,
  type UIOnboardingStatus,
} from "../../lib/onboarding";
import { getEmployeesFull } from "../../lib/hr";

type OnboardingRow = {
  id: string;
  firstName?: string;
  lastName?: string;
  preferredName?: string;
  ssn?: string;
  phone?: string;
  email?: string;
  workAuthTitle?: string;
  status: UIOnboardingStatus;
  submittedAt?: string;
  version?: number;
  employee?: {
    username?: string;
    email?: string;
  } | null;
};

export default function EmployeeProfiles() {
  const [rows, setRows] = useState<OnboardingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"approve" | "reject">("approve");
  const [activeRow, setActiveRow] = useState<OnboardingRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const employees = await getEmployeesFull();
      setRows(employees);
    } catch (err) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // map backend UI status
  const mapStatus = (s: UIOnboardingStatus): StatusType => {
    switch (s) {
      case "approved":
        return "approved";
      case "rejected":
        return "rejected";
      case "pending":
        return "pending";
      case "never-submitted":
      default:
        return "pending";
    }
  };

  const openApprove = (row: OnboardingRow) => {
    setActiveRow(row);
    setDialogType("approve");
    setDialogOpen(true);
  };

  const openReject = (row: OnboardingRow) => {
    setActiveRow(row);
    setDialogType("reject");
    setDialogOpen(true);
  };

  // Filter rows based on search query.
  const filteredRows = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return rows.filter((row) => {
      const firstName = row.firstName || "";
      const lastName = row.lastName || "";
      const preferredName = row.preferredName || "";

      const fullName =
        `${firstName} ${lastName} ${preferredName}`.toLowerCase();

      const email = (row.email || "").toLowerCase();

      return fullName.includes(query) || email.includes(query);
    });
  }, [rows, searchQuery]);


  const handleDialogSubmit = async (feedback: string) => {
    if (!activeRow) return;
    setSubmitting(true);
    try {
      const decision = dialogType === "approve" ? "approved" : "rejected";

      await reviewOnboarding(
        activeRow.id,
        decision,
        dialogType === "reject" ? feedback : undefined,
      );


      setDialogOpen(false);
      setActiveRow(null);
      await load();
    } catch (err) {
      console.error("Review failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Employee Profiles
      </Typography>

      {/* Search Box */}
      <TextField
        fullWidth
        label="Search employees by name or email"
        variant="outlined"
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchQuery(e.target.value)
        }
        sx={{ mb: 3 }}
      />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Full Name (Legal)</TableCell>
            <TableCell>SSN</TableCell>
            <TableCell>Work Auth</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Submitted At</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredRows.map((row) => (
            <TableRow key={row.id} hover>
              {/* Legal Full Name */}
              <TableCell sx={{ fontWeight: 500 }}>
                {row.firstName ? `${row.firstName} ${row.lastName}` : "N/A"}
              </TableCell>

              {/* SSN */}
              <TableCell>{row.ssn ?? "—"}</TableCell>

              {/* Work Auth Title */}
              <TableCell>
                <Typography variant="body2" color="primary">
                  {row.workAuthTitle ?? "—"}
                </Typography>
              </TableCell>

              {/* Phone */}
              <TableCell>{row.phone ?? "—"}</TableCell>

              {/* Email */}
              <TableCell>{row.email}</TableCell>
              <TableCell>
                <StatusChip status={mapStatus(row.status)} />
              </TableCell>
              <TableCell>
                {row.submittedAt
                  ? new Date(row.submittedAt).toLocaleString()
                  : "—"}
              </TableCell>
              <TableCell align="right">
                {row.status === "pending" ? (
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => openApprove(row)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => openReject(row)}
                    >
                      Reject
                    </Button>
                  </Stack>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}

          {!loading && filteredRows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ py: 3 }}
                >
                  No onboarding applications found.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={dialogOpen}
        loading={submitting}
        type={dialogType}
        title={
          dialogType === "approve"
            ? "Approve Onboarding Application"
            : "Reject Onboarding Application"
        }
        itemName={
          activeRow?.firstName
            ? `${activeRow.firstName} ${activeRow.lastName}`
            : activeRow?.employee?.username || "Employee"
        }
        requireFeedback={dialogType === "reject"}
        onSubmit={handleDialogSubmit}
        onCancel={() => {
          setDialogOpen(false);
          setActiveRow(null);
        }}
      />
    </Box>
  );
}
