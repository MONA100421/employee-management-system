import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function RequireAuth() {
  const auth = useContext(AuthContext);

  if (!auth || auth.loading) {
    return null;
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
