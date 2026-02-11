import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

export interface JwtPayload {
  userId: string;
  role: "hr" | "employee" | "admin";
  email?: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      ok: false,
      message: "Missing auth token",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.userId).select(
      "_id username role email",
    );

    if (!user) {
      return res.status(401).json({
        ok: false,
        message: "User not found",
      });
    }

    req.user = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      ok: false,
      message: "Invalid or expired token",
    });
  }
};
