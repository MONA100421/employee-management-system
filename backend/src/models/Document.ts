import { Schema, model } from "mongoose";

export type DocumentStatus =
  | "not_started"
  | "pending"
  | "approved"
  | "rejected";

const AuditEntrySchema = new Schema(
  {
    action: {
      type: String,
      enum: ["approved", "rejected", "revoked", "uploaded"],
      required: true,
    },
    by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String },
    at: { type: Date, default: Date.now },
    feedback: { type: String, default: null },
  },
  { _id: false },
);

const DocumentSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: [
        "id_card",
        "work_auth",
        "profile_photo",
        "opt_receipt",
        "opt_ead",
        "i_983",
        "i_20",
      ],
    },
    category: { type: String, enum: ["onboarding", "visa"], required: true },
    status: {
      type: String,
      enum: ["not_started", "pending", "approved", "rejected"],
      default: "not_started",
    },
    fileName: String,
    fileUrl: String,
    uploadedAt: Date,

    // Revocation and Soft-delete fields
    revoked: { type: Boolean, default: false },
    revokedAt: Date,
    deletedAt: { type: Date, default: null },
    hrFeedback: String,
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },

    audit: { type: [AuditEntrySchema], default: [] },
  },
  { timestamps: true },
);

DocumentSchema.index({ user: 1, type: 1, deletedAt: 1 }, { unique: true });

export default model("Document", DocumentSchema);