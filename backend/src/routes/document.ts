import { Router } from 'express';
import { authMiddleware } from '../utils/authMiddleware';
import {
  getMyDocuments,
  uploadDocument,
  reviewDocument,
} from '../controllers/documentController';

const router = Router();

// employee
router.get('/me', authMiddleware, getMyDocuments);
router.post('/', authMiddleware, uploadDocument);
// HR
router.post('/:id/review', authMiddleware, reviewDocument);

export default router;
