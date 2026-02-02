// src/lib/onboarding.ts
import api from './api';

export type UIOnboardingStatus =
  | 'never-submitted'
  | 'pending'
  | 'approved'
  | 'rejected';

export interface OnboardingApplication {
  id: string | null;
  status: UIOnboardingStatus;
  formData: Record<string, any>;
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
export async function submitOnboarding(formData: Record<string, any>) {
  const res = await api.post('/onboarding', { formData });
  return res.data as { ok: boolean; status: UIOnboardingStatus };
}
