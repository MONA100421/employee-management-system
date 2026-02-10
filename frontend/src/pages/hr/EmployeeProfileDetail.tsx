import { Box, Button, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DocumentList from "../../components/common/DocumentList";
import api from "../../lib/api";
import type { BaseDocument } from "../../types/document";

const EmployeeProfileDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [documents, setDocuments] = useState<BaseDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/documents/hr/${id}`);
        setDocuments(res.data.documents);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const reviewDocument = async (
    docId: string,
    decision: "approved" | "rejected",
    feedback?: string,
  ) => {
    await api.post(`/documents/${docId}/review`, { decision, feedback });
    const res = await api.get(`/documents/hr/${id}`);
    setDocuments(res.data.documents);
  };

  if (loading) return <Typography>Loading documents…</Typography>;

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
        onApprove={(docId) => {
          setReviewingId(docId);
          setDecision("approved");
          setConfirmOpen(true);
        }}
        onReject={(docId) => {
          setReviewingId(docId);
          setDecision("rejected");
        }}
      />

      <FeedbackDialog
        open={!!reviewingId && decision === "rejected"}
        type="reject"
        requireFeedback
        title="Reject Document"
        onCancel={() => {
          setReviewingId(null);
          setDecision(null);
        }}
        onSubmit={async (feedback) => {
          if (!reviewingId) return;
          await reviewDocument(reviewingId, "rejected", feedback);
          setReviewingId(null);
          setDecision(null);
        }}
      />

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
        onConfirm={async () => {
          if (!reviewingId) return;
          await reviewDocument(reviewingId, "approved");
          setConfirmOpen(false);
          setReviewingId(null);
          setDecision(null);
        }}
      />
    </Box>
  );
};

export default EmployeeProfileDetail;
