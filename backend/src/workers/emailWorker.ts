import { emailQueue } from "../queues/emailQueue";
import {
  sendDocumentRejectedEmail,
  sendOnboardingDecisionEmail,
  sendInviteEmail,
} from "../utils/email";

emailQueue.on('failed', (job, err) => {
  console.error(`❌ [Worker] Job ${job?.id} failed with error:`, err);
});

// Process document rejection emails
emailQueue.process("documentRejected", async (job) => {
  const { to, documentType, reviewer, feedback } = job.data;
  await sendDocumentRejectedEmail({ to, documentType, reviewer, feedback });
});

// Process onboarding decision emails
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

// Process registration invitation emails
emailQueue.process("registrationInvite", async (job) => {
  const { to, rawToken, fullName } = job.data; // Add fullName here
  console.log(`📩 [Worker] Sending warm invite to: ${fullName} (${to})`);
  await sendInviteEmail(to, rawToken, fullName); // Pass fullName here
  return { status: "sent" };
});
