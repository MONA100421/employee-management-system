import { Request, Response, NextFunction } from "express";
import Document from "../models/Document";
import { VISA_FLOW } from "../constants/visaFlow";

export const enforceVisaOrder = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  const { type } = req.body; // document type
  const userId = req.user.userId;

  if (!VISA_FLOW.includes(type)) {
    return next(); // not visa flow document
  }

  const currentIndex = VISA_FLOW.indexOf(type);

  if (currentIndex === 0) return next();

  const previousType = VISA_FLOW[currentIndex - 1];

  const previousDoc = await Document.findOne({
    user: userId,
    type: previousType,
  });

  if (!previousDoc || previousDoc.status !== "approved") {
    return res.status(400).json({
      ok: false,
      message: `Previous step (${previousType}) must be approved first.`,
    });
  }

  next();
};
