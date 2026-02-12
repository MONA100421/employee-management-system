import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  presignUpload,
  presignGet,
  uploadComplete,
} from "../controllers/uploadController";
import { enforceVisaOrder } from "../middleware/enforceVisaOrder";

const router = Router();

/**
 * POST /api/uploads/presign
 * Get a presigned URL to upload a file directly to S3
 */
router.post(
  "/presign",
  authMiddleware,
  enforceVisaOrder,
  presignUpload,
);

/**
 * POST /api/uploads/complete
 * Sync database record after successful S3 upload
 * This aligns with Project-B requirement for document visibility and status management
 */
router.post(
  "/complete",
  authMiddleware,
  enforceVisaOrder,
  uploadComplete,
);

/**
 * POST /api/uploads/presign-get
 * Get a presigned URL to download/view a file
 */
router.post("/presign-get", authMiddleware, presignGet);

export default router;
