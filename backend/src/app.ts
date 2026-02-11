import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Route imports
import authRoutes from "./routes/auth";
import hrRoutes from "./routes/hr";
import employeeRoutes from "./routes/employee";
import onboardingRoutes from "./routes/onboarding";
import documentRoutes from "./routes/document";
import uploadRoutes from "./routes/upload";
import notificationRoutes from "./routes/notification"; 

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Routes
// Public / Auth
app.use("/api/auth", authRoutes);

// Protected APIs
app.use("/api/hr", hrRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;
