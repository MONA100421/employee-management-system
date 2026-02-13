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
  getHROnboardings,
  reviewOnboarding,
  type UIOnboardingStatus,
} from "../../lib/onboarding";

type OnboardingRow = {
  id: string;
  version?: number;
  employee?: {
    username?: string;
    email?: string;
  } | null;
  status: UIOnboardingStatus;
  submittedAt?: string;
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
      const grouped = await getHROnboardings();

      setRows([...grouped.pending, ...grouped.approved, ...grouped.rejected]);
    } catch (err) {
      console.error("Failed to load employee profiles", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // map backend UI status -> StatusChip status
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
      const name = row.employee?.username?.toLowerCase() || "";
      const email = row.employee?.email?.toLowerCase() || "";
      return name.includes(query) || email.includes(query);
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
        activeRow.version,
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
            <TableCell>Employee</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Submitted At</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {filteredRows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.employee?.username ?? "—"}</TableCell>
              <TableCell>{row.employee?.email ?? "—"}</TableCell>
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
              <TableCell colSpan={5}>
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
        itemName={activeRow?.employee?.username}
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
