import { Schema, model } from 'mongoose';

const OnboardingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['never_submitted','pending','approved','rejected'], default: 'never_submitted' },
  formData: Schema.Types.Mixed,
  uploadedFiles: [{
    type: { type: String },
    url: String,
    status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
    hrFeedback: String
  }],
  submittedAt: Date,
  reviewedAt: Date
}, { timestamps: true });

export default model('OnboardingApplication', OnboardingSchema);
