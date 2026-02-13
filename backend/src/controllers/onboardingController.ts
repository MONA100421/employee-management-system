import { Request, Response } from "express";
import OnboardingApplication from "../models/OnboardingApplication";
import Document from "../models/Document";
import User from "../models/User";
import NotificationModel from "../models/Notification";
import { enqueueOnboardingDecisionEmail } from "../queues/emailQueue";
import { NotificationTypes } from "../utils/notificationTypes";
import EmployeeProfile from "../models/EmployeeProfile";
import mongoose from "mongoose";

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
 */
export const getMyOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user)
      return res.status(401).json({ ok: false, message: "Unauthenticated" });

    let app = await OnboardingApplication.findOne({
      user: user.userId,
    });

    if (!app) {
      app = await OnboardingApplication.create({
        user: user.userId,
        status: "never_submitted",
        formData: {},
        history: [
          {
            status: "never_submitted",
            updatedAt: new Date(),
            action: "Started Onboarding",
          },
        ],
      });
    }

    const baseDocs = [
      { type: "profile_photo", category: "onboarding" },
      { type: "id_card", category: "onboarding" },
      { type: "work_auth", category: "onboarding" },
    ];

    for (const doc of baseDocs) {
      await Document.findOneAndUpdate(
        { user: user.userId, type: doc.type, deletedAt: null },
        {
          $setOnInsert: {
            user: user.userId,
            type: doc.type,
            category: doc.category,
            status: "not_started",
          },
        },
        { upsert: true },
      );
    }

    const workAuthType = app.formData?.workAuthType;

    if (workAuthType === "f1") {
      await Document.findOneAndUpdate(
        { user: user.userId, type: "opt_receipt", deletedAt: null },
        {
          $setOnInsert: {
            user: user.userId,
            type: "opt_receipt",
            category: "visa",
            status: "not_started",
          },
        },
        { upsert: true },
      );
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
    console.error("getMyOnboarding error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};


/**
 * POST /api/onboarding
 */
export const submitOnboarding = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = (req as any).user;
    const { formData, version } = req.body;

    const app = await OnboardingApplication.findOne({
      user: user.userId,
      __v: version,
    }).session(session);


    if (!app) {
      await session.abortTransaction();
      return res.status(409).json({
        ok: false,
        message: "Application modified. Please refresh.",
      });
    }

    if (!ALLOWED_TRANSITIONS[app.status]?.includes("pending")) {
      await session.abortTransaction();
      return res.status(400).json({
        ok: false,
        message: `Cannot submit from ${app.status}`,
      });
    }

    app.formData = formData;
    app.status = "pending";
    app.submittedAt = new Date();
    app.history.push({
      status: "pending",
      updatedAt: new Date(),
      action: "Submission",
    });

    await app.save({ session });

    if (formData.workAuthType === "f1") {
      await Document.findOneAndUpdate(
        { user: user.userId, type: "opt_receipt" },
        {
          $setOnInsert: {
            user: user.userId,
            type: "opt_receipt",
            category: "visa",
            status: "not_started",
          },
        },
        { upsert: true, session }
      );
    }

    await session.commitTransaction();

    return res.json({
      ok: true,
      status: dbToUIStatus(app.status),
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("submitOnboarding error:", err);
    return res.status(500).json({ ok: false });
  } finally {
    session.endSession();
  }
};

// GET /api/hr/onboarding
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
        version: a.__v,
      };
      if (grouped[a.status as keyof typeof grouped]) {
        grouped[a.status as keyof typeof grouped].push(record);
      }
    });

    return res.json({ ok: true, grouped });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

// POST /api/hr/onboarding/:id/review
export const reviewOnboarding = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const hrUser = (req as any).user;
    const { id } = req.params;
    const { decision, feedback } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ ok: false, message: "Invalid decision value" });
    }

    const app = await OnboardingApplication.findById(id).session(session);

    if (!app) {
      await session.abortTransaction();
      return res.status(409).json({
        ok: false,
        message:
          "Conflict: This application has been updated by someone else. Please refresh.",
      });
    }

    if (!ALLOWED_TRANSITIONS[app.status]?.includes(decision)) {
      await session.abortTransaction();
      return res.status(400).json({
        ok: false,
        message: `Cannot change status from ${app.status} to ${decision}`,
      });
    }

    if (decision === "approved") {
      const hasUnapproved = await Document.exists({
        user: app.user,
        category: { $in: ["onboarding", "visa"] },
        status: { $ne: "approved" },
      }).session(session);

      if (hasUnapproved) {
        await session.abortTransaction();
        return res.status(400).json({
          ok: false,
          message: "All onboarding documents must be approved by HR first.",
        });
      }

      const formData = app.formData || {};

      const userUpdate: any = {};
      if (formData.firstName)
        userUpdate["profile.firstName"] = formData.firstName;
      if (formData.lastName) userUpdate["profile.lastName"] = formData.lastName;
      if (formData.middleName)
        userUpdate["profile.middleName"] = formData.middleName;
      if (formData.preferredName)
        userUpdate["profile.preferredName"] = formData.preferredName;
      if (formData.workAuthType)
        userUpdate["workAuthorization.authType"] = formData.workAuthType;

      await User.findByIdAndUpdate(app.user, { $set: userUpdate }, { session });

      await EmployeeProfile.findOneAndUpdate(
        { user: app.user },
        {
          $set: {
            phone: formData.phone,
            "address.street": formData.address,
            "address.city": formData.city,
            "address.state": formData.state,
            "address.zipCode": formData.zipCode,
            "address.country": formData.country || "USA",
            "emergency.contactName": formData.emergencyContact,
            "emergency.relationship": formData.emergencyRelationship,
            "emergency.phone": formData.emergencyPhone,
            "emergency.email": formData.emergencyEmail,
          },
        },
        { upsert: true, session },
      );
    }

    app.status = decision;
    app.hrFeedback = feedback || "";
    app.reviewedAt = new Date();
    app.history.push({
      status: decision,
      updatedAt: new Date(),
      action: `HR Review: ${decision}`,
    });

    await app.save({ session });

    await session.commitTransaction();

    setImmediate(async () => {
      try {
        const employee = await User.findById(app.user);
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
              reviewer: hrUser.username,
              onboardingId: app._id.toString(),
              feedback,
            });
          }
        }
      } catch (e) {
        console.error("Notification Side-effect error:", e);
      }
    });

    return res.json({ ok: true, status: dbToUIStatus(app.status) });
  } catch (err) {
    await session.abortTransaction();
    console.error("reviewOnboarding error", err);
    return res
      .status(500)
      .json({ ok: false, message: "Server error during review" });
  } finally {
    session.endSession();
  }
};

// GET /api/hr/onboarding/:id
export const getOnboardingDetailForHR = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const app = await OnboardingApplication.findById(id)
      .populate("user", "username email")
      .lean();

    if (!app)
      return res
        .status(404)
        .json({ ok: false, message: "Application not found" });

    return res.json({
      ok: true,
      application: {
        id: app._id,
        status: dbToUIStatus(app.status),
        formData: app.formData || {},
        hrFeedback: app.hrFeedback || null,
        submittedAt: app.submittedAt ?? null,
        reviewedAt: app.reviewedAt ?? null,
        version: app.__v,
        employee: app.user
          ? {
              id: (app.user as any)._id,
              username: (app.user as any).username,
              email: (app.user as any).email,
            }
          : null,
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};
