import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import { requireRole } from "../utils/requireRole";
import { getDocsMetrics } from "../controllers/metricsController";

const router = Router();
router.get("/hr/docs", authMiddleware, requireRole("hr"), getDocsMetrics);
export default router;
