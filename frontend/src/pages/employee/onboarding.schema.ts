import { z } from "zod";

export const onboardingSchema = z
  .object({
    // Personal Info
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    middleName: z.string().optional(),
    preferredName: z.string().optional(),

    // SSN
    ssn: z
      .string()
      .min(1, "SSN is required")
      .regex(/^\d{3}-\d{2}-\d{4}$|^\d{9}$/, "Invalid SSN format (XXX-XX-XXXX)"),

    dateOfBirth: z.string().min(1, "Date of birth is required"),
    gender: z.enum(["male", "female", "other", "prefer-not", ""]),

    // Address
    address: z.string().min(1, "Building/Index/Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z
      .string()
      .min(1, "Zip Code is required")
      .regex(/^\d{5}(-\d{4})?$/, "Invalid Zip Code (5 digits)"),

    // Contact
    phone: z.string().min(1, "Cell phone number is required"),
    workPhone: z.string().optional(),

    // Emergency Contact
    emergencyContact: z.string().min(1, "Emergency contact name is required"),
    emergencyPhone: z.string().min(1, "Emergency contact phone is required"),
    emergencyRelationship: z.string().min(1, "Relationship is required"),

    // Work Authorization
    workAuthType: z.string().min(1, "Please select a work authorization type"),
    workAuthOther: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.workAuthType === "other" &&
        (!data.workAuthOther || data.workAuthOther.trim() === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please specify your visa title",
      path: ["workAuthOther"],
    },
  );

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
