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
import { getDocumentsForHR, reviewDocument } from "../../lib/documents";

import FeedbackDialog from "../../components/common/FeedbackDialog";
import StatusChip from "../../components/common/StatusChip";
import OnboardingReview from "../employee/OnboardingReview";
import DocumentList from "../../components/common/DocumentList";

import { toOnboardingDoc } from "../../utils/documentMapping";
import type { BaseDocument } from "../../types/document";
import type { OnboardingDocument } from "../employee/types";
import type { OnboardingFormValues } from "../employee/onboarding.schema";

// HR Onboarding Detail Page
const HROnboardingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<HROnboardingDetail | null>(
    null,
  );

  const [baseDocuments, setBaseDocuments] = useState<BaseDocument[]>([]);

  const [reviewDocuments, setReviewDocuments] = useState<OnboardingDocument[]>(
    [],
  );

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    docId: string | null; // null = whole application
  }>({
    open: false,
    type: "approve",
    docId: null,
  });

  // Load onboarding + documents
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      try {
        const app = await getHROnboardingDetail(id);
        setApplication(app);

        if (app.employee?.id) {
          const docs = await getDocumentsForHR(app.employee.id);

          const onboardingDocs = docs.filter(
            (d) => d.category === "onboarding",
          );

          setBaseDocuments(onboardingDocs);
          setReviewDocuments(onboardingDocs.map(toOnboardingDoc));
        } else {
          setBaseDocuments([]);
          setReviewDocuments([]);
        }
      } catch (err) {
        console.error("Failed to load HR onboarding detail", err);
        setApplication(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // Document review handlers
  const handleApproveDoc = async (docId: string) => {
    await reviewDocument(docId, "approved");

    setBaseDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: "approved" } : d)),
    );
    setReviewDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, status: "approved" } : d)),
    );
  };

  const handleRejectDoc = async (docId: string, feedback: string) => {
    await reviewDocument(docId, "rejected", feedback);

    setBaseDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, status: "rejected", hrFeedback: feedback } : d,
      ),
    );
    setReviewDocuments((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, status: "rejected", feedback } : d,
      ),
    );
  };

  // Application review handlers
  const handleApproveApp = async () => {
    if (!application) return;
    await reviewOnboarding(application.id, "approved");
    navigate("/hr/hiring");
  };

  const handleRejectApp = async (feedback: string) => {
    if (!application) return;
    await reviewOnboarding(application.id, "rejected", feedback);
    navigate("/hr/hiring");
  };

  // Render states
  if (loading) {
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

      {/* Previous HR feedback */}
      {application.status === "rejected" && application.hrFeedback && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Previous HR feedback:</strong>
          <br />
          {application.hrFeedback}
        </Alert>
      )}

      {/* Read-only onboarding review */}
      <OnboardingReview
        formData={application.formData as OnboardingFormValues}
        documents={reviewDocuments}
        readOnly
        onFixDocument={() => {}}
      />

      <Divider sx={{ my: 4 }} />

      {/* HR document review */}
      <Typography variant="h6" fontWeight={600} mb={2}>
        Onboarding Documents
      </Typography>

      <DocumentList
        documents={baseDocuments}
        readonly
        onApprove={(docId) => handleApproveDoc(docId)}
        onReject={(docId) =>
          setFeedbackDialog({ open: true, type: "reject", docId })
        }
      />

      <Divider sx={{ my: 4 }} />

      {/* Application actions */}
      {application.status === "pending" && (
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() =>
              setFeedbackDialog({ open: true, type: "approve", docId: null })
            }
          >
            Approve Application
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() =>
              setFeedbackDialog({ open: true, type: "reject", docId: null })
            }
          >
            Reject Application
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
          feedbackDialog.docId
            ? "Reject Document"
            : feedbackDialog.type === "approve"
              ? "Approve Application"
              : "Reject Application"
        }
        itemName={application.employee.username}
        requireFeedback={feedbackDialog.type === "reject"}
        onCancel={() =>
          setFeedbackDialog({ open: false, type: "approve", docId: null })
        }
        onSubmit={async (feedback) => {
          if (feedbackDialog.docId) {
            await handleRejectDoc(feedbackDialog.docId, feedback);
          } else if (feedbackDialog.type === "approve") {
            await handleApproveApp();
          } else {
            await handleRejectApp(feedback);
          }
        }}
      />
    </Box>
  );
};

export default HROnboardingDetailPage;
