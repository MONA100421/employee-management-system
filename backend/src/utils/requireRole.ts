import { Request, Response, NextFunction } from "express";

export const requireRole =
  (role: "hr" | "employee") =>
  (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    if (user.role !== role) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    next();
  };
