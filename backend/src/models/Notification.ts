import { Schema, model } from "mongoose";

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true }, // e.g. 'document.rejected'
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Schema.Types.Mixed }, // optional payload (docId, url, ...)
  readAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.index({ user: 1, readAt: 1 });

export default model("Notification", NotificationSchema);
