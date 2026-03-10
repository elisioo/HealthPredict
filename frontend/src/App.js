import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import ROUTES from "./routes";

// auth (public / guest)
import LandingPage from "./pages/auth/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import CreateAccountPage from "./pages/auth/CreateAccountPage";

// admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsersPage from "./pages/admin/ManageUsersPage";
import ReportsPage from "./pages/admin/ReportsPage";
import MLModelPage from "./pages/admin/MLModelPage";
import SystemLogsPage from "./pages/admin/SystemLogsPage";
import MedicalTeamPage from "./pages/admin/MedicalTeamPage";
import ActivityMonitorPage from "./pages/admin/ActivityMonitorPage";
import PredictionsReportPage from "./pages/admin/PredictionsReportPage";
import AdminMessagesPage from "./pages/admin/AdminMessagesPage";

// staff
import StaffDashboard from "./pages/staff/StaffDashboard";
import PatientRecordsPage from "./pages/staff/PatientRecordsPage";
import StaffAppointmentsPage from "./pages/staff/StaffAppointmentsPage";

// patient
import UserDashboard from "./pages/patient/UserDashboard";
import HistoryPage from "./pages/patient/HistoryPage";
import AppointmentsPage from "./pages/patient/AppointmentsPage";

// shared (all authenticated roles)
import PredictionPage from "./pages/shared/PredictionPage";
import ResultPage from "./pages/shared/ResultPage";
import MessagesPage from "./pages/shared/MessagesPage";
import ProfilePage from "./pages/shared/ProfilePage";
import SettingsPage from "./pages/shared/SettingsPage";

/**
 * HealthPredict - App Router
 *
 * Route access:
 *   /                  -> Landing (public)
 *   /login             -> Login (guest only)
 *   /register          -> Register (guest only)
 *   /dashboard         -> Health User dashboard
 *   /staff             -> Staff dashboard
 *   /staff/patients    -> Patient records
 *   /admin             -> Admin dashboard
 *   /admin/reports     -> Reports
 *   /prediction        -> Prediction form
 *   /result            -> Result page
 */
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path={ROUTES.landing.path} element={<LandingPage />} />

            {/* Guest-only */}
            <Route
              path={ROUTES.login.path}
              element={
                <GuestRoute>
                  <LoginPage />
                </GuestRoute>
              }
            />
            <Route
              path={ROUTES.register.path}
              element={
                <GuestRoute>
                  <CreateAccountPage />
                </GuestRoute>
              }
            />

            {/* Health User */}
            <Route
              path={ROUTES.userDashboard.path}
              element={
                <ProtectedRoute roles={["health_user"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Staff + Admin */}
            <Route
              path={ROUTES.staffDashboard.path}
              element={
                <ProtectedRoute roles={["admin", "staff"]}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.patientRecords.path}
              element={
                <ProtectedRoute roles={["admin", "staff"]}>
                  <PatientRecordsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin only */}
            <Route
              path={ROUTES.adminDashboard.path}
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.reports.path}
              element={
                <ProtectedRoute roles={["admin"]}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.manageUsers.path}
              element={
                <ProtectedRoute roles={["admin"]}>
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.mlModel.path}
              element={
                <ProtectedRoute roles={["admin"]}>
                  <MLModelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.systemLogs.path}
              element={
                <ProtectedRoute roles={["admin"]}>
                  <SystemLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.activityMonitor.path}
              element={
                <ProtectedRoute roles={["admin"]}>
                  <ActivityMonitorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.predictionsReport.path}
              element={
                <ProtectedRoute roles={["admin"]}>
                  <PredictionsReportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.adminMessages.path}
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminMessagesPage />
                </ProtectedRoute>
              }
            />

            {/* Staff + Admin */}
            <Route
              path={ROUTES.medicalTeam.path}
              element={
                <ProtectedRoute roles={["admin", "staff"]}>
                  <MedicalTeamPage />
                </ProtectedRoute>
              }
            />

            {/* Health User pages */}
            <Route
              path={ROUTES.history.path}
              element={
                <ProtectedRoute roles={["health_user"]}>
                  <HistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.profile.path}
              element={
                <ProtectedRoute roles={["health_user", "staff", "admin"]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.settings.path}
              element={
                <ProtectedRoute roles={["health_user", "staff", "admin"]}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />

            {/* All authenticated roles */}
            <Route
              path={ROUTES.messages.path}
              element={
                <ProtectedRoute roles={["admin", "staff", "health_user"]}>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.prediction.path}
              element={
                <ProtectedRoute roles={["admin", "staff", "health_user"]}>
                  <PredictionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.result.path}
              element={
                <ProtectedRoute roles={["admin", "staff", "health_user"]}>
                  <ResultPage />
                </ProtectedRoute>
              }
            />

            {/* 404 fallback */}
            <Route
              path="*"
              element={<Navigate to={ROUTES.landing.path} replace />}
            />

            {/* Appointments — Health User */}
            <Route
              path={ROUTES.appointments.path}
              element={
                <ProtectedRoute roles={["health_user"]}>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />

            {/* Appointments — Staff + Admin */}
            <Route
              path={ROUTES.staffAppointments.path}
              element={
                <ProtectedRoute roles={["admin", "staff"]}>
                  <StaffAppointmentsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
