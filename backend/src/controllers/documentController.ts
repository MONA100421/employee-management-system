import { Request, Response } from "express";
import Document from "../models/Document";
import User from "../models/User"; 
import Notification from "../models/Notification";
import { reviewDocumentService } from "../services/documentReviewService";
import { enqueueDocumentRejectedEmail } from "../queues/emailQueue"; 

const dbToUIStatus = (s: string) => {
  switch (s) {
    case "not_started":
      return "not-started";
    case "pending":
      return "pending";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      return "not-started";
  }
};

// EMPLOYEE

export const getMyDocuments = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ ok: false });

  const docs = await Document.find({ user: user.userId }).lean();

  return res.json({
    ok: true,
    documents: docs.map((d: any) => ({
      id: d._id,
      type: d.type,
      category: d.category,
      status: dbToUIStatus(d.status),
      fileName: d.fileName ?? null,
      fileUrl: d.fileUrl ?? null,
      uploadedAt: d.uploadedAt ?? null,
      reviewedAt: d.reviewedAt ?? null,
      hrFeedback: d.hrFeedback ?? null,
    })),
  });
};

export const uploadDocument = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ ok: false });

  const { type, category, fileName, fileUrl } = req.body;
  if (!type || !category || !fileName) {
    return res.status(400).json({ ok: false, message: "Missing fields" });
  }

  let doc = await Document.findOne({ user: user.userId, type });
  if (!doc) {
    doc = new Document({ user: user.userId, type, category });
  }

  if (doc.status === "approved") {
    return res.status(400).json({ ok: false, message: "Already approved" });
  }

  doc.fileName = fileName;
  doc.fileUrl = fileUrl;
  doc.status = "pending";
  doc.uploadedAt = new Date();
  doc.hrFeedback = undefined;
  await doc.save();

  await Notification.create({
    user: user.userId,
    type: "document_uploaded",
    title: "Document Uploaded",
    message: `${doc.type} document uploaded`,
    data: {
      documentId: doc._id.toString(),
      documentType: doc.type,
    },
  });

  return res.json({
    ok: true,
    document: {
      id: doc._id,
      type: doc.type,
      status: dbToUIStatus(doc.status),
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      uploadedAt: doc.uploadedAt,
    },
  });
};

// HR

export const reviewDocument = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== "hr") {
    return res.status(403).json({ ok: false });
  }

  const docId = String(req.params.id);
  const { decision, feedback } = req.body;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ ok: false });
  }

  const updatedDoc = await reviewDocumentService({
    docId,
    decision,
    reviewer: { id: user.userId, username: user.username },
    feedback,
  });

  await Notification.create({
    user: updatedDoc.user,
    type: decision === "approved" ? "document_approved" : "document_rejected",
    title: decision === "approved" ? "Document Approved" : "Document Rejected",
    message: `${updatedDoc.type} document ${decision}`,
    data: {
      documentId: updatedDoc._id.toString(),
      documentType: updatedDoc.type,
    },
  });

  if (decision === "rejected") {
    try {
      const employee = await User.findById(updatedDoc.user);

      if (employee && employee.email) {
        await enqueueDocumentRejectedEmail({
          to: employee.email,
          documentType: updatedDoc.type,
          reviewer: user.username || "HR Manager",
          feedback: feedback || "No specific reason provided.",
        });
      }
    } catch (emailError) {
      console.error("Failed to enqueue rejection email:", emailError);
    }
  }

  return res.json({
    ok: true,
    status: dbToUIStatus(updatedDoc.status),
  });
};

export const getDocumentsForHRByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const docs = await Document.find({ user: userId }).lean();

  return res.json({
    ok: true,
    documents: docs.map((d: any) => ({
      id: d._id,
      type: d.type,
      category: d.category,
      status: dbToUIStatus(d.status),
      fileName: d.fileName ?? null,
      fileUrl: d.fileUrl ?? null,
      uploadedAt: d.uploadedAt ?? null,
      reviewedAt: d.reviewedAt ?? null,
      hrFeedback: d.hrFeedback ?? null,
    })),
  });
};

export const getVisaDocumentsForHR = async (_req: Request, res: Response) => {
  const docs = await Document.find({ category: "visa" })
    .populate("user", "username email")
    .lean();

  return res.json({
    ok: true,
    documents: docs.map((d: any) => ({
      id: d._id,
      type: d.type,
      category: d.category,
      status: dbToUIStatus(d.status),
      fileName: d.fileName ?? null,
      fileUrl: d.fileUrl ?? null,
      uploadedAt: d.uploadedAt ?? null,
      hrFeedback: d.hrFeedback ?? null,
      user: d.user
        ? { id: d.user._id, username: d.user.username, email: d.user.email }
        : null,
    })),
  });
};
