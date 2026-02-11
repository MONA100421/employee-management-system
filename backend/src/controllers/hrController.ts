import { Request, Response } from "express";
import crypto from "crypto";
import RegistrationToken, { RegistrationTokenDocument } from "../models/RegistrationToken";
import { sendInviteEmail } from "../utils/email";


export const listEmployees = (_req: Request, res: Response) => {
  const employees = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      visa: "F1 (OPT)",
    },
    {
      id: "2",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@example.com",
      visa: "H1-B",
    },
  ];

  res.json({
    ok: true,
    employees,
  });
};

export const inviteEmployee = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ ok: false, message: "Email is required" });
    }
    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000); // 3 hours

    await RegistrationToken.create({
      email,
      tokenHash,
      expiresAt,
      createdBy: user.id,
      role: "employee",
    } as Partial<RegistrationTokenDocument>);

    await sendInviteEmail(email, rawToken);

    return res.json({
      ok: true,
      message: "Invitation email sent",
      expiresAt,
    });
  } catch (err) {
    console.error("inviteEmployee error", err);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error" });
  }
};
