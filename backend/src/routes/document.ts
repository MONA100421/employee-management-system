import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { enforceVisaOrder } from "../middleware/enforceVisaOrder";
import { requireRole } from "../utils/requireRole";
import {
  getMyDocuments,
  uploadDocument,
  reviewDocument,
  getDocumentsForHRByUser,
  getVisaDocumentsForHR,
} from "../controllers/documentController";

const router = Router();

// EMPLOYEE ROUTES
// Get documents owned by the current logged-in employee
router.get("/me", authMiddleware, getMyDocuments);

// Upload a new document
router.post("/", authMiddleware, enforceVisaOrder, uploadDocument);

// HR ROUTES
// View documents of a specific employee by their User ID
router.get(
  "/hr/:userId",
  authMiddleware,
  requireRole("hr"),
  getDocumentsForHRByUser,
);

// View all visa status management records (used by VisaManagement.tsx)
router.get(
  "/hr/visa",
  authMiddleware,
  requireRole("hr"),
  getVisaDocumentsForHR,
);

// Approve or Reject a document and provide feedback
router.post("/:id/review", authMiddleware, requireRole("hr"), reviewDocument);

export default router;
