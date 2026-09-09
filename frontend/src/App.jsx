import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import RegistrationsPage from "./pages/RegistrationsPage";
import QueuesPage from "./pages/QueuesPage";
import ExaminationsPage from "./pages/ExaminationsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients"
        element={
          <ProtectedRoute
            allowedRoles={["administrator", "petugas_pendaftaran"]}
          >
            <PatientsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/registrations"
        element={
          <ProtectedRoute
            allowedRoles={["administrator", "petugas_pendaftaran"]}
          >
            <RegistrationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/queues"
        element={
          <ProtectedRoute
            allowedRoles={["administrator", "petugas_pendaftaran", "dokter"]}
          >
            <QueuesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/examinations"
        element={
          <ProtectedRoute allowedRoles={["dokter"]}>
            <ExaminationsPage />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
