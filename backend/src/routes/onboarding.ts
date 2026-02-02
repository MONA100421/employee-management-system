import { Router } from 'express';
import {
  getMyOnboarding,
  submitOnboarding,
  listOnboardingsForHR,
  reviewOnboarding
} from '../controllers/onboardingController';
import { authMiddleware } from '../utils/authMiddleware';

const router = Router();

// Employee: get my
router.get('/onboarding/me', authMiddleware, getMyOnboarding);

// Employee: submit
router.post('/onboarding', authMiddleware, submitOnboarding);

// HR: list
router.get('/hr/onboarding', authMiddleware, listOnboardingsForHR);

// HR: review
router.post('/hr/onboarding/:id/review', authMiddleware, reviewOnboarding);

export default router;
