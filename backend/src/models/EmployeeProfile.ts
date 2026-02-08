import { Schema, model, Types } from "mongoose";

const EmployeeProfileSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // Contact
    phone: String,

    // Employment
    employment: {
      employeeId: String,
      title: String,
      department: String,
      manager: String,
      startDate: Date,
      workAuthorization: String,
    },

    // Emergency
    emergency: {
      contactName: String,
      relationship: String,
      phone: String,
      email: String,
    },
  },
  { timestamps: true },
);

export default model("EmployeeProfile", EmployeeProfileSchema);
