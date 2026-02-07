import { useState } from "react";
import type { ReactNode } from "react";
import api from "../lib/api";
import { AuthContext, type User, type AuthContextType } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("auth_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [loading] = useState(false);

  // Login
  const login: AuthContextType["login"] = async (username, password) => {
    try {
      const resp = await api.post("/auth/login", { username, password });

      if (resp.data.ok) {
        setUser(resp.data.user);
        localStorage.setItem("auth_user", JSON.stringify(resp.data.user));
        return { ok: true, user: resp.data.user };
      }

      return { ok: false, message: resp.data.message };
    } catch {
      return { ok: false, message: "Login failed" };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
  };

  // Register (invite-based)
  const register: AuthContextType["register"] = async ({
    email,
    username,
    password,
    token,
  }) => {
    try {
      await api.post("/auth/register", {
        email,
        username,
        password,
        token,
      });

      return { ok: true };
    } catch (err: unknown) {
      let message =
        "Registration failed. Invitation may be invalid or expired.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;

        if (response?.data?.message) {
          message = response.data.message;
        }
      }

      return {
        ok: false,
        message,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
