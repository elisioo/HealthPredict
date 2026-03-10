// Shared navigation definitions by role.
// `page` is now a URL path so Sidebar can call navigate(page) directly.
export const NAV_BY_ROLE = {
  admin: [
    { icon: "fa-chart-line", label: "Dashboard", page: "/admin" },
    { icon: "fa-users", label: "Manage Users", page: "/admin/users" },
    {
      icon: "fa-wave-square",
      label: "Activity Monitor",
      page: "/admin/activity",
    },
    {
      icon: "fa-stethoscope",
      label: "Predictions",
      page: "/admin/predictions",
    },
    { icon: "fa-chart-pie", label: "Reports", page: "/admin/reports" },
    { icon: "fa-brain", label: "ML Model", page: "/admin/ml-model" },
    { icon: "fa-file-lines", label: "System Logs", page: "/admin/logs" },
    {
      icon: "fa-calendar-check",
      label: "Appointments",
      page: "/staff/appointments",
    },
    {
      icon: "fa-envelope-open-text",
      label: "Messages",
      page: "/admin/messages",
    },
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
      icon: "fa-calendar-check",
      label: "Appointments",
      page: "/staff/appointments",
    },
    {
      icon: "fa-chart-pie",
      label: "Analytics Reports",
      page: "/admin/reports",
    },
    { icon: "fa-user-doctor", label: "Medical Team", page: "/staff/team" },
    { icon: "fa-message", label: "Messages", page: "/messages" },
    { icon: "fa-gear", label: "Settings", page: "/settings" },
  ],
  patient: [
    { icon: "fa-chart-line", label: "Dashboard", page: "/dashboard" },
    { icon: "fa-stethoscope", label: "New Prediction", page: "/prediction" },
    { icon: "fa-clock-rotate-left", label: "History", page: "/history" },
    { icon: "fa-calendar-check", label: "Appointments", page: "/appointments" },
    { icon: "fa-message", label: "Messages", page: "/messages" },
    { icon: "fa-user", label: "Profile", page: "/profile" },
    { icon: "fa-gear", label: "Settings", page: "/settings" },
  ],
};
