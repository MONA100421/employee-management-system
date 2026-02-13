import { Request, Response } from "express";
import OnboardingApplication from "../models/OnboardingApplication";
import Document from "../models/Document";
import User from "../models/User";
import NotificationModel from "../models/Notification";
import { enqueueOnboardingDecisionEmail } from "../queues/emailQueue";
import { NotificationTypes } from "../utils/notificationTypes";
import mongoose from "mongoose";


// Define strict state transition rules
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  never_submitted: ["pending"],
  pending: ["approved", "rejected"],
  rejected: ["pending"],
  approved: [],
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
        version: app.__v,
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
    const { formData, version } = req.body;

    let app = await OnboardingApplication.findOne({ user: user.userId });
    const currentStatus = app ? app.status : "never_submitted";

    if (!ALLOWED_TRANSITIONS[currentStatus]?.includes("pending")) {
      return res.status(400).json({
        ok: false,
        message: `Status is ${currentStatus}. Submitting is not allowed.`,
      });
    }

    if (!app) {
      app = new OnboardingApplication({
        user: user.userId,
        status: "pending",
        formData,
        submittedAt: new Date(),
        history: [
          {
            status: "pending",
            updatedAt: new Date(),
            action: "Initial Submission",
          },
        ],
      });
      await app.save();
    } else {
      const updatedApp = await OnboardingApplication.findOneAndUpdate(
        {
          _id: app._id,
          __v: version,
          status: { $in: ["never_submitted", "rejected"] },
        },
        {
          $set: { formData, status: "pending", submittedAt: new Date() },
          $push: {
            history: {
              status: "pending",
              updatedAt: new Date(),
              action: "Resubmission",
            },
          },
          $inc: { __v: 1 },
        },
        { new: true },
      );

      if (!updatedApp) {
        return res.status(409).json({
          ok: false,
          message:
            "Conflict: Application was modified or already submitted. Please refresh.",
        });
      }
      app = updatedApp;
    }

    return res.json({ ok: true, status: dbToUIStatus(app.status) });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

/**
 * GET /api/hr/onboarding
 * HR only: Lists all onboarding applications grouped by status
 */
export const listOnboardingsForHR = async (req: Request, res: Response) => {
  try {
    const apps = await OnboardingApplication.find()
      .populate("user", "username email")
      .sort({ submittedAt: -1 })
      .lean();
    
    const grouped = {
      pending: [] as any[],
      approved: [] as any[],
      rejected: [] as any[],
    };

    apps.forEach((a: any) => {
      const record = {
        id: a._id,
        employee: a.user
          ? { username: a.user.username, email: a.user.email }
          : null,
        status: dbToUIStatus(a.status),
        submittedAt: a.submittedAt ?? a.createdAt,
      };

      if (grouped[a.status as keyof typeof grouped]) {
        grouped[a.status as keyof typeof grouped].push(record);
      }
    });

    return res.json({ ok: true, grouped });
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
    const { decision, feedback, version } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res
        .status(400)
        .json({ ok: false, message: "Invalid decision value" });
    }

    const app = await OnboardingApplication.findById(id);
    if (!app)
      return res
        .status(404)
        .json({ ok: false, message: "Application not found" });

    // Validate State Transition
    if (!ALLOWED_TRANSITIONS[app.status]?.includes(decision)) {
      return res
        .status(400)
        .json({
          ok: false,
          message: `Cannot change status from ${app.status} to ${decision}`,
        });
    }

    // Pre-approval check for documents
    if (decision === "approved") {
      const hasUnapproved = await Document.exists({
        user: app.user,
        category: "onboarding",
        status: { $ne: "approved" },
      });
      if (hasUnapproved) {
        return res
          .status(400)
          .json({
            ok: false,
            message:
              "Please approve all documents before approving the application.",
          });
      }
    }

    const filter: any = { _id: id };
    if (version !== undefined) {
      filter.__v = version;
    }

    const updatedApp = await OnboardingApplication.findOneAndUpdate(
      filter,
      {
        $set: {
          status: decision,
          hrFeedback: feedback || "",
          reviewedAt: new Date(),
        },
        $push: {
          history: {
            status: decision,
            updatedAt: new Date(),
            action: `HR Review: ${decision}`,
          },
        },
        $inc: { __v: 1 },
      },
      { new: true },
    );

    if (!updatedApp) {
      return res.status(409).json({
        ok: false,
        message:
          "Race condition detected: This application has already been modified by another HR.",
      });
    }

    // Notifications & Emails
    const employee = await User.findById(updatedApp.user);
    if (employee) {
      await NotificationModel.create({
        user: employee._id,
        type:
          decision === "approved"
            ? NotificationTypes.ONBOARDING_REVIEW_APPROVED
            : NotificationTypes.ONBOARDING_REVIEW_REJECTED,
        title: `Onboarding ${decision === "approved" ? "Approved" : "Rejected"}`,
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
          onboardingId: updatedApp._id.toString(),
          feedback,
        });
      }
    }

    return res.json({ ok: true, status: dbToUIStatus(updatedApp.status) });
  } catch (err) {
    console.error("reviewOnboarding error", err);
    return res
      .status(500)
      .json({ ok: false, message: "Server error during review" });
  }
};

/**
 * GET /api/hr/onboarding/:id
 * Include version in the detailed view
 */
export const getOnboardingDetailForHR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const app = await OnboardingApplication.findById(id).populate("user", "username email").lean();

    if (!app) return res.status(404).json({ ok: false, message: "Application not found" });

    return res.json({
      ok: true,
      application: {
        id: app._id,
        status: dbToUIStatus(app.status),
        formData: app.formData || {},
        hrFeedback: app.hrFeedback || null,
        submittedAt: app.submittedAt ?? null,
        reviewedAt: app.reviewedAt ?? null,
        version: app.__v, // Send version to HR UI
        employee: app.user ? {
          id: (app.user as any)._id,
          username: (app.user as any).username,
          email: (app.user as any).email,
        } : null,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};
