import { Request, Response } from "express";
import Document from "../models/Document";
import User from "../models/User";
import Notification from "../models/Notification";
import { reviewDocumentService } from "../services/documentReviewService";
import { enqueueDocumentRejectedEmail } from "../queues/emailQueue";
import { NotificationTypes } from "../utils/notificationTypes";
import { validateVisaOrderForUser, getNextVisaStep } from "../utils/visaOrder";

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

  if (category === "visa") {
    const orderValidation = await validateVisaOrderForUser(user.userId, type);
    if (!orderValidation.ok) {
      return res
        .status(400)
        .json({ ok: false, message: orderValidation.message });
    }
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
    type: NotificationTypes.DOCUMENT_UPLOADED,
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

  // use normalized type names
  await Notification.create({
    user: updatedDoc.user,
    type:
      decision === "approved"
        ? NotificationTypes.DOCUMENT_APPROVED
        : NotificationTypes.DOCUMENT_REJECTED,
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
    .populate("user", "username email workAuthorization")
    .lean();

  const documentsWithNextStep = await Promise.all(
    docs.map(async (d: any) => {
      const nextStep = d.user ? await getNextVisaStep(d.user._id) : "N/A";
      const workAuthTitle = d.user?.workAuthorization?.authType || "N/A";

      let daysRemaining = null;
      if (d.user?.workAuthorization?.endDate) {
        const end = new Date(d.user.workAuthorization.endDate);
        const now = new Date();
        end.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const diffTime = end.getTime() - now.getTime();
        daysRemaining = Math.max(
          0,
          Math.floor(diffTime / (1000 * 60 * 60 * 24)),
        );
      }

      return {
        id: d._id,
        type: d.type,
        category: d.category,
        status: dbToUIStatus(d.status),
        fileName: d.fileName ?? null,
        fileUrl: d.fileUrl ?? null,
        uploadedAt: d.uploadedAt ?? null,
        hrFeedback: d.hrFeedback ?? null,
        nextStep,
        daysRemaining,
        workAuthTitle,
        user: d.user
          ? {
              id: d.user._id,
              username: d.user.username,
              email: d.user.email,
              workAuth: d.user.workAuthorization,
            }
          : null,
      };
    }),
  );

  return res.json({
    ok: true,
    documents: documentsWithNextStep,
  });
};


export const sendNotification = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== "hr") {
    return res.status(403).json({ ok: false, message: "Only HR can send notifications" });
  }

  const { id } = req.params;

  try {
    const doc = await Document.findById(id).populate("user");
    if (!doc) return res.status(404).json({ ok: false, message: "Document not found" });

    await Notification.create({
      user: doc.user,
      type: NotificationTypes.DOCUMENT_UPLOADED,
      title: "Visa Document Reminder",
      message: `HR is requesting an update or action on your ${doc.type} document.`,
      data: { documentId: doc._id.toString() },
    });

    return res.json({ ok: true, message: "Notification sent successfully" });
  } catch (error) {
    console.error("Send notification error:", error);
    return res.status(500).json({ ok: false });
  }
};

export const getMyVisaStatus = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const userData = await User.findById(user.userId).select("workAuthorization");
  
  let daysRemaining = null;
  if (userData?.workAuthorization?.endDate) {
    const end = new Date(userData.workAuthorization.endDate);
    const now = new Date();
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  return res.json({
    ok: true,
    workAuth: userData?.workAuthorization,
    daysRemaining
  });
};