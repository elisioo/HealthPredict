import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const homePath = user
    ? user.role === "admin"
      ? "/admin"
      : user.role === "staff"
        ? "/staff"
        : "/dashboard"
    : "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Large 404 */}
        <h1 className="text-[8rem] sm:text-[10rem] font-extrabold leading-none text-primary/15 select-none">
          404
        </h1>

        {/* Icon */}
        <div className="relative -mt-16 mb-6">
          <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center">
            <i className="fa-solid fa-map-location-dot text-4xl text-primary"></i>
          </div>
        </div>

        {/* Copy */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          <br className="hidden sm:block" />
          It may have been deleted, or the URL may be incorrect.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            Go Back
          </button>
          <button
            onClick={() => navigate(homePath, { replace: true })}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-house text-xs"></i>
            Back to Home
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-10 text-xs text-gray-400">
          Error 404 — The server could not locate the requested page.
        </p>
      </div>
    </div>
  );
}
