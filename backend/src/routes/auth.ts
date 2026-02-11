import { Router } from "express";
import {
  loginHandler,
  registerHandler,
  validateRegistrationToken,
  refreshHandler,
  logoutHandler,
} from "../controllers/authController";

const router = Router();

router.post("/login", loginHandler);
router.get("/registration/:token", validateRegistrationToken);
router.post("/register", registerHandler);
router.post("/refresh", refreshHandler);
router.post("/logout", logoutHandler);

export default router;
