import { createContext, useContext } from "react";

export type User = {
  id?: string;
  username: string;
  email: string;
  role: "hr" | "employee";
  firstName?: string;
  lastName?: string;
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

  register: (payload: {
    email: string;
    username: string;
    password: string;
    token?: string;
  }) => Promise<{
    ok: boolean;
    message?: string;
  }>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
