import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import { requireRole } from "../utils/requireRole";
import {
  getMyDocuments,
  uploadDocument,
  reviewDocument,
  getDocumentsForHRByUser,
  getVisaDocumentsForHR,
} from "../controllers/documentController";

const router = Router();

// employee
router.get("/me", authMiddleware, getMyDocuments);
router.post("/", authMiddleware, uploadDocument);

// HR
router.get(
  "/hr/:userId",
  authMiddleware,
  requireRole("hr"),
  getDocumentsForHRByUser,
);

router.get(
  "/hr/visa",
  authMiddleware,
  requireRole("hr"),
  getVisaDocumentsForHR,
);

router.post("/:id/review", authMiddleware, requireRole("hr"), reviewDocument);

export default router;
