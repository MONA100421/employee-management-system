import { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

type Props = {
  role: 'hr' | 'employee';
};

export default function RequireRole({ role }: Props) {
  const auth = useContext(AuthContext);

  if (!auth || !auth.user) {
    return null;
  }

  if (auth.user.role !== role) {
    return <h2 style={{ padding: 24 }}>Unauthorized</h2>;
  }

  return <Outlet />;
}
