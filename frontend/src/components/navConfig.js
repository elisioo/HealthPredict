// Shared navigation definitions by role.
// `page` is now a URL path so Sidebar can call navigate(page) directly.
export const NAV_BY_ROLE = {
  admin: [
    { icon: "fa-chart-line", label: "Dashboard", page: "/admin" },
    { icon: "fa-users", label: "Manage Users", page: "/admin/users" },
    { icon: "fa-brain", label: "ML Model", page: "/admin/ml-model" },
    { icon: "fa-chart-pie", label: "Predictions", page: "/admin/reports" },
    { icon: "fa-file-lines", label: "System Logs", page: "/admin/logs" },
    { icon: "fa-message", label: "Messages", page: "/messages" },
  ],
  staff: [
    { icon: "fa-house", label: "Dashboard", page: "/staff" },
    { icon: "fa-plus-circle", label: "New Prediction", page: "/prediction" },
    {
      icon: "fa-folder-open",
      label: "Patient Records",
      page: "/staff/patients",
      badge: "12",
    },
    {
      icon: "fa-chart-pie",
      label: "Analytics Reports",
      page: "/admin/reports",
    },
    { icon: "fa-user-doctor", label: "Medical Team", page: "/staff/team" },
    { icon: "fa-message", label: "Messages", page: "/messages" },
  ],
  patient: [
    { icon: "fa-chart-line", label: "Dashboard", page: "/dashboard" },
    { icon: "fa-stethoscope", label: "New Prediction", page: "/prediction" },
    { icon: "fa-clock-rotate-left", label: "History", page: "/history" },
    { icon: "fa-message", label: "Messages", page: "/messages" },
    { icon: "fa-user", label: "Profile", page: "/profile" },
    { icon: "fa-gear", label: "Settings", page: "/settings" },
  ],
};
