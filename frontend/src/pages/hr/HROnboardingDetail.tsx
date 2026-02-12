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
import HRDocumentReviewPanel from "../../components/common/HRDocumentReviewPanel";

import { toOnboardingDoc } from "../../utils/documentMapping";
import type { BaseDocument } from "../../types/document";
import type { OnboardingDocument } from "../../types/document";
import type { OnboardingFormValues } from "../employee/onboarding.schema";

const HROnboardingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState<HROnboardingDetail | null>(
    null,
  );
  const [approveError, setApproveError] = useState<string | null>(null);

  // raw documents (backend BaseDocument)
  const [baseDocuments, setBaseDocuments] = useState<BaseDocument[]>([]);
  // mapped for onboarding review UI (has title)
  const [reviewDocuments, setReviewDocuments] = useState<OnboardingDocument[]>(
    [],
  );

  const unapprovedDocs = reviewDocuments.filter((d) => d.status !== "approved");

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean;
    type: "approve" | "reject";
    docId: string | null;
  }>({ open: false, type: "approve", docId: null });

  const loadAll = async (appId?: string) => {
    if (!appId) return;
    setLoading(true);
    try {
      const app = await getHROnboardingDetail(appId);
      setApplication(app);

      if (app.employee?.id) {
        const docs = await getDocumentsForHR(app.employee.id);
        const onboardingDocs = docs.filter((d) => d.category === "onboarding");
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

  useEffect(() => {
    if (!id) return;
    loadAll(id);
  }, [id]);

  const canReview = application?.status === "pending";

  /* Document approve/reject - use API then refresh via loadAll */
  const handleApproveDoc = async (docId: string) => {
    try {
      await reviewDocument(docId, "approved");
      if (application?.employee?.id) await loadAll(application?.id);
    } catch (err) {
      console.error("approve doc failed", err);
    }
  };

  const handleRejectDoc = async (docId: string, feedback: string) => {
    try {
      await reviewDocument(docId, "rejected", feedback);
      if (application?.employee?.id) await loadAll(application?.id);
    } catch (err) {
      console.error("reject doc failed", err);
    }
  };

  /* Application review */
  const handleApproveApp = async () => {
    if (!application) return;
    try {
      setApproveError(null);
      await reviewOnboarding(application.id, "approved");
      navigate("/hr/hiring");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to approve application. Please try again.";
      setApproveError(message);
    }
  };

  const handleRejectApp = async (feedback: string) => {
    if (!application) return;
    await reviewOnboarding(application.id, "rejected", feedback);
    navigate("/hr/hiring");
  };

  if (loading)
    return (
      <Box sx={{ display: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  if (!application)
    return (
      <Alert severity="error">Failed to load onboarding application.</Alert>
    );

  return (
    <Box>
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

      {application.status === "rejected" && application.hrFeedback && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Previous HR feedback:</strong>
          <br />
          {application.hrFeedback}
        </Alert>
      )}

      <OnboardingReview
        formData={application.formData as OnboardingFormValues}
        documents={reviewDocuments}
        readOnly
        onFixDocument={() => {}}
      />

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" fontWeight={600} mb={2}>
        Onboarding Documents
      </Typography>

      <HRDocumentReviewPanel
        documents={baseDocuments}
        readonly={!canReview}
        onApprove={handleApproveDoc}
        onReject={handleRejectDoc}
        onRefresh={() => loadAll(application.id)}
      />

      <Divider sx={{ my: 4 }} />

      {approveError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {approveError}
        </Alert>
      )}

      {approveError && unapprovedDocs.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          The following documents are not approved yet:
          <ul>
            {unapprovedDocs.map((d) => (
              <li key={d.id}>{d.title}</li>
            ))}
          </ul>
        </Alert>
      )}

      {canReview ? (
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
      ) : (
        <Box
          sx={{
            p: 2,
            bgcolor: "action.hover",
            borderRadius: 1,
            textAlign: "center",
          }}
        >
          <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
            This application is already <strong>{application.status}</strong>.
            No further actions are required.
          </Alert>
          <Button variant="contained" onClick={() => navigate("/hr/hiring")}>
            Return to Management List
          </Button>
        </Box>
      )}

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
