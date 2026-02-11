import { Request, Response } from "express";
import Document from "../models/Document";
import { reviewDocumentService } from "../services/documentReviewService";
import Notification from "../models/Notification";

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

const uiToDBStatus = (s: string) => {
  switch (s) {
    case "not-started":
      return "not_started";
    case "pending":
      return "pending";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      return "not_started";
  }
};

export const getMyDocuments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ ok: false });
    }

    const docs = await Document.find({ user: user.id })
      .populate("reviewedBy", "username")
      .lean();

    return res.json({
      ok: true,
      documents: docs.map((d: any) => ({
        id: d._id,
        type: d.type,
        category: d.category,
        status: dbToUIStatus(d.status),
        fileName: d.fileName ?? null,
        uploadedAt: d.uploadedAt ?? null,
        reviewedAt: d.reviewedAt ?? null,
        reviewedBy: d.reviewedBy
          ? {
              id: (d.reviewedBy as any)._id,
              username: (d.reviewedBy as any).username,
            }
          : null,
        hrFeedback: d.hrFeedback ?? null,
        audit: (d.audit || []).map((a: any) => ({
          action: a.action,
          at: a.at,
          feedback: a.feedback ?? null,
          by: a.by ? { id: a.by, username: a.username } : null,
        })),
      })),
    });
  } catch (err) {
    console.error("getMyDocuments error", err);
    return res.status(500).json({ ok: false });
  }
};

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ ok: false });

    const { type, category, fileName, fileUrl } = req.body;
    if (!type || !category || !fileName) {
      return res.status(400).json({ ok: false, message: "Missing fields" });
    }

    let doc = await Document.findOne({ user: user.id, type });

    if (!doc) {
      doc = new Document({
        user: user.id,
        type,
        category,
      });
    }

    if (doc.status === "approved") {
      return res.status(400).json({ ok: false, message: "Already approved" });
    }

    const validMap: Record<string, string[]> = {
      onboarding: ["id_card", "work_auth", "profile_photo"],
      visa: ["opt_receipt", "opt_ead", "i_983", "i_20"],
    };

    if (!validMap[category]?.includes(type)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid document type for category" });
    }

    doc.fileName = fileName;
    doc.fileUrl = fileUrl ?? doc.fileUrl;
    doc.status = "pending";
    doc.uploadedAt = new Date();
    doc.hrFeedback = undefined;

    await doc.save();

    await Notification.create({
      user: user.id,
      type: "document_uploaded",
      title: "Document Uploaded",
      message: `You have successfully uploaded the ${doc.type} document.`,
      data: { docId: doc._id },
    });

    return res.json({
      ok: true,
      document: {
        id: doc._id,
        type: doc.type,
        status: dbToUIStatus(doc.status),
        fileName: doc.fileName,
        uploadedAt: doc.uploadedAt,
        hrFeedback: doc.hrFeedback ?? null,
      },
    });
  } catch (err) {
    console.error("uploadDocument error", err);
    return res.status(500).json({ ok: false });
  }
};

export const reviewDocument = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== "hr") {
      return res.status(403).json({ ok: false });
    }

    const { id } = req.params;
    const docId = String(id);
    const { decision, feedback } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ ok: false, message: "Invalid decision" });
    }

    const updatedDoc = await reviewDocumentService({
      docId,
      decision,
      reviewer: { id: user.id, username: (user as any).username },
      feedback,
    });

    await Notification.create({
      user: updatedDoc.user,
      type: decision === "approved" ? "document_approved" : "document_rejected",
      title:
        decision === "approved" ? "Document Approved" : "Document Rejected",
      message: `${updatedDoc.type} document has been ${decision}`,
      data: { docId: updatedDoc._id },
    });

    return res.json({
      ok: true,
      status: dbToUIStatus(updatedDoc.status),
    });
  } catch (err: any) {
    console.error("reviewDocument error", err);
    return res.status(400).json({
      ok: false,
      message: err.message || "Review failed",
    });
  }
};

// GET /api/hr/documents/:userId
export const getDocumentsForHRByUser = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== "hr") {
      return res.status(403).json({ ok: false });
    }

    const { userId } = req.params;

    const docs = await Document.find({ user: userId })
      .populate("reviewedBy", "username")
      .lean();

    return res.json({
      ok: true,
      documents: docs.map((d: any) => ({
        id: d._id,
        type: d.type,
        category: d.category,
        status: dbToUIStatus(d.status),
        fileName: d.fileName ?? null,
        uploadedAt: d.uploadedAt ?? null,
        reviewedAt: d.reviewedAt ?? null,
        reviewedBy: d.reviewedBy
          ? {
              id: (d.reviewedBy as any)._id,
              username: (d.reviewedBy as any).username,
            }
          : null,
        hrFeedback: d.hrFeedback ?? null,
        audit: (d.audit || []).map((a: any) => ({
          action: a.action,
          at: a.at,
          feedback: a.feedback ?? null,
          by: a.by ? { id: a.by, username: a.username } : null,
        })),
      })),
    });
  } catch (err) {
    console.error("getDocumentsForHRByUser error", err);
    return res.status(500).json({ ok: false });
  }
};

// GET /api/hr/documents/visa
export const getVisaDocumentsForHR = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== "hr") {
      return res.status(403).json({ ok: false });
    }

    const docs = await Document.find({ category: "visa" })
      .populate("user", "username email")
      .populate("reviewedBy", "username")
      .lean();

    return res.json({
      ok: true,
      documents: docs.map((d: any) => ({
        id: d._id,
        type: d.type,
        category: d.category,
        status: dbToUIStatus(d.status),
        fileName: d.fileName ?? null,
        uploadedAt: d.uploadedAt ?? null,
        reviewedAt: d.reviewedAt ?? null,
        reviewedBy: d.reviewedBy
          ? {
              id: (d.reviewedBy as any)._id,
              username: (d.reviewedBy as any).username,
            }
          : null,
        hrFeedback: d.hrFeedback ?? null,
        user: d.user
          ? { id: d.user._id, username: d.user.username, email: d.user.email }
          : null,
      })),
    });
  } catch (err) {
    console.error("getVisaDocumentsForHR error", err);
    return res.status(500).json({ ok: false });
  }
};
