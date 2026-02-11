import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import RegistrationToken from "../models/RegistrationToken";
import User from "../models/User";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "dev_secret_key";

const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "3h";

/* ===============================
   LOGIN (JWT + Bcrypt)
================================= */
export const loginHandler = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      ok: false,
      message: "Missing credentials",
    });
  }

  const user = await User.findOne({
    $or: [{ username }, { email: username }],
  });

  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "Invalid credentials",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({
      ok: false,
      message: "Invalid credentials",
    });
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );

  return res.json({
    ok: true,
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
    },
  });
};

/* ===============================
   VALIDATE INVITE TOKEN
================================= */
export const validateRegistrationToken = async (
  req: Request,
  res: Response,
) => {
  const rawToken = Array.isArray(req.params.token)
    ? req.params.token[0]
    : req.params.token;

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const record = await RegistrationToken.findOne({ tokenHash });

  if (!record)
    return res.status(404).json({ ok: false, message: "Invalid token" });

  if (record.used)
    return res.status(400).json({ ok: false, message: "Token already used" });

  if (record.expiresAt < new Date())
    return res.status(400).json({ ok: false, message: "Token expired" });

  return res.json({
    ok: true,
    email: record.email,
    expiresAt: record.expiresAt,
  });
};

/* ===============================
   REGISTER
================================= */
export const registerHandler = async (req: Request, res: Response) => {
  const { token, email, username, password } = req.body;

  if (!token || !email || !username || !password) {
    return res.status(400).json({
      ok: false,
      message: "Missing required fields",
    });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await RegistrationToken.findOne({ tokenHash });

  if (!record)
    return res.status(400).json({ ok: false, message: "Invalid token" });

  if (record.used)
    return res.status(400).json({ ok: false, message: "Token already used" });

  if (record.expiresAt < new Date())
    return res.status(400).json({ ok: false, message: "Token expired" });

  if (record.email !== email)
    return res.status(400).json({ ok: false, message: "Email mismatch" });

  const exists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (exists)
    return res
      .status(409)
      .json({ ok: false, message: "Username or Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    username,
    passwordHash,
    role: "employee",
  });

  record.used = true;
  record.usedAt = new Date();
  record.usedBy = user._id as unknown as typeof record.usedBy;
  await record.save();

  return res.json({
    ok: true,
    message: "Registration successful",
  });
};
