import type { BaseDocument } from "../types/document";
import type { OnboardingDocument } from "../pages/employee/types";

export const toOnboardingDoc = (d: BaseDocument): OnboardingDocument => ({
  ...d,
  title:
    d.type === "id_card"
      ? "Driver's License / State ID"
      : d.type === "work_auth"
        ? "Work Authorization Document"
        : d.type === "profile_photo"
          ? "Profile Photo"
          : d.type,
});
