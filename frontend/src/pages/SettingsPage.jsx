import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { NAV_BY_ROLE } from "../components/navConfig";

export default function SettingsPage() {
  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.patient}
      title="Settings"
      subtitle="Manage your preferences"
    >
      <div className="max-w-2xl space-y-6">
        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Notifications
          </h3>
          <div className="space-y-4">
            {["Email notifications", "Prediction reminders", "Health tips"].map(
              (label) => (
                <label
                  key={label}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-700">{label}</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                </label>
              ),
            )}
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account</h3>
          <div className="space-y-3">
            <button className="text-sm text-primary hover:text-primary-dark font-medium">
              Change Password
            </button>
            <br />
            <button className="text-sm text-red-500 hover:text-red-700 font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
