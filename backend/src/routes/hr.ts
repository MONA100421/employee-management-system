import { Router } from 'express';
import { listEmployees } from '../controllers/hrController';

const router = Router();

/**
 * GET /api/hr/employees
 */
router.get('/employees', listEmployees);

export default router;
