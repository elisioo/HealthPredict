import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_HOME } from "../routes";

/**
 * ProtectedRoute
 *
 * Wraps any page that requires authentication.
 *   - Unauthenticated → redirect to /login (saves the attempted URL in
 *     location.state.from so LoginPage can redirect back after sign-in).
 *   - Wrong role      → redirect to the user's own home dashboard.
 *   - Loading         → spinner while the auth session is being verified.
 *
 * Props:
 *   children  — the protected component(s) to render
 *   roles     — array of allowed DB role strings e.g. ['admin'] or ['admin','staff']
 *               omit / pass [] to allow ANY authenticated user
 */
function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Preserve where the user was trying to go so LoginPage can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Authenticated but wrong role — bounce to their own dashboard
    const home = ROLE_HOME[user.role] || "/";
    return <Navigate to={home} replace />;
  }

  return children;
}

export default ProtectedRoute;
