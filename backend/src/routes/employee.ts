import { Router } from 'express';
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getMyEmployee,
  patchMyEmployee,
} from "../controllers/employeeController";


const router = Router();

router.get('/me', authMiddleware, getMyEmployee);
router.patch('/me', authMiddleware, patchMyEmployee);
export default router;
