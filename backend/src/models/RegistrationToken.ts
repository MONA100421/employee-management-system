import { Schema, model, Document as MongooseDocument } from "mongoose";

const TokenSchema = new Schema({
  email: { type: String, required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  usedAt: { type: Date, default: null },
  usedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  role: { type: String, enum: ["employee"], default: "employee" },
});

export interface RegistrationTokenDocument extends MongooseDocument {
  email: string;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
  usedAt?: Date;
  usedBy?: Schema.Types.ObjectId;
  createdBy?: Schema.Types.ObjectId;
}

export default model<RegistrationTokenDocument>(
  "RegistrationToken",
  TokenSchema,
);

