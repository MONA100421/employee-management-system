import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Login from './pages/auth/Login';
import EmployeeProfiles from './pages/hr/EmployeeProfiles';

import RequireAuth from './routes/RequireAuth';
import RequireRole from './routes/RequireRole';

function HRDashboard() {
  return <h1>HR Dashboard</h1>;
}

function EmployeeDashboard() {
  return <h1>Employee Dashboard</h1>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* public */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />

          {/* protected */}
          <Route element={<RequireAuth />}>
            {/* HR only */}
            <Route element={<RequireRole role="hr" />}>
              <Route path="/hr/dashboard" element={<HRDashboard />} />
              <Route path="/hr/employees" element={<EmployeeProfiles />} />
            </Route>

            {/* Employee only */}
            <Route element={<RequireRole role="employee" />}>
              <Route
                path="/employee/dashboard"
                element={<EmployeeDashboard />}
              />
            </Route>
          </Route>

          {/* fallback */}
          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
