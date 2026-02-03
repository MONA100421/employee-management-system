import { createContext } from 'react';

export type User = {
  username: string;
  role: 'hr' | 'employee';
  firstName?: string;
  lastName?: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{
    ok: boolean;
    user?: User;
    message?: string;
  }>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);
