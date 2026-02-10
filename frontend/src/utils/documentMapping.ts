import type { BaseDocument, OnboardingDocument } from "../types/document";

export const toOnboardingDoc = (d: BaseDocument): OnboardingDocument => ({
  ...d,
  uploadedAt: d.uploadedAt ?? undefined,

  title:
    d.type === "id_card"
      ? "Driver's License / State ID"
      : d.type === "work_auth"
        ? "Work Authorization Document"
        : d.type === "profile_photo"
          ? "Profile Photo"
          : d.type,
});
