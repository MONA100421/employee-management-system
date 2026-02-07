import { Schema, model } from 'mongoose';

const UserSchema = new Schema(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["employee", "hr", "admin"],
      default: "employee",
    },
    profile: {
      firstName: String,
      lastName: String,
      preferredName: String,
      dob: Date,
      ssn: String,
      address: {
        street: String,
        city: String,
        state: String,
        zip: String,
      },
      contacts: {
        phone: String,
        cell: String,
      },
    },
    workAuthorization: {
      isCitizen: Boolean,
      type: String,
      startDate: Date,
      endDate: Date,
    },
  },
  { timestamps: true },
);

export default model('User', UserSchema);
