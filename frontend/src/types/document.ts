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

export type AuditEntry = {
  action: "approved" | "rejected";
  at: string; // ISO date string
  feedback?: string | null;
  by?: UserRef | null;
};

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
  audit?: AuditEntry[];
};

export type OnboardingDocument = BaseDocument & {
  title: string;
};
