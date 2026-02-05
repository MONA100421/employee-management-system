export type DocumentCategory = "onboarding" | "visa";

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
  hrFeedback?: string;
};

export type OnboardingDocument = BaseDocument & {
  title: string;
};
