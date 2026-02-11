import Document from "../models/Document";
import Notification from "../models/Notification";
import { enqueueDocumentRejectedEmail } from "../queues/emailQueue";
import { NotificationTypes } from "../utils/notificationTypes";


export async function reviewDocumentService({
  docId,
  decision,
  reviewer,
  feedback,
}: {
  docId: string;
  decision: "approved" | "rejected";
  reviewer: { id: string; username?: string };
  feedback?: string;
}) {
  const doc = await Document.findById(docId).populate("user", "email username");
  if (!doc) throw new Error("Document not found");
  if (doc.status !== "pending") throw new Error("Document is not pending");

  const newStatus = decision === "approved" ? "approved" : "rejected";

  doc.status = newStatus;
  doc.reviewedAt = new Date();
  doc.reviewedBy = reviewer.id as any; // let mongoose cast
  doc.hrFeedback = decision === "rejected" ? feedback : undefined;

  doc.audit = doc.audit || [];
  doc.audit.push({
    action: newStatus,
    by: reviewer.id as any,
    username: reviewer.username ?? null,
    at: new Date(),
    feedback: decision === "rejected" ? (feedback ?? null) : null,
  });

  await doc.save();

  // In-app notification, email (reject only)
  if (doc.user) {
    const user = doc.user as any;

    await Notification.create({
      user: user._id,
      type:
        decision === "approved"
          ? NotificationTypes.DOCUMENT_APPROVED
          : NotificationTypes.DOCUMENT_REJECTED,
      title: `Document ${decision === "approved" ? "approved" : "rejected"}: ${doc.type}`,
      message:
        feedback ||
        (decision === "approved"
          ? "Your document was approved."
          : "Please upload a corrected document."),
      data: { documentId: doc._id, documentType: doc.type },
    });

    if (decision === "rejected" && user.email) {
      await enqueueDocumentRejectedEmail({
        to: user.email,
        documentType: doc.type,
        reviewer: reviewer.username || "HR",
        feedback,
      });
    }
  }

  return doc;
}
