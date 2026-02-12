import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { presignUpload, presignGet, uploadController } from "../controllers/uploadController";
import { enforceVisaOrder } from "../middleware/enforceVisaOrder";

const router = Router();

// POST /api/uploads/presign
router.post("/presign", authMiddleware, presignUpload);

// POST /api/uploads/presign-get
router.post("/presign-get", authMiddleware, presignGet);

router.post(
  "/upload",
  authMiddleware,
  enforceVisaOrder,
  uploadController,
);

export default router;
