import { z } from "zod";


export const onboardingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),

  middleName: z.string().optional(),
  preferredName: z.string().optional(),

  ssn: z.string().min(1, "SSN is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),

  gender: z.string().optional(),

  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  phone: z.string().optional(),

  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelationship: z.string().optional(),

  workAuthType: z.string().optional(),
  workAuthOther: z.string().optional(),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
