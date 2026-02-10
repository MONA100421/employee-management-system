import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import { presignUpload } from "../controllers/uploadController";

const router = Router();

// POST /api/uploads/presign
router.post("/presign", authMiddleware, presignUpload);

export default router;
