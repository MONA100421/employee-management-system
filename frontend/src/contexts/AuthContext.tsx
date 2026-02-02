import { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const resp = await api.post('/auth/login', { username, password });

    if (resp.data.ok) {
      setUser(resp.data.user);
      localStorage.setItem('auth_user', JSON.stringify(resp.data.user));
      return { ok: true, user: resp.data.user };
    }

    return { ok: false, message: resp.data.message };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};