import { Schema, model, Types } from "mongoose";

export interface RefreshTokenDocument {
  user: Types.ObjectId;
  tokenHash: string;
  createdAt?: Date;
  expiresAt: Date;
  revoked?: boolean;
  replacedBy?: Types.ObjectId | null;
}

const RefreshTokenSchema = new Schema<RefreshTokenDocument>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tokenHash: { type: String, required: true, index: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  replacedBy: {
    type: Schema.Types.ObjectId,
    ref: "RefreshToken",
    default: null,
  },
});

export default model<RefreshTokenDocument>("RefreshToken", RefreshTokenSchema);
