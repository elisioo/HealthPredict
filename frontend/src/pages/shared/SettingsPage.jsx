import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { authApi } from "../../api/authApi";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const role = user?.role;
  const navKey = role === "health_user" ? "patient" : role;
  const navItems = NAV_BY_ROLE[navKey] ?? NAV_BY_ROLE.patient;

  // Staff availability state — seeded from user object
  const [availability, setAvailability] = useState(
    user?.availability_status ?? "available",
  );
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Please enter your password.");
      return;
    }
    setDeleting(true);
    setDeleteError("");
    try {
      const { data } = await authApi.deleteAccount(deletePassword);
      showToast(data.message, "success", 6000);
      await logout();
    } catch (err) {
      setDeleteError(
        err.response?.data?.error || "Failed to delete account.",
      );
    } finally {
      setDeleting(false);
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
            <button
              onClick={() => {
                setShowDeleteModal(true);
                setDeletePassword("");
                setDeleteError("");
              }}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              {role === "staff" ? "Request Account Deletion" : "Delete Account"}
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleting)
              setShowDeleteModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto bg-red-100">
              <i className="fa fa-triangle-exclamation text-xl text-red-600" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 text-center mb-1">
              {role === "staff"
                ? "Request Account Deletion"
                : "Delete Account"}
            </h3>

            <p className="text-sm text-slate-500 text-center mb-4 leading-relaxed">
              {role === "staff"
                ? "Your account will be deactivated immediately and permanently deleted after 5 working days. This cannot be undone."
                : "This will permanently delete your account and all associated data. This action cannot be undone."}
            </p>

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm your password
            </label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-1"
              disabled={deleting}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDeleteAccount();
              }}
            />

            {deleteError && (
              <p className="text-xs text-red-500 mb-2">{deleteError}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fa fa-circle-notch fa-spin text-xs" />{" "}
                    Processing…
                  </span>
                ) : role === "staff" ? (
                  "Submit Resignation"
                ) : (
                  "Delete My Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

