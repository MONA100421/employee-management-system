import { Router } from "express";
import { inviteEmployee, listEmployees } from "../controllers/hrController";
import { authMiddleware } from "../utils/authMiddleware";
import { requireRole } from "../utils/requireRole";

const router = Router();

router.get("/employees", authMiddleware, requireRole("hr"), listEmployees);

router.post("/invite", authMiddleware, requireRole("hr"), inviteEmployee);

export default router;
