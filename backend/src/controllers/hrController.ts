import { Request, Response } from "express";
import User from "../models/User";
import OnboardingApplication from "../models/OnboardingApplication";
import RegistrationToken from "../models/RegistrationToken";
import { emailQueue } from "../queues/emailQueue";
import crypto from "crypto";
import mongoose from "mongoose";

/**
 * GET /api/hr/employees
 */
export const listEmployees = async (_req: Request, res: Response) => {
  try {
    const result = await User.aggregate([
      { $match: { role: "employee" } },
      {
        $lookup: {
          from: "onboardingapplications",
          localField: "_id",
          foreignField: "user",
          as: "appData",
        },
      },
      { $unwind: { path: "$appData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: { $ifNull: ["$appData._id", "$_id"] },
          employee: {
            id: "$_id",
            username: "$username",
            email: "$email",
          },
          status: { $ifNull: ["$appData.status", "never_submitted"] },
          submittedAt: "$appData.submittedAt",
        },
      },
    ]);
    return res.json({ ok: true, employees: result });
  } catch (err) {
    console.error("Aggregation error:", err);
    return res.status(500).json({ ok: false });
  }
};

/**
 * POST /api/hr/invite
 */
export const inviteEmployee = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = (req as any).user;
    const { email, name } = req.body;

    if (!email || !name) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        ok: false,
        message: "Both email and name are required to send an invitation",
      });
    }

    await RegistrationToken.updateMany(
      {
        email,
        used: false,
        expiresAt: { $gt: new Date() },
      },
      { $set: { expiresAt: new Date() } },
      { session },
    );

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    await RegistrationToken.create(
      [
        {
          email,
          name,
          tokenHash,
          expiresAt,
          createdBy: user.userId,
          role: "employee",
          used: false,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    // send email
    await emailQueue.add("registrationInvite", {
      to: email,
      rawToken,
      fullName: name,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const registrationLink = `${frontendUrl}/register?token=${rawToken}&email=${encodeURIComponent(
      email,
    )}`;

    return res.json({
      ok: true,
      registrationLink,
    });
  } catch (err: any) {
    await session.abortTransaction();
    session.endSession();

    if (err.code === 11000) {
      return res.status(409).json({
        ok: false,
        message: "Active token already exists. Please retry.",
      });
    }

    console.error("inviteEmployee error:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/hr/invite/history
 */
export const inviteHistory = async (_req: Request, res: Response) => {
  try {
    const tokens = await RegistrationToken.find()
      .populate("createdBy", "username")
      .sort({ createdAt: -1 })
      .lean();
    const now = Date.now();
    const out = tokens.map((t: any) => ({
      id: t._id,
      email: t.email,
      name: t.name || "N/A",
      createdAt: t.createdAt,
      expiresAt: t.expiresAt,
      used: t.used,
      usedAt: t.usedAt,
      status: t.used ? "used" : now > t.expiresAt.getTime() ? "expired" : "active",
      sentBy: t.createdBy?.username || "System",
    }));

    return res.json({ ok: true, history: out });
  } catch (err) {
    console.error("inviteHistory error:", err);
    return res.status(500).json({ ok: false });
  }
};
