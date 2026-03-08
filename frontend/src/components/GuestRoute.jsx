import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_HOME } from "../routes";

/**
 * GuestRoute — wraps login and register pages.
 *
 * If the user is already authenticated it redirects them to their home
 * dashboard instead of showing the page.
 */
function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    const home = ROLE_HOME[user.role] || "/";
    return <Navigate to={home} replace />;
  }

  return children;
}

export default GuestRoute;
