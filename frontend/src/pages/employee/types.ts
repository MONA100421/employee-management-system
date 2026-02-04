export type DocumentStatus =
  | "not-started"
  | "pending"
  | "approved"
  | "rejected";

export type OnboardingDocument = {
  id: string;
  title: string;
  type: string;
  status: DocumentStatus;
  fileName?: string;
  uploadedAt?: string;
  feedback?: string;
};
