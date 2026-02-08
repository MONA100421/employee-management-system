import { z } from "zod";

export const employeeProfileSchema = z.object({
  // Name
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  middleName: z.string().optional(),
  preferredName: z.string().optional(),

  // Contact
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().optional(),
  workPhone: z.string().optional(),

  // Address
  street: z.string().optional(),
  apt: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),

  // Employment (read-only, still typed)
  employeeId: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  manager: z.string().optional(),
  startDate: z.string().optional(),
  workAuthorization: z.string().optional(),

  // Emergency
  emergencyContactName: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyEmail: z.string().email("Invalid emergency email").optional(),
});

export type EmployeeProfileFormValues = z.infer<typeof employeeProfileSchema>;
