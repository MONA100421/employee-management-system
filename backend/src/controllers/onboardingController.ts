import { Request, Response } from "express";
import OnboardingApplication from "../models/OnboardingApplication";
import Document from "../models/Document";
import User from "../models/User";
import NotificationModel from "../models/Notification";
import { enqueueOnboardingDecisionEmail } from "../queues/emailQueue";
import { NotificationTypes } from "../utils/notificationTypes";


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
    if (!user) {
      return res.status(401).json({ ok: false, message: "Unauthenticated" });
    }

    // Use user.userId to match the JWT payload from authMiddleware
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
          submittedAt: null,
          reviewedAt: null,
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
    console.error("getMyOnboarding error", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

/**
 * POST /api/onboarding
 * Submits or updates the onboarding application for the employee
 */
export const submitOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user)
      return res.status(401).json({ ok: false, message: "Unauthenticated" });

    const { formData } = req.body;
    if (!formData || typeof formData !== "object") {
      return res.status(400).json({ ok: false, message: "Missing formData" });
    }

    // Use user.userId from JWT
    let app = await OnboardingApplication.findOne({ user: user.userId });

    if (!app) {
      app = new OnboardingApplication({
        user: user.userId,
        status: "pending",
        formData,
        submittedAt: new Date(),
      });
    } else {
      if (!["never_submitted", "rejected"].includes(app.status)) {
        return res
          .status(400)
          .json({
            ok: false,
            message: `Cannot submit when status is ${app.status}`,
          });
      }
      app.formData = formData;
      app.status = "pending";
      app.submittedAt = new Date();
    }

    await app.save();
    return res.json({ ok: true, status: dbToUIStatus(app.status) });
  } catch (err) {
    console.error("submitOnboarding error", err);
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
    if (!user || user.role !== "hr") {
      return res.status(403).json({ ok: false });
    }

    const { id } = req.params;
    const { decision, feedback } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ ok: false, message: "Invalid decision" });
    }

    const app = await OnboardingApplication.findById(id);
    if (!app) return res.status(404).json({ ok: false });

    if (app.status !== "pending") {
      return res
        .status(400)
        .json({
          ok: false,
          message: "Only pending applications can be reviewed",
        });
    }

    // If approving, check if all onboarding documents are already approved
    if (decision === "approved") {
      const pendingDocs = await Document.find({
        user: app.user,
        category: "onboarding",
        status: { $ne: "approved" },
      });

      if (pendingDocs.length > 0) {
        return res.status(400).json({
          ok: false,
          message: "All onboarding documents must be approved first",
        });
      }
      app.status = "approved";
    } else {
      app.status = "rejected";
      app.hrFeedback = feedback || "";
    }

    app.reviewedAt = new Date();
    await app.save();

    const employee = await User.findById(app.user);

    if (employee) {
      // Create in-app notification using the renamed NotificationModel
      await NotificationModel.create({
        user: employee._id,
        type:
          decision === "approved"
            ? NotificationTypes.ONBOARDING_REVIEW_APPROVED
            : NotificationTypes.ONBOARDING_REVIEW_REJECTED,
        title:
          decision === "approved"
            ? "Onboarding Approved"
            : "Onboarding Requires Changes",
        message:
          feedback ||
          (decision === "approved"
            ? "Your application is complete."
            : "Please check feedback."),
        data: { onboardingId: app._id.toString() },
      });

      // Enqueue email notification
      if (employee.email) {
        await enqueueOnboardingDecisionEmail({
          to: employee.email,
          decision,
          reviewer: user.username || "HR",
          onboardingId: app._id.toString(),
          feedback: feedback || "No reason provided",
        });
      }
    }

    return res.json({ ok: true, status: dbToUIStatus(app.status) });
  } catch (err) {
    console.error("reviewOnboarding error", err);
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
