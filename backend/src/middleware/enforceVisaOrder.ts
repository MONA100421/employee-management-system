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
    const existingDoc = await Document.findOne({ user: userId, type });
    if (existingDoc?.status === "approved") {
      return res.status(400).json({
        ok: false,
        message: "This step is already approved and cannot be modified.",
      });
    }

    const allDocs = await Document.find({
      user: userId,
      type: { $in: VISA_FLOW },
    });
    const approvedDocs = allDocs.filter((d) => d.status === "approved");

    if (approvedDocs.length === VISA_FLOW.length) {
      return res.status(400).json({
        ok: false,
        message: "Visa flow already completed and locked.",
      });
    }

    const currentIndex = VISA_FLOW.indexOf(type);
    if (currentIndex > 0) {
      const previousType = VISA_FLOW[currentIndex - 1];
      const previousDoc = allDocs.find((d) => d.type === previousType);

      if (!previousDoc || previousDoc.status !== "approved") {
        return res.status(400).json({
          ok: false,
          message: `Previous step (${previousType}) must be approved first.`,
        });
      }
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, message: "Server error in visa validation" });
  }
};
