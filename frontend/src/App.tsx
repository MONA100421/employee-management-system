import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// layout
import AppLayout from "./layout/AppLayout";

// guards
import RequireAuth from "./routes/RequireAuth";
import RequireRole from "./routes/RequireRole";

// employee pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import VisaStatus from "./pages/employee/VisaStatus";

// hr pages
import HRDashboard from "./pages/hr/HRDashboard";
import EmployeeProfiles from "./pages/hr/EmployeeProfiles";
import EmployeeProfileDetail from "./pages/hr/EmployeeProfileDetail";
import HiringManagement from "./pages/hr/HiringManagement";
import VisaManagement from "./pages/hr/VisaManagement";
import OnboardingApplication from "./pages/employee/OnboardingApplication";
import EmployeePersonalInfoPage from "./pages/employee/EmployeePersonalInfoPage";
import HROnboardingDetail from "./pages/hr/HROnboardingDetail";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              {/* Employee Routes */}
              <Route path="/employee" element={<RequireRole role="employee" />}>
                {/* EMPLOYEE */}
                <Route
                  path="/employee/dashboard"
                  element={<EmployeeDashboard />}
                />
                <Route
                  path="/employee/personal-info"
                  element={<EmployeePersonalInfoPage />}
                />
                <Route
                  path="/employee/onboarding"
                  element={<OnboardingApplication />}
                />
                <Route path="/employee/visa-status" element={<VisaStatus />} />
              </Route>

              {/* HR Routes */}
              <Route path="/hr" element={<RequireRole role="hr" />}>
                <Route path="dashboard" element={<HRDashboard />} />
                <Route path="employees" element={<EmployeeProfiles />} />
                <Route
                  path="employees/:id"
                  element={<EmployeeProfileDetail />}
                />
                <Route path="visa-management" element={<VisaManagement />} />
                <Route path="hiring" element={<HiringManagement />} />
                <Route path="onboarding/:id" element={<HROnboardingDetail />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
