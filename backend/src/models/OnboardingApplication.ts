import { Schema, model } from 'mongoose';

const OnboardingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["never_submitted", "pending", "approved", "rejected"],
      default: "never_submitted",
    },

    formData: {
      type: Schema.Types.Mixed,
    },

    hrFeedback: {
      type: String,
    },

    history: [
      {
        status: { type: String },
        updatedAt: { type: Date, default: Date.now },
        action: { type: String },
      },
    ],

    submittedAt: Date,
    reviewedAt: Date,
  },
  { timestamps: true },
);

export default model('OnboardingApplication', OnboardingSchema);
