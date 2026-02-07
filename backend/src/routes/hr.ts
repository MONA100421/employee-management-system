import { Router } from "express";
import { inviteEmployee, listEmployees } from "../controllers/hrController";
import { authMiddleware } from "../utils/authMiddleware";

const router = Router();

router.get("/employees", authMiddleware, listEmployees);
router.post("/invite", authMiddleware, inviteEmployee);

export default router;
