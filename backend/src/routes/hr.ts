import { Router } from "express";
import { inviteEmployee, listEmployees } from "../controllers/hrController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../utils/requireRole";

const router = Router();

// List all employees - HR ONLY
router.get("/employees", authMiddleware, requireRole("hr"), listEmployees);

// Send invitation - HR ONLY
router.post("/invite", authMiddleware, requireRole("hr"), inviteEmployee);

export default router;
