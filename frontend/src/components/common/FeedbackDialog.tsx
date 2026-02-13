import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";

interface FeedbackDialogProps {
  open: boolean;
  type: "approve" | "reject";
  title: string;
  itemName?: string;
  requireFeedback?: boolean;
  loading?: boolean;
  onSubmit: (feedback: string) => void;
  onCancel: () => void;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  type,
  title,
  itemName,
  requireFeedback = false,
  loading = false,
  onSubmit,
  onCancel,
}) => {
  const theme = useTheme();
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState(false);

  /**
   * Validates feedback and triggers the onSubmit callback.
   * If rejection reason is required but empty, it shows an error.
   */
  const handleSubmit = () => {
    if (requireFeedback && type === "reject" && !feedback.trim()) {
      setError(true);
      return;
    }
    onSubmit(feedback);
    setError(false);
  };

  /**
   * Resets internal state and calls the onCancel callback.
   */
  const handleClose = () => {
    if (loading) return;
    setFeedback("");
    setError(false);
    onCancel();
  };

  const isApprove = type === "approve";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      // Prevent clicking outside to close while loading
      disableEscapeKeyDown={loading}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {isApprove ? (
            <ApproveIcon
              sx={{ color: theme.palette.success.main, fontSize: 28 }}
            />
          ) : (
            <RejectIcon
              sx={{ color: theme.palette.error.main, fontSize: 28 }}
            />
          )}
          <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {itemName && (
          <Typography
            variant="body2"
            sx={{ mb: 2, color: theme.palette.text.secondary }}
          >
            {isApprove ? "You are about to approve" : "You are about to reject"}
            : <strong>{itemName}</strong>
          </Typography>
        )}
        <TextField
          fullWidth
          multiline
          rows={4}
          disabled={loading} // Disable input while submitting
          label={isApprove ? "Comments (optional)" : "Reason for rejection"}
          placeholder={
            isApprove
              ? "Add any comments or notes..."
              : "Please provide a reason for rejection..."
          }
          value={feedback}
          onChange={(e) => {
            setFeedback(e.target.value);
            if (error) setError(false);
          }}
          error={error}
          helperText={error ? "Rejection reason is required" : ""}
          required={!isApprove && requireFeedback}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          color="inherit"
          disabled={loading} // Prevent canceling during submission
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={isApprove ? "success" : "error"}
          disabled={loading} // Prevent double submission
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {loading ? "Submitting..." : isApprove ? "Approve" : "Reject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
