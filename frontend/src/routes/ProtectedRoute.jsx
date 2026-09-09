import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wraps a page: redirects to /login if not authenticated, and optionally
// restricts access to a set of allowed roles.
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
