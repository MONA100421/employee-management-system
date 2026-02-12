import { Router } from "express";
import { inviteEmployee, listEmployees } from "../controllers/hrController";
import { authMiddleware } from "../middleware/authMiddleware";
import { requireRole } from "../utils/requireRole";
import { inviteHistory } from "../controllers/hrController";
import { reviewOnboarding, listOnboardingsForHR } from "../controllers/onboardingController";

const router = Router();

// List all employees - HR ONLY

router.get("/employees", authMiddleware, requireRole("hr"), listEmployees);
router.get(
  "/onboarding",
  authMiddleware,
  requireRole("hr"),
  listOnboardingsForHR,
);

router.post(
  "/onboarding/:id/review",
  authMiddleware,
  requireRole("hr"),
  reviewOnboarding,
);

// Send invitation - HR ONLY
router.post("/invite", authMiddleware, requireRole("hr"), inviteEmployee);

router.get("/invite/history", authMiddleware, requireRole("hr"), inviteHistory);

export default router;
