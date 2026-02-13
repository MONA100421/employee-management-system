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
  version?: number;
}

export interface InvitationRecord {
  id: string;
  email: string;
  name: string;
  status: "active" | "expired" | "used";
  createdAt: string;
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
export async function submitOnboarding(
  formData: Record<string, unknown>,
  version?: number,
) {
  const res = await api.post("/onboarding", { formData, version });
  return res.data as { ok: boolean; status: UIOnboardingStatus };
}

export type ReviewDecision = 'approved' | 'rejected';

export async function sendInvitation(email: string, name: string) {
  const res = await api.post("/hr/invite", { email, name });
  return res.data;
}

export async function getInvitationHistory(): Promise<InvitationRecord[]> {
  const res = await api.get("/hr/invite/history");
  return res.data.history || [];
}

export async function reviewOnboarding(
  onboardingId: string,
  decision: ReviewDecision,
  feedback?: string,
  version?: number
): Promise<{ ok: boolean }> {
  const resp = await api.post(
    `/hr/onboarding/${onboardingId}/review`,
    { decision, feedback, version } 
  );

  return resp.data;
}

// HR only
export type HROnboardingListItem = {
  id: string;
  employee: {
    id?: string;
    username: string;
    email: string;
  } | null;
  status: UIOnboardingStatus;
  submittedAt: string;
  version: number;
};

export async function getHROnboardings(): Promise<GroupedOnboardings> {
  const res = await api.get("/hr/onboarding");
  return res.data.grouped;
}

export interface HROnboardingDetail {
  id: string;
  status: UIOnboardingStatus;
  formData: Record<string, unknown>;
  hrFeedback: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  version: number;
  employee: {
    id: string;
    username: string;
    email: string;
  };
}

export async function getHROnboardingDetail(
  onboardingId: string,
): Promise<HROnboardingDetail> {
  const res = await api.get(`/hr/onboarding/${onboardingId}`);
  return res.data.application;
}

export interface GroupedOnboardings {
  pending: HROnboardingListItem[];
  approved: HROnboardingListItem[];
  rejected: HROnboardingListItem[];
}


