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
