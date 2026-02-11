import { useState } from "react";
import type { ReactNode } from "react";
import api from "../lib/api";
import { AuthContext, type User, type AuthContextType } from "./AuthContext";
import { resetDocumentsCache } from "../hooks/useDocuments";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize user from localStorage safely
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading] = useState(false);

  /**
   * Login: Authenticate user, save JWT token and user info, then reset local caches
   */
  const login: AuthContextType["login"] = async (username, password) => {
    try {
      const resp = await api.post("/auth/login", { username, password });

      if (resp.data.ok) {
        const { token, user: loggedInUser } = resp.data;

        // Store JWT token for API authorization
        localStorage.setItem("auth_token", token);

        // Store user for UI persistence
        setUser(loggedInUser);
        localStorage.setItem("auth_user", JSON.stringify(loggedInUser));

        // Clear cached data so the new user doesn't see old documents
        resetDocumentsCache();

        return { ok: true, user: loggedInUser };
      }
      return { ok: false, message: resp.data.message };
    } catch {
      // Replaced 'err' with nothing to fix ESLint warning
      return {
        ok: false,
        message: "Login failed. Please check your credentials.",
      };
    }
  };

  /**
   * Logout: Clear all local auth data and caches
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    resetDocumentsCache();
  };

  /**
   * Register: Submit invitation token and user details to create a new account
   */
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
      // Handle axios error responses to show specific backend messages
      let message =
        "Registration failed. Invitation may be invalid or expired.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as {
          response?: { data?: { message?: string } };
        };
        if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        }
      }

      return { ok: false, message };
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
