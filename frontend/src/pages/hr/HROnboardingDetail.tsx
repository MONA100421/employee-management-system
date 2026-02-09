import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from "@mui/icons-material";

import {
  getHROnboardingDetail,
  reviewOnboarding,
  type HROnboardingDetail,
} from "../../lib/onboarding";
import FeedbackDialog from "../../components/common/FeedbackDialog";
import StatusChip from "../../components/common/StatusChip";
import OnboardingReview from "../employee/OnboardingReview";
import { useDocuments } from "../../hooks/useDocuments";
import { toOnboardingDoc } from "../../utils/documentMapping";
import type { OnboardingFormValues } from "../employee/onboarding.schema";


/**
 * HR Onboarding Detail Page
 * Read-only version of employee onboarding review
 */
const HROnboardingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<HROnboardingDetail | null>(
    null,
  );

  const { documents: rawDocs, loading: docsLoading } =
    useDocuments("onboarding");

  const documents = rawDocs.map(toOnboardingDoc);

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
  }>({
    open: false,
    type: "approve",
  });

  // Load onboarding detail
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        const data = await getHROnboardingDetail(id);
        setApplication(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Review handlers
  const handleApprove = async () => {
    if (!application) return;
    await reviewOnboarding(application.id, "approved");
    navigate("/hr/hiring");
  };

  const handleReject = async (feedback: string) => {
    if (!application) return;
    await reviewOnboarding(application.id, "rejected", feedback);
    navigate("/hr/hiring");
  };

  // Render states
  if (loading || docsLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!application) {
    return (
      <Alert severity="error">Failed to load onboarding application.</Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Onboarding Application Review
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {application.employee.username} · {application.employee.email}
          </Typography>
        </Box>

        <StatusChip status={application.status} />
      </Stack>

      {/* Status info */}
      {application.status === "rejected" && application.hrFeedback && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Previous HR feedback:</strong>
          <br />
          {application.hrFeedback}
        </Alert>
      )}

      {/* Read-only Review UI */}
      <OnboardingReview
        formData={application.formData as OnboardingFormValues}
        documents={documents}
        readOnly
      />

      <Divider sx={{ my: 4 }} />

      {/* Actions */}
      {application.status === "pending" && (
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => setFeedbackDialog({ open: true, type: "approve" })}
          >
            Approve
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => setFeedbackDialog({ open: true, type: "reject" })}
          >
            Reject
          </Button>

          <Button variant="text" onClick={() => navigate("/hr/hiring")}>
            Back
          </Button>
        </Stack>
      )}

      {/* Feedback Dialog */}
      <FeedbackDialog
        open={feedbackDialog.open}
        type={feedbackDialog.type}
        title={
          feedbackDialog.type === "approve"
            ? "Approve Application"
            : "Reject Application"
        }
        itemName={application.employee.username}
        requireFeedback={feedbackDialog.type === "reject"}
        onCancel={() => setFeedbackDialog({ open: false, type: "approve" })}
        onSubmit={async (feedback) => {
          if (feedbackDialog.type === "approve") {
            await handleApprove();
          } else {
            await handleReject(feedback);
          }
        }}
      />
    </Box>
  );
};

export default HROnboardingDetailPage;
