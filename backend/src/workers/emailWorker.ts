import { emailQueue } from "../queues/emailQueue";
import {
  sendDocumentRejectedEmail,
  sendOnboardingDecisionEmail,
} from "../utils/email";


emailQueue.process("documentRejected", async (job) => {
  const { to, documentType, reviewer, feedback } = job.data;
  await sendDocumentRejectedEmail({ to, documentType, reviewer, feedback });
});

emailQueue.process("onboardingDecision", async (job) => {
  const { to, decision, reviewer, onboardingId, feedback } = job.data;
  await sendOnboardingDecisionEmail({
    to,
    decision,
    reviewer,
    onboardingId,
    feedback,
  });
});
