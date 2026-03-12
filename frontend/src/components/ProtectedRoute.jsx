import React, { useState, useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_HOME } from "../routes";

/**
 * ProtectedRoute
 *
 * Wraps any page that requires authentication.
 *   - Unauthenticated → redirect to /login (saves the attempted URL in
 *     location.state.from so LoginPage can redirect back after sign-in).
 *   - Wrong role      → shows Access Denied then redirects to their dashboard.
 *   - Loading         → spinner while the auth session is being verified.
 *
 * Props:
 *   children  — the protected component(s) to render
 *   roles     — array of allowed DB role strings e.g. ['admin'] or ['admin','staff']
 *               omit / pass [] to allow ANY authenticated user
 */

function AccessDenied({ home }) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate(home, { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [navigate, home]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fa-solid fa-shield-halved text-red-500 text-2xl"></i>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-6">
          You don't have permission to access this page. Redirecting to your
          dashboard…
        </p>
        <button
          onClick={() => navigate(home, { replace: true })}
          className="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}

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
    const home = ROLE_HOME[user.role] || "/";
    return <AccessDenied home={home} />;
  }

  return children;
}

export default ProtectedRoute;
