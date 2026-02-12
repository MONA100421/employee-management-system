import { Request, Response, NextFunction } from "express";
import Document from "../models/Document";
import { VISA_FLOW } from "../constants/visaFlow";

export const enforceVisaOrder = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  const { type, category } = req.body;
  const userId = req.user.userId;

  if (category !== "visa" || !VISA_FLOW.includes(type)) {
    return next();
  }

  try {
    const docs = await Document.find({
      user: userId,
      type: { $in: VISA_FLOW },
    }).lean();

    const docMap = new Map<string, any>(docs.map((d) => [d.type, d]));

    if (docMap.get(type)?.status === "approved") {
      return res.status(400).json({
        ok: false,
        message: "This step is already approved.",
      });
    }

    if (
      docs.length === VISA_FLOW.length &&
      docs.every((d) => d.status === "approved")
    ) {
      return res.status(400).json({
        ok: false,
        message: "Visa flow already completed and locked.",
      });
    }

    const currentIndex = VISA_FLOW.indexOf(type);
    if (currentIndex > 0) {
      const prevType = VISA_FLOW[currentIndex - 1];
      
      const prevDoc = docMap.get(prevType);

      if (!prevDoc || prevDoc.status !== "approved") {
        return res.status(400).json({
          ok: false,
          message: `Previous step (${prevType}) must be approved first.`,
        });
      }
    }

    next();
  } catch (error) {
    console.error("Visa Order Middleware Error:", error);
    return res.status(500).json({ ok: false, message: "Validation error" });
  }
};