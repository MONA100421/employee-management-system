export type HRDocument = {
  id: string;
  employeeName: string;
  employeeEmail: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  fileName?: string;
  uploadedAt?: string;
  hrFeedback?: string;
};
