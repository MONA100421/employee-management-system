import Document from "../models/Document";

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
  const doc = await Document.findById(docId);
  if (!doc) throw new Error("Document not found");
  if (doc.status !== "pending") throw new Error("Not pending");

  const newStatus = decision === "approved" ? "approved" : "rejected";
  doc.status = newStatus;
  doc.reviewedAt = new Date();
  // cast reviewer id -> any so TS/Mongoose happy
  (doc as any).reviewedBy = reviewer.id as any;
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
  return doc;
}
