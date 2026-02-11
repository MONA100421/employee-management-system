import { Request, Response } from "express";
import crypto from "crypto";
import RegistrationToken, {
  RegistrationTokenDocument,
} from "../models/RegistrationToken";
import { emailQueue } from "../queues/emailQueue";

/**
 * GET /api/hr/employees
 * List all employees
 */
export const listEmployees = (req: Request, res: Response) => {
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

/**
 * POST /api/hr/invite
 * Generate registration token and queue invitation email
 */
export const inviteEmployee = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { email, name } = req.body; 

    if (!email || !name) {
      return res.status(400).json({ 
        ok: false, 
        message: "Both email and name are required to send an invitation" 
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Token expires in 3 hours
    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000);

    // Save token to MongoDB
    await RegistrationToken.create({
      email,
      tokenHash,
      expiresAt,
      createdBy: user.userId,
      role: "employee",
    } as Partial<RegistrationTokenDocument>);

    console.log(`[Database] Token created for ${email} (Name: ${name})`);

    const job = await emailQueue.add(
      "registrationInvite",
      { 
        to: email, 
        rawToken, 
        fullName: name
      },
      {
        attempts: 3,
        backoff: 5000, 
        removeOnComplete: true,
      },
    );

    console.log(`[Queue] Job enqueued successfully! ID: ${job.id}`);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const registrationLink = `${frontendUrl}/register?token=${rawToken}&email=${encodeURIComponent(email)}`;

    return res.json({
      ok: true,
      message: "Invitation link generated and email queued",
      registrationLink,
    });
  } catch (err) {
    console.error("inviteEmployee error:", err);
    return res.status(500).json({
      ok: false,
      message: "Internal server error while processing invitation",
    });
  }
};