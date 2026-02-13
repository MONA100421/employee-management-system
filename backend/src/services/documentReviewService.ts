import Document from "../models/Document";
import Notification from "../models/Notification";
import { enqueueDocumentRejectedEmail } from "../queues/emailQueue";
import { NotificationTypes } from "../utils/notificationTypes";

export async function reviewDocumentService({
  docId,
  decision,
  reviewer,
  feedback,
  version,
}: {
  docId: string;
  decision: "approved" | "rejected";
  reviewer: { id: string; username?: string };
  feedback?: string;
  version: number;
}) {
  const updatedDoc = await Document.findOneAndUpdate(
    {
      _id: docId,
      __v: version,
      status: "pending",
    },
    {
      $set: {
        status: decision,
        reviewedAt: new Date(),
        reviewedBy: reviewer.id,
        hrFeedback: decision === "rejected" ? feedback : null,
      },
      $push: {
        audit: {
          action: decision,
          by: reviewer.id,
          username: reviewer.username ?? null,
          at: new Date(),
          feedback: decision === "rejected" ? (feedback ?? null) : null,
        },
      },
      $inc: { __v: 1 },
    },
    { new: true },
  ).populate("user", "email username");

  if (!updatedDoc) {
    throw new Error("Race condition detected or invalid state");
  }

  const user = updatedDoc.user as any;

  await Notification.create({
    user: user._id,
    type:
      decision === "approved"
        ? NotificationTypes.DOCUMENT_APPROVED
        : NotificationTypes.DOCUMENT_REJECTED,
    title: decision === "approved" ? "Document Approved" : "Document Rejected",
    message:
      decision === "approved"
        ? "Your document was approved."
        : feedback || "Please upload a corrected document.",
    data: {
      documentId: updatedDoc._id,
      documentType: updatedDoc.type,
    },
  });

  if (decision === "rejected" && user.email) {
    await enqueueDocumentRejectedEmail({
      to: user.email,
      documentType: updatedDoc.type,
      reviewer: reviewer.username || "HR",
      feedback,
    });
  }

  return updatedDoc;
}
