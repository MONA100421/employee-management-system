import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useDocuments } from "../../hooks/useDocuments";
import DocumentList from "../../components/common/DocumentList";

const EmployeeProfileDetail = () => {
  const navigate = useNavigate();
  const { documents, loading, reviewDocument } = useDocuments("all");

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) {
    return <Typography>Loading documents…</Typography>;
  }

  const handleConfirmApprove = async () => {
    if (!reviewingId) return;

    await reviewDocument(reviewingId, "approved");

    setReviewingId(null);
    setDecision(null);
    setConfirmOpen(false);
  };

  return (
    <Box>
      <Button onClick={() => navigate("/hr/employees")} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Employee Documents
      </Typography>

      <DocumentList
        documents={documents}
        readonly
        onApprove={(id) => {
          setReviewingId(id);
          setDecision("approved");
          setConfirmOpen(true);
        }}
        onReject={(id) => {
          setReviewingId(id);
          setDecision("rejected");
        }}
      />

      {/* Reject dialog (needs feedback) */}
      <FeedbackDialog
        open={!!reviewingId && decision === "rejected"}
        title="Reject Document"
        type="reject"
        requireFeedback
        onCancel={() => {
          setReviewingId(null);
          setDecision(null);
        }}
        onSubmit={async (value) => {
          if (!reviewingId) return;

          await reviewDocument(reviewingId, "rejected", value);

          setReviewingId(null);
          setDecision(null);
        }}
      />

      {/* Approve confirm */}
      <ConfirmDialog
        open={confirmOpen && decision === "approved"}
        title="Approve Document"
        message="Are you sure you want to approve this document?"
        confirmText="Approve"
        confirmColor="success"
        onCancel={() => {
          setConfirmOpen(false);
          setReviewingId(null);
          setDecision(null);
        }}
        onConfirm={handleConfirmApprove}
      />
    </Box>
  );
};

export default EmployeeProfileDetail;
