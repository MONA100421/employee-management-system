export type NotificationData = {
  documentId?: string;
  documentType?: string;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: NotificationData;
  readAt?: string | null;
  createdAt?: string;
};

export interface DashboardNotification {
  id: string;
  type: string;
  title?: string;
  message: string;
  data?: Record<string, unknown>;
  readAt?: string | Date | null;
  createdAt: string | Date;
}