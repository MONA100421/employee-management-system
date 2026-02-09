import { Request, Response } from 'express';
import OnboardingApplication from '../models/OnboardingApplication';


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

// GET /api/onboarding/me
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


// POST /api/onboarding
export const submitOnboarding = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ ok: false, message: 'Unauthenticated' });

    const { formData } = req.body;
    if (!formData || typeof formData !== 'object') {
      return res.status(400).json({ ok: false, message: 'Missing formData' });
    }

    let app = await OnboardingApplication.findOne({ user: user.id });

    if (!app) {
      app = new OnboardingApplication({
        user: user.id,
        status: 'pending',
        formData,
        submittedAt: new Date(),
      });
    } else {
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

// GET /api/hr/onboarding
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

// POST /api/hr/onboarding/:id/review
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
      (app as any).hrFeedback = feedback || '';
    }

    await app.save();

    return res.json({ ok: true, status: dbToUIStatus(app.status) });
  } catch (err) {
    console.error('reviewOnboarding error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
};

// HR onboarding detail API
export const getOnboardingDetailForHR = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== "hr") {
    return res.status(403).json({ ok: false });
  }

  const { id } = req.params;

  const app = await OnboardingApplication.findById(id)
    .populate("user", "username email")
    .lean();

  if (!app) {
    return res.status(404).json({ ok: false, message: "Not found" });
  }

  return res.json({
    ok: true,
    application: {
      id: app._id,
      status: dbToUIStatus(app.status),
      formData: app.formData || {},
      hrFeedback: app.hrFeedback || null,
      submittedAt: app.submittedAt ?? null,
      reviewedAt: app.reviewedAt ?? null,
      employee: app.user,
    },
  });
};
