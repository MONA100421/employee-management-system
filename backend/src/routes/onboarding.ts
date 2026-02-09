import { Router } from 'express';
import {
  getMyOnboarding,
  submitOnboarding,
  listOnboardingsForHR,
  reviewOnboarding,
  getOnboardingDetailForHR
} from '../controllers/onboardingController';
import { authMiddleware } from '../utils/authMiddleware';
import { requireRole } from '../utils/requireRole';

const router = Router();

// Employee: get my
router.get('/onboarding/me', authMiddleware, getMyOnboarding);

// Employee: submit
router.post('/onboarding', authMiddleware, submitOnboarding);

// HR: list
router.get('/hr/onboarding', authMiddleware, listOnboardingsForHR);

// HR: review
router.post('/hr/onboarding/:id/review', authMiddleware, reviewOnboarding);

router.get(
  "/hr/onboarding/:id",
  authMiddleware,
  requireRole("hr"),
  getOnboardingDetailForHR,
);

export default router;
