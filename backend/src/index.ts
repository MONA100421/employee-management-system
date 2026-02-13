import "dotenv/config";
import "./workers/emailWorker"; 
import app from "./app";
import mongoose from "mongoose";

const PORT = process.env.PORT || 4000;

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});


if (process.env.NODE_ENV === "development") {
  localStorage.clear();
}
