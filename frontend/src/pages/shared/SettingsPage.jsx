import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/authApi";

export default function SettingsPage() {
  const { user } = useAuth();
  const role = user?.role;
  const navKey = role === "health_user" ? "patient" : role;
  const navItems = NAV_BY_ROLE[navKey] ?? NAV_BY_ROLE.patient;

  // Staff availability state — seeded from user object
  const [availability, setAvailability] = useState(
    user?.availability_status ?? "available",
  );
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleAvailabilityToggle = async (newStatus) => {
    if (savingStatus || newStatus === availability) return;
    setSavingStatus(true);
    setStatusMsg("");
    try {
      await authApi.updateStatus(newStatus);
      setAvailability(newStatus);
      setStatusMsg("Status updated.");
      setTimeout(() => setStatusMsg(""), 2500);
    } catch {
      setStatusMsg("Failed to update status. Please try again.");
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <DashboardLayout
      navItems={navItems}
      title="Settings"
      subtitle="Manage your preferences"
    >
      <div className="max-w-2xl space-y-6">
        {/* Staff availability status */}
        {role === "staff" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Availability Status
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Patients can only message you when you are set to{" "}
              <strong>Available</strong>.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleAvailabilityToggle("available")}
                disabled={savingStatus}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  availability === "available"
                    ? "bg-green-500 border-green-500 text-white shadow-sm"
                    : "bg-white border-gray-300 text-gray-600 hover:border-green-400 hover:text-green-600"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    availability === "available" ? "bg-white" : "bg-gray-400"
                  }`}
                />
                Available
              </button>
              <button
                onClick={() => handleAvailabilityToggle("unavailable")}
                disabled={savingStatus}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  availability === "unavailable"
                    ? "bg-gray-500 border-gray-500 text-white shadow-sm"
                    : "bg-white border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-700"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    availability === "unavailable" ? "bg-white" : "bg-gray-400"
                  }`}
                />
                Not Available
              </button>
            </div>
            {statusMsg && (
              <p
                className={`text-xs mt-2 ${
                  statusMsg.includes("Failed")
                    ? "text-red-500"
                    : "text-green-600"
                }`}
              >
                {statusMsg}
              </p>
            )}
          </div>
        )}

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

