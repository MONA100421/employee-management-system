import api from "./api";
import type { Notification } from "../types/notification";

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await api.get("/notifications");
  return res.data.notifications;
}
export async function fetchUnreadCount(): Promise<number> {
  const res = await api.get("/notifications/unread-count");
  return res.data.count;
}
export async function markNotificationRead(id: string) {
  await api.post(`/notifications/${id}/read`);
}
