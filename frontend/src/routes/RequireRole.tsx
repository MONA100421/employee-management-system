import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

type Props = {
  role: "hr" | "employee" | "HR";
};

export default function RequireRole({ role }: Props) {
  const auth = useContext(AuthContext);

  if (!auth || auth.loading) {
    return null;
  }

  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }

  if (auth.user.role.toLowerCase() !== role.toLowerCase()) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <h2>403 - Unauthorized</h2>
        <p>You do not have permission to access this page.</p>
        <p>
          Debug: Your role is "{auth.user.role}", but this page requires "{role}
          "
        </p>
      </div>
    );
  }

  return <Outlet />;
}
