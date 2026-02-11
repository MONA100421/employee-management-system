import Queue from "bull";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export const emailQueue = new Queue("email", REDIS_URL);

export async function enqueueDocumentRejectedEmail(payload: {
  to: string;
  documentType: string;
  reviewer: string;
  feedback?: string;
}) {
  await emailQueue.add("documentRejected", payload, {
    attempts: 3,
    backoff: 5000,
  });
}

export async function enqueueOnboardingDecisionEmail(payload: {
  to: string;
  decision: "approved" | "rejected";
  reviewer: string;
  onboardingId?: string;
  feedback?: string;
}) {
  await emailQueue.add("onboardingDecision", payload, {
    attempts: 3,
    backoff: 5000,
  });
}

emailQueue.on("error", (err) => console.error("Redis Queue Error:", err));

export async function enqueueInviteEmail(to: string, rawToken: string) {
  await emailQueue.add(
    "registrationInvite",
    { to, rawToken },
    {
      attempts: 3,
      backoff: 5000,
    },
  );
}