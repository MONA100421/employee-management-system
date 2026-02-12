import { Router } from "express";
import { inviteEmployee, listEmployees } from "../controllers/hrController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../utils/requireRole";

const router = Router();

router.get("/employees", authMiddleware, requireRole("HR"), listEmployees);

router.post("/invite", authMiddleware, requireRole("HR"), inviteEmployee);

export default router;
