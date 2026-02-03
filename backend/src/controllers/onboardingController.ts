import { Request, Response } from 'express';
import OnboardingApplication from '../models/OnboardingApplication';
import mongoose from 'mongoose';

/**
 * Helpers to map DB status (snake_case) <-> UI status (kebab-case)
 */
const dbToUIStatus = (s: string | undefined) => {
  switch (s) {
    case 'never_submitted': return 'never-submitted';
    case 'pending': return 'pending';
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    default: return 'never-submitted';
  }
};
const uiToDBStatus = (s: string) => {
  switch (s) {
    case 'never-submitted': return 'never_submitted';
    case 'pending': return 'pending';
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    default: return 'never_submitted';
  }
};

/**
 * GET /api/onboarding/me
 * Return current user's onboarding application (if none, return default never-submitted shape)
 * Requires auth middleware that sets req.user = { id, username, role }
 */
export const getMyOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ ok: false, message: 'Unauthenticated' });
    }

    const app = await OnboardingApplication.findOne({
      user: user.id,
    }).lean();

    if (!app) {
      return res.json({
        ok: true,
        application: {
          id: null,
          status: 'never-submitted',
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
    console.error('getMyOnboarding error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};


/**
 * POST /api/onboarding
 * Create or update the current user's onboarding application.
 * Body: { formData: {...} }
 * Allowed when current status is never_submitted or rejected.
 */
export const submitOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ ok: false, message: 'Unauthenticated' });

    const { formData } = req.body;
    if (!formData || typeof formData !== 'object') {
      return res.status(400).json({ ok: false, message: 'Missing formData' });
    }

    // find existing
    let app = await OnboardingApplication.findOne({ user: user.id });

    if (!app) {
      app = new OnboardingApplication({
        user: user.id,
        status: 'pending',
        formData,
        submittedAt: new Date(),
      });
    } else {
      // allow resubmit only if never_submitted or rejected
      if (!['never_submitted', 'rejected'].includes(app.status)) {
        return res.status(400).json({ ok: false, message: `Cannot submit when status is ${app.status}` });
      }
      app.formData = formData;
      app.status = 'pending';
      app.submittedAt = new Date();
    }

    await app.save();

    return res.json({ ok: true, status: dbToUIStatus(app.status) });
  } catch (err) {
    console.error('submitOnboarding error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

/**
 * GET /api/hr/onboarding
 * HR-only: list applications (brief)
 */
export const listOnboardingsForHR = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ ok: false, message: 'Unauthenticated' });
    if (user.role !== 'hr') return res.status(403).json({ ok: false, message: 'Forbidden' });

    const apps = await OnboardingApplication.find()
      .populate('user', 'username email')
      .sort({ submittedAt: -1 })
      .lean();

    const out = apps.map((a: any) => ({
    id: a._id,
    employee: a.user
        ? { username: (a.user as any).username, email: (a.user as any).email }
        : null,
    status: dbToUIStatus(a.status),
    submittedAt: a.submittedAt ?? a.createdAt,
    }));

    return res.json({ ok: true, applications: out });
  } catch (err) {
    console.error('listOnboardingsForHR error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

/**
 * POST /api/hr/onboarding/:id/review
 * HR-only: decision = 'approved' | 'rejected', feedback optional for rejected
 */
export const reviewOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ ok: false, message: 'Unauthenticated' });
    if (user.role !== 'hr') return res.status(403).json({ ok: false, message: 'Forbidden' });

    const { id } = req.params;
    const { decision, feedback } = req.body;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ ok: false, message: 'Invalid decision' });
    }

    const app = await OnboardingApplication.findById(id);
    if (!app) return res.status(404).json({ ok: false, message: 'Not found' });

    if (app.status !== 'pending') {
      return res.status(400).json({ ok: false, message: 'Only pending applications can be reviewed' });
    }

    if (decision === 'approved') {
      app.status = 'approved';
      app.reviewedAt = new Date();
    } else {
      app.status = 'rejected';
      app.reviewedAt = new Date();
      // store feedback in uploadedFiles/hrFeedback for now or as field
      // here we add hrFeedback top-level (if you prefer), set hrFeedback field
      (app as any).hrFeedback = feedback || '';
    }

    await app.save();

    return res.json({ ok: true, status: dbToUIStatus(app.status) });
  } catch (err) {
    console.error('reviewOnboarding error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};
