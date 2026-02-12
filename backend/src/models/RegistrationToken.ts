import { Schema, model, Types } from "mongoose";

export interface RegistrationTokenDocument {
  email: string;
  tokenHash: string;
  name?: string;
  registrationLink?: string;
  createdBy?: Types.ObjectId;
  createdAt?: Date;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date | null;
  usedBy?: Types.ObjectId | null;
  role: "employee";
}

const TokenSchema = new Schema<RegistrationTokenDocument>({
  email: { type: String, required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  name: { type: String, default: null },
  registrationLink: { type: String, default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
  used: { type: Boolean, default: false },
  usedAt: { type: Date, default: null },
  usedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  role: {
    type: String,
    enum: ["employee"],
    default: "employee",
  },
});

TokenSchema.index(
  { email: 1, used: 1 },
  {
    unique: true,
    partialFilterExpression: { used: false },
  },
);

export default model<RegistrationTokenDocument>(
  "RegistrationToken",
  TokenSchema,
);
