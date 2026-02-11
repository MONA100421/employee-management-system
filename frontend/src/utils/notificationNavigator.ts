import type { DashboardNotification } from "../types/notification";

interface NavigateOptions {
  state?: {
    scrollTo?: string;
    [key: string]: unknown;
  };
  replace?: boolean;
}

type NavigateFn = (path: string, opts?: NavigateOptions) => void;

export function handleNotificationNavigate(
  notif: DashboardNotification,
  navigate: NavigateFn,
) {
  const { type, data } = notif;

  if (
    type === "document_uploaded" ||
    type === "document_approved" ||
    type === "document_rejected"
  ) {

    const docId = data?.docId || data?.documentId;
    if (typeof docId !== "string") return;

    navigate("/employee/visa-status", {
      state: { scrollTo: docId },
    });
    return;
  }

  if (type === "onboarding_submitted" || type === "onboarding_rejected") {
    navigate("/employee/onboarding");
    return;
  }

  navigate("/employee/dashboard");
}
