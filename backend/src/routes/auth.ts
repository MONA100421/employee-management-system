import { Router } from "express";
import {
  loginHandler,
  registerHandler,
  validateRegistrationToken,
} from "../controllers/authController";

const router = Router();

router.post("/login", loginHandler);
router.get("/registration/:token", validateRegistrationToken);
router.post("/register", registerHandler);

export default router;
