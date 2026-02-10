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
