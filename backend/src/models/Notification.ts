import { Schema, model, Types } from "mongoose";

const NotificationSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "document_uploaded",
        "document_approved",
        "document_rejected",
        "onboarding_submitted",
        "onboarding_approved",
        "onboarding_rejected",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    data: {
      type: Schema.Types.Mixed,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default model("Notification", NotificationSchema);
