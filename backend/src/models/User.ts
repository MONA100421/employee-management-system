import { Schema, model } from "mongoose";

const UserSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["employee", "hr", "admin"],
      default: "employee",
    },
    profile: {
      firstName: String,
      lastName: String,
      middleName: String,
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
      authType: {
        type: String,
      },
      startDate: Date,
      endDate: Date,
    },
  },
  { timestamps: true },
);

export default model("User", UserSchema);
