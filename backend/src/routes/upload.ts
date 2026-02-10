import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import { presignUpload, presignGet } from "../controllers/uploadController";

const router = Router();

// POST /api/uploads/presign
router.post("/presign", authMiddleware, presignUpload);

// POST /api/uploads/presign-get
router.post("/presign-get", authMiddleware, presignGet);

export default router;
