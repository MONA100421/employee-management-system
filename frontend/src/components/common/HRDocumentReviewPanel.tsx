// frontend/src/components/common/HRDocumentReviewPanel.tsx
import { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  Chip,
  Stack,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

import type { BaseDocument } from "../../types/document";
import ConfirmDialog from "./ConfirmDialog";
import FeedbackDialog from "./FeedbackDialog";

type Props = {
  documents: BaseDocument[];
  readonly?: boolean;
  onApprove: (docId: string) => Promise<void>;
  onReject: (docId: string, feedback: string) => Promise<void>;
  onRefresh: () => Promise<void>;
};

export default function HRDocumentReviewPanel({
  documents,
  readonly = false,
  onApprove,
  onReject,
  onRefresh,
}: Props) {
  const [confirmApproveId, setConfirmApproveId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const handleApprove = async (docId: string) => {
    setLoadingMap((m) => ({ ...m, [docId]: true }));
    try {
      await onApprove(docId);
      await onRefresh();
    } finally {
      setLoadingMap((m) => ({ ...m, [docId]: false }));
      setConfirmApproveId(null);
    }
  };

  const handleReject = async (docId: string, feedback: string) => {
    setLoadingMap((m) => ({ ...m, [docId]: true }));
    try {
      await onReject(docId, feedback);
      await onRefresh();
    } finally {
      setLoadingMap((m) => ({ ...m, [docId]: false }));
      setRejectTargetId(null);
    }
  };

  return (
    <Box>
      <List disablePadding>
        {documents.map((d) => (
          <Box key={d.id}>
            <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={700}>{d.type}</Typography>
                    <Chip
                      label={d.status}
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "capitalize" }}
                    />
                    {d.hrFeedback && (
                      <Tooltip title={d.hrFeedback}>
                        <InfoIcon fontSize="small" />
                      </Tooltip>
                    )}
                  </Stack>
                }
                secondary={
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {d.fileName ? `Uploaded ${d.uploadedAt}` : "Not uploaded"}
                    </Typography>

                    {d.reviewedBy && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        Reviewed by {d.reviewedBy.username}
                        {d.reviewedAt
                          ? ` • ${new Date(d.reviewedAt).toLocaleString()}`
                          : ""}
                      </Typography>
                    )}

                    {d.hrFeedback && (
                      <Typography
                        variant="caption"
                        color="error"
                        display="block"
                      >
                        Feedback: {d.hrFeedback}
                      </Typography>
                    )}
                  </>
                }
              />

              <ListItemSecondaryAction>
                {!readonly && d.status === "pending" && (
                  <>
                    <Tooltip title="Approve">
                      <IconButton
                        size="small"
                        onClick={() => setConfirmApproveId(d.id)}
                        disabled={!!loadingMap[d.id]}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Reject">
                      <IconButton
                        size="small"
                        onClick={() => setRejectTargetId(d.id)}
                        disabled={!!loadingMap[d.id]}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </Box>
        ))}
      </List>

      {/* Approve confirm */}
      {confirmApproveId && (
        <ConfirmDialog
          open
          title="Approve Document"
          message="Are you sure you want to approve this document?"
          confirmText="Approve"
          confirmColor="success"
          onCancel={() => setConfirmApproveId(null)}
          onConfirm={() => handleApprove(confirmApproveId)}
        />
      )}

      {/* Reject with feedback */}
      {rejectTargetId && (
        <FeedbackDialog
          open
          type="reject"
          title="Reject Document"
          requireFeedback
          onCancel={() => setRejectTargetId(null)}
          onSubmit={(feedback) => handleReject(rejectTargetId, feedback)}
        />
      )}
    </Box>
  );
}
