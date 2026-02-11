import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  getMyNotifications,
} from "../controllers/notificationController";

const router = Router();

router.get("/", authMiddleware, listNotifications);
router.get("/me", authMiddleware, getMyNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.post("/:id/read", authMiddleware, markAsRead);

export default router;
