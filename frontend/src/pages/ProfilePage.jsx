import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { NAV_BY_ROLE } from "../components/navConfig";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.patient}
      title="My Profile"
      subtitle="View your account details"
    >
      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="fa-solid fa-user text-primary text-2xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.fullName || "User"}
              </h2>
              <p className="text-sm text-gray-500 capitalize">
                {user?.role === "health_user" ? "Health User" : user?.role}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Email
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {user?.email || "—"}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">
                Phone
              </label>
              <p className="text-sm font-medium text-gray-900 mt-1">
                {user?.phone || "Not set"}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
