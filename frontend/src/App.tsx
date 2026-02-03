import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';

import Login from './pages/auth/Login';

// layouts
import AppLayout from './layout/AppLayout';

// guards
import RequireAuth from './routes/RequireAuth';
import RequireRole from './routes/RequireRole';

// employee pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import Onboarding from './pages/employee/OnboardingApplication';

// hr pages
import EmployeeProfiles from './pages/hr/EmployeeProfiles';
import HRDashboard from './pages/hr/HRDashboard';
import EmployeeProfileDetail from './pages/hr/EmployeeProfileDetail';

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
            <Route element={<AppLayout />}>
              {/* employee */}
              <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
              <Route path="/employee/onboarding" element={<Onboarding />} />

              {/* hr */}
              <Route element={<RequireRole role="hr" />}>
                <Route path="/hr/dashboard" element={<HRDashboard />} />
                <Route path="/hr/employees" element={<EmployeeProfiles />} />
                <Route path="/hr/onboarding/:id" element={<EmployeeProfileDetail />} />
              </Route>
            </Route>
          </Route>

          {/* fallback */}
          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
