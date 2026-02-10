import { emailQueue } from "../queues/emailQueue";
import { sendDocumentRejectedEmail } from "../utils/email";

emailQueue.process("documentRejected", async (job) => {
  const { to, documentType, reviewer, feedback } = job.data;
  // send email (utils/email)
  await sendDocumentRejectedEmail({ to, documentType, reviewer, feedback });
});
