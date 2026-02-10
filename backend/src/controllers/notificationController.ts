import { Request, Response } from "express";
import Notification from "../models/Notification";

export const listNotifications = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ ok: false });

  const notifs = await Notification.find({ user: user.id })
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ ok: true, notifications: notifs });
};

export const getUnreadCount = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ ok: false });

  const count = await Notification.countDocuments({
    user: user.id,
    readAt: null,
  });
  return res.json({ ok: true, count });
};

export const markAsRead = async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ ok: false });

  const { id } = req.params;
  await Notification.updateOne(
    { _id: id, user: user.id },
    { $set: { readAt: new Date() } },
  );
  return res.json({ ok: true });
};
