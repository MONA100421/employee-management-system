export type DocumentCategory = "onboarding" | "visa";

export type UserRef = {
  id: string;
  username: string;
};
export type DocumentStatus =
  | "not-started"
  | "pending"
  | "approved"
  | "rejected";

export type BaseDocument = {
  id: string;
  type: string;
  category: DocumentCategory;
  status: DocumentStatus;
  fileName?: string;
  uploadedAt?: string;
  // HR review
  reviewedAt?: string | null;
  reviewedBy?: UserRef | null;
  hrFeedback?: string | null;
};

export type OnboardingDocument = BaseDocument & {
  title: string;
};
