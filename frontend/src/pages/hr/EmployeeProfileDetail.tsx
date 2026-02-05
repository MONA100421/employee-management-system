import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useDocuments } from "../../hooks/useDocuments";

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

  const handleApprove = (id: string) => {
    setReviewingId(id);
    setDecision("approved");
    setConfirmOpen(true);
  };

  const handleReject = (id: string) => {
    setReviewingId(id);
    setDecision("rejected");
  };

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

      <Grid container spacing={3}>
        {documents.map((doc) => (
          <Grid key={doc.id} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography fontWeight={600}>{doc.type}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: {doc.status}
                </Typography>

                {doc.fileName && (
                  <Typography variant="body2">File: {doc.fileName}</Typography>
                )}

                {doc.hrFeedback && (
                  <Typography variant="body2" color="error">
                    Feedback: {doc.hrFeedback}
                  </Typography>
                )}

                {doc.status === "pending" && (
                  <Box sx={{mt: 2, display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      color="success"
                      variant="contained"
                      onClick={() => handleApprove(doc.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleReject(doc.id)}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
