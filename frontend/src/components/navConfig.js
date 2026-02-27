// Shared navigation definitions by role for the reusable Sidebar
export const NAV_BY_ROLE = {
  admin: [
    { icon: "fa-chart-line", label: "Dashboard", page: "admin-dashboard" },
    { icon: "fa-users", label: "Manage Users", page: null },
    { icon: "fa-brain", label: "ML Model", page: null },
    { icon: "fa-chart-pie", label: "Predictions", page: "reports" },
    { icon: "fa-file-lines", label: "System Logs", page: null },
  ],
  staff: [
    { icon: "fa-house", label: "Dashboard", page: "staff-dashboard" },
    { icon: "fa-plus-circle", label: "New Prediction", page: "prediction" },
    {
      icon: "fa-folder-open",
      label: "Patient Records",
      page: "patient-records",
      badge: "12",
    },
    { icon: "fa-chart-pie", label: "Analytics Reports", page: "reports" },
    { icon: "fa-user-doctor", label: "Medical Team", page: null },
  ],
  patient: [
    { icon: "fa-chart-line", label: "Dashboard", page: "user-dashboard" },
    { icon: "fa-stethoscope", label: "New Prediction", page: "prediction" },
    { icon: "fa-clock-rotate-left", label: "History", page: null },
    { icon: "fa-user", label: "Profile", page: null },
    { icon: "fa-gear", label: "Settings", page: null },
  ],
};
