import { Request, Response } from "express";
import OnboardingApplication from "../models/OnboardingApplication";
import Document from "../models/Document";
import User from "../models/User";
import NotificationModel from "../models/Notification";
import { enqueueOnboardingDecisionEmail } from "../queues/emailQueue";
import { NotificationTypes } from "../utils/notificationTypes";


// Define strict state transition rules
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  never_submitted: ["pending"],
  pending: ["approved", "rejected"],
  rejected: ["pending"], // Employee resubmits
  approved: [], // Final state
};

const dbToUIStatus = (s: string | undefined) => {
  switch (s) {
    case "never_submitted":
      return "never-submitted";
    case "pending":
      return "pending";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      return "never-submitted";
  }
};

/**
 * GET /api/onboarding/me
 * Retrieves the current employee's onboarding application status and data
 */
export const getMyOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user)
      return res.status(401).json({ ok: false, message: "Unauthenticated" });

    const app = await OnboardingApplication.findOne({
      user: user.userId,
    }).lean();

    if (!app) {
      return res.json({
        ok: true,
        application: {
          id: null,
          status: "never-submitted",
          formData: {},
          hrFeedback: null,
        },
      });
    }

    return res.json({
      ok: true,
      application: {
        id: app._id.toString(),
        status: dbToUIStatus(app.status),
        formData: app.formData || {},
        hrFeedback: app.hrFeedback || null,
        submittedAt: app.submittedAt ?? null,
        reviewedAt: app.reviewedAt ?? null,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

/**
 * POST /api/onboarding
 * Employee submits or resubmits application
 */
export const submitOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { formData } = req.body;

    let app = await OnboardingApplication.findOne({ user: user.userId });
    const currentStatus = app ? app.status : "never_submitted";

    if (!ALLOWED_TRANSITIONS[currentStatus].includes("pending")) {
      return res.status(400).json({
        ok: false,
        message: `Submission not allowed when status is ${currentStatus}`,
      });
    }

    if (!app) {
      app = new OnboardingApplication({
        user: user.userId,
        status: "pending",
        formData,
        submittedAt: new Date(),
      });
    } else {
      app.formData = formData;
      app.status = "pending";
      app.submittedAt = new Date();
    }

    await app.save();
    return res.json({ ok: true, status: dbToUIStatus(app.status) });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

/**
 * GET /api/hr/onboarding
 * HR only: Lists all onboarding applications
 */
export const listOnboardingsForHR = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== "hr")
      return res.status(403).json({ ok: false, message: "Forbidden" });

    const apps = await OnboardingApplication.find()
      .populate("user", "username email")
      .sort({ submittedAt: -1 })
      .lean();

    const out = apps.map((a: any) => ({
      id: a._id,
      employee: a.user
        ? { username: a.user.username, email: a.user.email }
        : null,
      status: dbToUIStatus(a.status),
      submittedAt: a.submittedAt ?? a.createdAt,
    }));

    return res.json({ ok: true, applications: out });
  } catch (err) {
    console.error("listOnboardingsForHR error", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

/**
 * POST /api/hr/onboarding/:id/review
 * HR only: Approves or rejects an onboarding application
 */
export const reviewOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { decision, feedback } = req.body; // decision: 'approved' | 'rejected'

    const app = await OnboardingApplication.findById(id);
    if (!app) return res.status(404).json({ ok: false });

    // HR can only review if status is 'pending'
    if (!ALLOWED_TRANSITIONS[app.status].includes(decision)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid state transition" });
    }

    if (decision === "approved") {
      const pendingDocs = await Document.find({
        user: app.user,
        category: "onboarding",
        status: { $ne: "approved" },
      });
      if (pendingDocs.length > 0) {
        return res
          .status(400)
          .json({ ok: false, message: "Approve all documents first" });
      }
      app.status = "approved";
    } else {
      app.status = "rejected";
      app.hrFeedback = feedback || "";
    }

    app.reviewedAt = new Date();
    await app.save();

    // Notification and Email logic...
    const employee = await User.findById(app.user);
    if (employee) {
      await NotificationModel.create({
        user: employee._id,
        type:
          decision === "approved"
            ? NotificationTypes.ONBOARDING_REVIEW_APPROVED
            : NotificationTypes.ONBOARDING_REVIEW_REJECTED,
        title:
          decision === "approved"
            ? "Onboarding Approved"
            : "Onboarding Rejected",
        message:
          feedback ||
          (decision === "approved"
            ? "Your application is complete."
            : "Please check feedback."),
      });
      if (employee.email) {
        await enqueueOnboardingDecisionEmail({
          to: employee.email,
          decision,
          reviewer: user.username,
          onboardingId: app._id.toString(),
          feedback,
        });
      }
    }

    return res.json({ ok: true, status: dbToUIStatus(app.status) });
  } catch (err) {
    return res.status(500).json({ ok: false });
  }
};

/**
 * GET /api/hr/onboarding/:id
 * HR only: Get detailed view of a specific application
 */
export const getOnboardingDetailForHR = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user || user.role !== "hr") return res.status(403).json({ ok: false });

    const { id } = req.params;
    
    const app = await OnboardingApplication.findById(id)
      .populate("user", "username email")
      .lean();

    if (!app) return res.status(404).json({ ok: false, message: "Not found" });

    return res.json({
      ok: true,
      application: {
        id: app._id,
        status: dbToUIStatus(app.status),
        formData: app.formData || {},
        hrFeedback: app.hrFeedback || null,
        submittedAt: app.submittedAt ?? null,
        reviewedAt: app.reviewedAt ?? null,
        employee: app.user ? {
          id: (app.user as any)._id,
          username: (app.user as any).username,
          email: (app.user as any).email,
        } : null,
      },
    });
  } catch (err) {
    console.error('getOnboardingDetailForHR error', err);
    return res.status(500).json({ ok: false });
  }
};
