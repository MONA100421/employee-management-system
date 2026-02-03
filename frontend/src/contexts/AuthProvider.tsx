import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../lib/api';
import { AuthContext, type User, type AuthContextType } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
        const stored = localStorage.getItem('auth_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
        setLoading(false);
    };

    initAuth();
  }, []);

  const login: AuthContextType['login'] = async (username, password) => {
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
