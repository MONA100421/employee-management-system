export type EmployeePersonalInfoForm = {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;

  email?: string;
  phone?: string;
  workPhone?: string;

  street?: string;
  apt?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;

  employeeId?: string;
  title?: string;
  department?: string;
  manager?: string;
  startDate?: string;
  workAuthorization?: string;

  emergencyContactName?: string;
  emergencyRelationship?: string;
  emergencyPhone?: string;
  emergencyEmail?: string;
};
