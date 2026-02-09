import React, { useState } from "react";
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
  Collapse,
  ListItemIcon,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  History as HistoryIcon,
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
  const [openAuditFor, setOpenAuditFor] = useState<string | null>(null);
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
          <React.Fragment key={d.id}>
            <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
              <ListItemText
                primary={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontWeight={700} noWrap>
                      {d.type}
                    </Typography>

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

                    <Tooltip title="Show audit timeline">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setOpenAuditFor(openAuditFor === d.id ? null : d.id)
                        }
                      >
                        <HistoryIcon fontSize="small" />
                        <ExpandMoreIcon
                          sx={{
                            transform:
                              openAuditFor === d.id ? "rotate(180deg)" : "none",
                            transition: "transform 150ms",
                            ml: 0.5,
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
                secondary={
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {d.fileName ? `Uploaded ${d.uploadedAt}` : "Not uploaded"}
                    </Typography>

                    <Box mt={0.5}>
                      {d.reviewedBy && (
                        <Typography variant="caption" color="text.secondary">
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
                    </Box>
                  </>
                }
              />

              <ListItemSecondaryAction>
                {!readonly && d.status === "pending" && (
                  <>
                    <Tooltip title="Approve">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => setConfirmApproveId(d.id)}
                        disabled={!!loadingMap[d.id]}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Reject">
                      <IconButton
                        edge="end"
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

            {/* ===== Audit timeline ===== */}
            <Collapse in={openAuditFor === d.id} timeout="auto" unmountOnExit>
              <List sx={{ pl: 4 }}>
                {d.audit && d.audit.length > 0 ? (
                  d.audit
                    .slice()
                    .reverse()
                    .map((a, idx) => (
                      <ListItem key={idx} sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <InfoIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2">
                              {a.action === "approved"
                                ? "Approved"
                                : "Rejected"}{" "}
                              by {a.by?.username ?? "Unknown"}
                              {a.at
                                ? ` • ${new Date(a.at).toLocaleString()}`
                                : ""}
                            </Typography>
                          }
                          secondary={
                            a.feedback ? (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Feedback: {a.feedback}
                              </Typography>
                            ) : null
                          }
                        />
                      </ListItem>
                    ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="caption">
                          No audit history
                        </Typography>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Collapse>

            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>

      {/* ===== Approve confirm ===== */}
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

      {/* ===== Reject with feedback ===== */}
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
