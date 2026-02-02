import api from './api';
import type { User } from '../contexts/AuthContext';

export type UIOnboardingStatus = 'never-submitted' | 'pending' | 'approved' | 'rejected';

export type OnboardingApplication = {
  id: string | null;
  status: UIOnboardingStatus;
  formData: Record<string, any>;
  hrFeedback?: any;
  submittedAt?: string | null;
  reviewedAt?: string | null;
};

export const getMyOnboarding = async (): Promise<{ ok: boolean; application?: OnboardingApplication; message?: string }> => {
  const resp = await api.get('/onboarding/me');
  if (resp.data.ok) {
    return { ok: true, application: resp.data.application };
  }
  return { ok: false, message: resp.data.message || 'Failed' };
};

export const submitOnboarding = async (formData: Record<string, any>) => {
  const resp = await api.post('/onboarding', { formData });
  return resp.data; // { ok: true, status: 'pending' } or error
};

export type HRApplicationListItem = {
  id: string;
  employee: { username?: string; email?: string } | null;
  status: UIOnboardingStatus;
  submittedAt?: string | null;
};

export const getHROnboardings = async (): Promise<{ ok: boolean; applications?: HRApplicationListItem[]; message?: string }> => {
  const resp = await api.get('/hr/onboarding');
  if (resp.data.ok) {
    return { ok: true, applications: resp.data.applications };
  }
  return { ok: false, message: resp.data.message || 'Failed' };
};

export const reviewOnboarding = async (id: string, decision: 'approved' | 'rejected', feedback?: string) => {
  const resp = await api.post(`/hr/onboarding/${id}/review`, { decision, feedback });
  return resp.data;
};
