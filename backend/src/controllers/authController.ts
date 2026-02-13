import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import RegistrationToken from "../models/RegistrationToken";
import User from "../models/User";
import RefreshToken from "../models/RefreshToken";

const JWT_SECRET = (process.env.JWT_SECRET || "dev_secret_key") as string;
const ACCESS_TOKEN_EXPIRES_IN = (process.env.ACCESS_TOKEN_EXPIRES_IN ||
  "15m") as string;
const REFRESH_TOKEN_EXPIRES_DAYS = Number(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7,
);
const COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || "refresh_token";

const signOptions: SignOptions = {
  expiresIn: ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
};

// Helper: Create refresh token record in DB
async function createRefreshToken(userId: string) {
  const rawToken = crypto.randomBytes(64).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );

  const dbToken = await RefreshToken.create({
    user: userId,
    tokenHash,
    expiresAt,
  });

  return { rawToken, dbToken };
}

// LOGIN
export const loginHandler = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ ok: false, message: "Missing credentials" });
  }

  const user = await User.findOne({
    $or: [{ username }, { email: username }],
  });

  if (!user || !user.passwordHash) {
    return res.status(401).json({ ok: false, message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ ok: false, message: "Invalid credentials" });
  }

  // Define JWT sign options to satisfy TypeScript
  const signOptions: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as any,
  };

  const accessToken = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    signOptions,
  );

  const { rawToken, dbToken } = await createRefreshToken(user._id.toString());

  const isProd = process.env.NODE_ENV === "production";

  // Set HTTP-Only Cookie for Refresh Token
  res.cookie(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    expires: dbToken.expiresAt,
  });

  return res.json({
    ok: true,
    token: accessToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
    },
  });
};

// REFRESH TOKEN
export const refreshHandler = async (req: Request, res: Response) => {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (!cookieToken) {
    return res.status(401).json({ ok: false, message: "No refresh token" });
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(cookieToken)
    .digest("hex");
  const existing = await RefreshToken.findOne({ tokenHash });

  if (!existing || existing.revoked || existing.expiresAt < new Date()) {
    return res
      .status(401)
      .json({ ok: false, message: "Invalid refresh token" });
  }

  const user = await User.findById(existing.user);
  if (!user) {
    return res.status(401).json({ ok: false, message: "User not found" });
  }

  // Rotate token: create new one and revoke old one
  const { rawToken, dbToken } = await createRefreshToken(user._id.toString());

  existing.revoked = true;
  existing.replacedBy = dbToken._id as any;
  await existing.save();

  const isProd = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    expires: dbToken.expiresAt,
  });

  const signOptions: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN as any,
  };

  const newAccessToken = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    },
    JWT_SECRET,
    signOptions,
  );

  return res.json({ ok: true, token: newAccessToken });
};

//  LOGOUT
export const logoutHandler = async (req: Request, res: Response) => {
  const cookieToken = req.cookies?.[COOKIE_NAME];

  if (cookieToken) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(cookieToken)
      .digest("hex");
    await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
  }

  const isProd = process.env.NODE_ENV === "production";

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  return res.json({ ok: true });
};

// VALIDATE INVITE TOKEN
export const validateRegistrationToken = async (
  req: Request,
  res: Response,
) => {
  const rawToken = String(req.params.token).trim();
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

// REGISTER
export const registerHandler = async (req: Request, res: Response) => {
  const { token, email, username, password } = req.body;

  if (!token || !email || !username || !password) {
    return res
      .status(400)
      .json({ ok: false, message: "Missing required fields" });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const record = await RegistrationToken.findOne({ tokenHash });

  if (!record)
    return res.status(400).json({ ok: false, message: "Invalid token" });
  if (record.used)
    return res.status(400).json({ ok: false, message: "Token already used" });
  if (record.expiresAt < new Date())
    return res.status(400).json({ ok: false, message: "Token expired" });
  if (record.email.toLowerCase() !== email.toLowerCase()) {
    return res.status(400).json({ ok: false, message: "Email mismatch" });
  }

  const exists = await User.findOne({ $or: [{ email }, { username }] });
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

  // Mark invite token as used
  record.used = true;
  record.usedAt = new Date();
  record.usedBy = user._id as any;
  await record.save();

  return res.json({ ok: true, message: "Registration successful" });
};
