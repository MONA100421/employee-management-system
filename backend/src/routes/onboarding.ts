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

// Employee: get my onboarding
router.get('/me', authMiddleware, getMyOnboarding);

// Employee: submit onboarding
router.post('/', authMiddleware, submitOnboarding);


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
