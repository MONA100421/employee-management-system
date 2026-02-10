import api from "./api";
import type { Notification } from "../types/notification";

type RawNotification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  data?: unknown;
  readAt?: string | null;
  createdAt?: string;
};

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await api.get<{ notifications: RawNotification[] }>(
    "/notifications",
  );
  return res.data.notifications.map((n) => ({
    id: n._id,
    type: n.type,
    title: n.title,
    message: n.message,
    data: n.data as Notification["data"],
    readAt: n.readAt ?? null,
    createdAt: n.createdAt,
  }));
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await api.get<{ count: number }>("/notifications/unread-count");
  return res.data.count;
}

export async function markNotificationRead(id: string) {
  await api.post(`/notifications/${id}/read`);
}
