import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth";
import hrRoutes from "./routes/hr";
import employeeRoutes from "./routes/employee";
import onboardingRoutes from "./routes/onboarding";
import documentRoutes from "./routes/document";
import notificationRouter from "./routes/notification";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// public / auth
app.use("/api/auth", authRoutes);

// other APIs
app.use("/api/hr", hrRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api", onboardingRoutes); // e.g. /api/onboarding
app.use("/api/documents", documentRoutes);

// make notifications under /api/notifications
app.use("/api/notifications", notificationRouter);

export default app;
