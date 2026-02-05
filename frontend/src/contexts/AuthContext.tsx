import { createContext } from 'react';

export type User = {
  username: string;
  role: "hr" | "employee";
  firstName?: string;
  lastName?: string;
  email: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{
    ok: boolean;
    user?: User;
    message?: string;
  }>;
  logout: () => void;
  register: (data: {
    email: string;
    username: string;
    password: string;
  }) => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextType | null>(null);


