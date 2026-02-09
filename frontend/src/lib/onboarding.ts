import api from './api';

export type UIOnboardingStatus =
  | 'never-submitted'
  | 'pending'
  | 'approved'
  | 'rejected';

export interface OnboardingApplication {
  id: string | null;
  status: UIOnboardingStatus;
  formData: Record<string, unknown>;
  hrFeedback: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

/**
 * GET /api/onboarding/me
 */
export async function getMyOnboarding(): Promise<OnboardingApplication> {
  const res = await api.get('/onboarding/me');
  return res.data.application as OnboardingApplication;
}

/**
 * POST /api/onboarding
 */
export async function submitOnboarding(formData: Record<string, unknown>) {
  const res = await api.post('/onboarding', { formData });
  return res.data as { ok: boolean; status: UIOnboardingStatus };
}

export type ReviewDecision = 'approved' | 'rejected';

export async function reviewOnboarding(
  onboardingId: string,
  decision: ReviewDecision,
  feedback?: string
): Promise<{ ok: boolean }> {
  const resp = await api.post(
    `/hr/onboarding/${onboardingId}/review`,
    {
      decision,
      feedback,
    }
  );

  return resp.data;
}

// HR only
export type HROnboardingListItem = {
  id: string;
  employee: {
    username: string;
    email: string;
  } | null;
  status: UIOnboardingStatus;
  submittedAt: string;
};

export async function getHROnboardings(): Promise<HROnboardingListItem[]> {
  const res = await api.get("/hr/onboarding");
  return res.data.applications;
}
