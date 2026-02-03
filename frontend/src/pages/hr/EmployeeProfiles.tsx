import { useEffect, useState } from 'react';
import api from '../../lib/api';
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
} from '@mui/material';

import StatusChip from '../../components/common/StatusChip';
import type { StatusType } from '../../components/common/StatusChip';
import FeedbackDialog from '../../components/common/FeedbackDialog';
import type { UIOnboardingStatus } from '../../lib/onboarding';

type OnboardingRow = {
  id: string;
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

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve');
  const [activeRow, setActiveRow] = useState<OnboardingRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/hr/onboarding');
      if (resp.data.ok) {
        setRows(resp.data.applications || []);
      }
    } catch (err) {
      console.error('Failed to load onboarding list', err);
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
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'pending':
        return 'pending';
      case 'never-submitted':
      default:
        return 'pending';
    }
  };

  const openApprove = (row: OnboardingRow) => {
    setActiveRow(row);
    setDialogType('approve');
    setDialogOpen(true);
  };

  const openReject = (row: OnboardingRow) => {
    setActiveRow(row);
    setDialogType('reject');
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (feedback: string) => {
    if (!activeRow) return;

    try {
      await api.post(`/hr/onboarding/${activeRow.id}/review`, {
        decision: dialogType === 'approve' ? 'approved' : 'rejected',
        feedback,
      });
      setDialogOpen(false);
      setActiveRow(null);
      await load(); // refresh list
    } catch (err) {
      console.error('Review failed', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Onboarding Applications
      </Typography>

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
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>{row.employee?.username ?? '—'}</TableCell>
              <TableCell>{row.employee?.email ?? '—'}</TableCell>
              <TableCell>
                <StatusChip status={mapStatus(row.status)} />
              </TableCell>
              <TableCell>
                {row.submittedAt
                  ? new Date(row.submittedAt).toLocaleString()
                  : '—'}
              </TableCell>
              <TableCell align="right">
                {row.status === 'pending' ? (
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
                  '—'
                )}
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 && (
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
        type={dialogType}
        title={
          dialogType === 'approve'
            ? 'Approve Onboarding Application'
            : 'Reject Onboarding Application'
        }
        itemName={activeRow?.employee?.username}
        requireFeedback={dialogType === 'reject'}
        onSubmit={handleDialogSubmit}
        onCancel={() => {
          setDialogOpen(false);
          setActiveRow(null);
        }}
      />
    </Box>
  );
}
