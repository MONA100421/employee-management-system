import { Request, Response } from "express";
import crypto from "crypto";
import RegistrationToken, {
  RegistrationTokenDocument,
} from "../models/RegistrationToken";
import User from "../models/User";
import { Types } from "mongoose";

/* ===== LOGIN (demo) ===== */
export const loginHandler = (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (
    (username === "hr" && password === "password123") ||
    (username === "employee" && password === "password123")
  ) {
    return res.json({
      ok: true,
      user: {
        username,
        role: username === "hr" ? "hr" : "employee",
        email: `${username}@example.com`,
      },
    });
  }

  return res.status(401).json({ ok: false, message: "Invalid credentials" });
};

/* ===== VALIDATE INVITE TOKEN ===== */
export const validateRegistrationToken = async (
  req: Request,
  res: Response,
) => {
  const rawToken = Array.isArray(req.params.token)
    ? req.params.token[0]
    : req.params.token;

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const record = await RegistrationToken.findOne({ tokenHash });

  if (!record) {
    return res.status(404).json({ ok: false, message: "Invalid token" });
  }

  if (record.used) {
    return res.status(400).json({ ok: false, message: "Token already used" });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ ok: false, message: "Token expired" });
  }

  return res.json({
    ok: true,
    email: record.email,
    expiresAt: record.expiresAt,
  });
};

/* ===== REGISTER ===== */
export const registerHandler = async (req: Request, res: Response) => {
  const { token, email, username, password } = req.body;

  if (!token || !email || !username || !password) {
    return res.status(400).json({ ok: false, message: "Missing fields" });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await RegistrationToken.findOne({ tokenHash });

  if (!record) {
    return res.status(404).json({ ok: false, message: "Invalid token" });
  }

  if (record.used) {
    return res.status(400).json({ ok: false, message: "Token already used" });
  }

  if (record.expiresAt < new Date()) {
    return res.status(400).json({ ok: false, message: "Token expired" });
  }

  if (record.email !== email) {
    return res.status(400).json({ ok: false, message: "Email mismatch" });
  }

  const exists = await User.findOne({ email });
  if (exists) {
    return res
      .status(409)
      .json({ ok: false, message: "Email already registered" });
  }

  const user = await User.create({
    email,
    username,
    password, // demo
    role: "employee",
  });

  record.used = true;
  record.usedAt = new Date();
  record.usedBy = user._id as any;
  await record.save();

  return res.json({ ok: true });
};
