import { Request, Response, NextFunction } from "express";
import Document from "../models/Document";
import { VISA_FLOW } from "../constants/visaFlow";


export const enforceVisaOrder = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  const { type, category } = req.body;
  const validTypes = [
    "id_card",
    "work_auth",
    "profile_photo",
    "opt_receipt",
    "opt_ead",
    "i_983",
    "i_20",
  ];

  if (!validTypes.includes(type)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid document type",
    });
  }
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ ok: false, message: "User context missing" });
  }

  // Skip validation if the document category is not 'visa'
  if (category !== "visa") return next();

  // If it's labeled as visa but the type is unknown, block for safety
  if (!VISA_FLOW.includes(type)) {
    return res
      .status(400)
      .json({ ok: false, message: "Invalid visa document type" });
  }

  try {
    const docs = await Document.find({
      user: userId,
      type: { $in: VISA_FLOW },
    }).lean();

    const docMap = new Map<string, any>(docs.map((d) => [d.type, d]));

    const allApproved = VISA_FLOW.every(
      (step) => docMap.get(step)?.status === "approved",
    );

    if (allApproved) {
      return res.status(400).json({
        ok: false,
        message:
          "Your entire visa flow has been approved and locked. No further changes allowed.",
      });
    }

    // Validate Step Sequence
    const currentIndex = VISA_FLOW.indexOf(type);
    if (currentIndex > 0) {
      const prevType = VISA_FLOW[currentIndex - 1];
      const prevDoc = docMap.get(prevType);

      // Previous step must exist and be approved
      if (!prevDoc || prevDoc.status !== "approved") {
        return res.status(400).json({
          ok: false,
          message: `Sequential Lock: You must have an approved '${prevType}' before uploading '${type}'.`,
        });
      }
    }

    next();
  } catch (error) {
    console.error("Visa Order Middleware Error:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Internal validation error" });
  }
};