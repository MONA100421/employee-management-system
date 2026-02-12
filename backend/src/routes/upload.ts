import { Request, Response, NextFunction } from "express";
import { validateVisaOrderForUser } from "../utils/visaOrder";


export const enforceVisaOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = (req as any).user;
    const { type, category } = req.body;

    // Skip validation if it's not a visa-related document
    if (category !== "visa") {
      return next();
    }

    // Perform sequence validation for visa category
    if (!type) {
      return res
        .status(400)
        .json({ ok: false, message: "Document type is required" });
    }

    const result = await validateVisaOrderForUser(user.userId, type);

    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        message: result.message,
      });
    }

    // Validation passed, proceed to the controller
    next();
  } catch (error) {
    console.error("enforceVisaOrder error:", error);
    return res
      .status(500)
      .json({
        ok: false,
        message: "Internal server error during visa order validation",
      });
  }
};
