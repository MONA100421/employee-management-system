export const NotificationTypes = {
  DOCUMENT_UPLOADED: "document_uploaded",
  DOCUMENT_APPROVED: "document_approved",
  DOCUMENT_REJECTED: "document_rejected",
  ONBOARDING_REVIEW_APPROVED: "onboarding_review_approved",
  ONBOARDING_REVIEW_REJECTED: "onboarding_review_rejected",
} as const;

export type NotificationType =
  (typeof NotificationTypes)[keyof typeof NotificationTypes];
