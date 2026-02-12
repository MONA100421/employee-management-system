import { Request, Response, NextFunction } from "express";

export const requireRole =
  (role: string) => (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role.toLowerCase() !== role.toLowerCase()) {
      return res
        .status(403)
        .json({ ok: false, message: "Forbidden: Requires " + role });
    }
    next();
  };