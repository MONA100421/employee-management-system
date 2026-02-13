import { Request, Response, NextFunction } from "express";
import { validateVisaOrderForUser } from "../utils/visaOrder";
import { VISA_FLOW } from "../constants/visaFlow";

export const enforceVisaOrder = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  const { type, category } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      ok: false,
      message: "Unauthorized",
    });
  }

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

  if (category !== "visa") {
    return next();
  }

  if (!VISA_FLOW.includes(type)) {
    return res.status(400).json({
      ok: false,
      message: "Invalid visa document type",
    });
  }

  try {
    const validation = await validateVisaOrderForUser(userId, type);

    if (!validation.ok) {
      return res.status(400).json({
        ok: false,
        message: validation.message,
      });
    }

    next();
  } catch (error) {
    console.error("Visa Order Middleware Error:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal validation error",
    });
  }
};
