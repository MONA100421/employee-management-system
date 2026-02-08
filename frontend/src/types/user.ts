export type User = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  preferredName?: string;
  phone?: string;
};

export type EmployeeProfile = {
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  employment?: {
    employeeId?: string;
    title?: string;
    department?: string;
    manager?: string;
    startDate?: string;
    workAuthorization?: string;
  };
  emergency?: {
    contactName?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
};

