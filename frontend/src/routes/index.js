/**
 * HealthPredict — Central Route Registry
 *
 * Mirrors how Laravel defines named routes in routes/web.php.
 * Every URL in the app is declared here — import ROUTES or
 * route() anywhere to navigate without hardcoding strings.
 *
 * Access levels:
 *   public      — accessible without authentication
 *   guest       — redirect away if already logged in (login/register)
 *   protected   — requires authentication + optional role check
 */

export const ROUTES = {
  // ── Public ────────────────────────────────────────────────────────
  landing: { path: "/", name: "landing" },

  // ── Guest-only (redirects authed users to their dashboard) ───────
  login: { path: "/login", name: "login" },
  register: { path: "/register", name: "register" },
  forgotPassword: { path: "/forgot-password", name: "forgot-password" },

  // ── Authenticated — Health User ───────────────────────────────────
  userDashboard: { path: "/dashboard", name: "user-dashboard" },

  // ── Authenticated — Staff + Admin ─────────────────────────────────
  staffDashboard: { path: "/staff", name: "staff-dashboard" },
  patientRecords: { path: "/staff/patients", name: "patient-records" },

  // ── Authenticated — Admin only ────────────────────────────────────
  adminDashboard: { path: "/admin", name: "admin-dashboard" },
  manageUsers: { path: "/admin/users", name: "manage-users" },
  mlModel: { path: "/admin/ml-model", name: "ml-model" },
  systemLogs: { path: "/admin/logs", name: "system-logs" },
  reports: { path: "/admin/reports", name: "reports" },
  activityMonitor: { path: "/admin/activity", name: "activity-monitor" },
  predictionsReport: { path: "/admin/predictions", name: "predictions-report" },
  adminMessages: { path: "/admin/messages", name: "admin-messages" },

  // ── Authenticated — Staff + Admin ─────────────────────────────────
  medicalTeam: { path: "/staff/team", name: "medical-team" },

  // ── Authenticated — Health User ───────────────────────────────────
  history: { path: "/history", name: "history" },
  profile: { path: "/profile", name: "profile" },
  settings: { path: "/settings", name: "settings" },

  // ── Authenticated — All roles ─────────────────────────────────────
  messages: { path: "/messages", name: "messages" },
  prediction: { path: "/prediction", name: "prediction" },
  result: { path: "/result", name: "result" },

  // ── Authenticated — Appointments ──────────────────────────────────
  appointments: { path: "/appointments", name: "appointments" },
  staffAppointments: {
    path: "/staff/appointments",
    name: "staff-appointments",
  },
};

/**
 * role → home dashboard path
 * Used after login/register to redirect the user to the right place.
 */
export const ROLE_HOME = {
  admin: ROUTES.adminDashboard.path,
  staff: ROUTES.staffDashboard.path,
  health_user: ROUTES.userDashboard.path,
};

/**
 * route(name) — returns the path for a named route.
 *
 * Usage:  navigate(route("prediction"))
 *         <Link to={route("login")}>Sign in</Link>
 */
export function route(name) {
  const entry = Object.values(ROUTES).find((r) => r.name === name);
  if (!entry) {
    console.warn(`[routes] Unknown route name: "${name}"`);
    return "/";
  }
  return entry.path;
}

export default ROUTES;
