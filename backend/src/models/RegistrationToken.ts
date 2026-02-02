import { Schema, model } from 'mongoose';

const TokenSchema = new Schema({
  email: String,
  tokenHash: String,
  createdAt: { type: Date, default: Date.now },
  expiresAt: Date,
  used: { type: Boolean, default: false },
  sentBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

export default model('RegistrationToken', TokenSchema);
