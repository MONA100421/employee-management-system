import { Request, Response } from "express";
import Document from "../models/Document";

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

    const docs = await Document.find({ user: user.id }).lean();

    return res.json({
      ok: true,
      documents: docs.map((d) => ({
        id: d._id,
        type: d.type,
        category: d.category,
        status: dbToUIStatus(d.status),
        fileName: d.fileName ?? null,
        uploadedAt: d.uploadedAt ?? null,
        hrFeedback: d.hrFeedback ?? null,
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

    const { type, category, fileName } = req.body;
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
    doc.status = "pending";
    doc.uploadedAt = new Date();
    doc.hrFeedback = undefined;

    await doc.save();

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
    const { decision, feedback } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ ok: false });
    }

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ ok: false });
    }

    if (doc.status !== "pending") {
      return res.status(400).json({ ok: false, message: "Not pending" });
    }

    doc.status = decision === "approved" ? "approved" : "rejected";
    doc.reviewedAt = new Date();
    doc.reviewedBy = user.id;
    doc.hrFeedback = decision === "rejected" ? feedback : undefined;

    await doc.save();

    return res.json({
      ok: true,
      status: dbToUIStatus(doc.status),
    });
  } catch (err) {
    console.error("reviewDocument error", err);
    return res.status(500).json({ ok: false });
  }
};
