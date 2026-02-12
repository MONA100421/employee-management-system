import { Router } from 'express';
import {
  getMyOnboarding,
  submitOnboarding,
  listOnboardingsForHR,
  reviewOnboarding,
  getOnboardingDetailForHR
} from '../controllers/onboardingController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireRole } from '../utils/requireRole';

const router = Router();

// Employee: get my
router.get('/onboarding/me', authMiddleware, getMyOnboarding);

// Employee: submit
router.post('/onboarding', authMiddleware, submitOnboarding);

// HR: list
router.get(
  "/hr",
  authMiddleware,
  requireRole("hr"),
  listOnboardingsForHR,
);

// HR: get detail
router.get(
  "/hr/onboarding/:id",
  authMiddleware,
  requireRole("hr"),
  getOnboardingDetailForHR,
);

// HR: review
router.post(
  "/hr/onboarding/:id/review",
  authMiddleware,
  requireRole("hr"),
  reviewOnboarding,
);

export default router;
