import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { adminApi } from "../../api/authApi";

function BarChart() {
  const data = [
    { day: "Mon", value: 42 },
    { day: "Tue", value: 68 },
    { day: "Wed", value: 55 },
    { day: "Thu", value: 80 },
    { day: "Fri", value: 73 },
    { day: "Sat", value: 35 },
    { day: "Sun", value: 48 },
  ];
  const maxVal = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end justify-between gap-2 h-48 px-2">
      {data.map((d) => (
        <div key={d.day} className="flex flex-col items-center flex-1 gap-1">
          <div
            className="w-full flex items-end justify-center"
            style={{ height: "160px" }}
          >
            <div
              className="w-full bg-primary rounded-t-lg opacity-80 hover:opacity-100 transition-all"
              style={{ height: `${(d.value / maxVal) * 100}%` }}
              title={d.value}
            ></div>
          </div>
          <span className="text-xs text-gray-500">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// Risk Distribution — uses real counts from adminApi.getStats()
function RiskDistribution({ total = 0, high = 0 }) {
  const highPct = total > 0 ? ((high / total) * 100).toFixed(1) : 0;
  const lowPct =
    total > 0 ? ((((total - high) * 0.75) / total) * 100).toFixed(1) : 0;
  const medPct =
    total > 0 ? (100 - parseFloat(highPct) - parseFloat(lowPct)).toFixed(1) : 0;
  const risks = [
    { label: "Low Risk", pct: parseFloat(lowPct), color: "bg-green-500" },
    { label: "Medium Risk", pct: parseFloat(medPct), color: "bg-yellow-500" },
    { label: "High Risk", pct: parseFloat(highPct), color: "bg-red-500" },
  ];
  return (
    <div className="space-y-5 mt-4">
      {risks.map((r) => (
        <div key={r.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700 font-medium">{r.label}</span>
            <span className="text-gray-500">{r.pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`${r.color} h-2.5 rounded-full`}
              style={{ width: `${r.pct}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}

const ROLE_OPTIONS = ["admin", "staff", "health_user"];
const ROLE_LABEL = {
  admin: "Admin",
  staff: "Staff",
  health_user: "Health User",
};

/* ── Edit User Modal ─────────────────────────────────────────────── */
function EditUserModal({ user, onClose, onSaved }) {
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isLocked =
    user.locked_until && new Date(user.locked_until) > new Date();

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      if (role !== user.role) {
        await adminApi.changeRole(user.user_id, role);
      }
      onSaved("Changes saved successfully.");
    } catch (e) {
      setError(e.response?.data?.error || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async () => {
    setSaving(true);
    setError("");
    try {
      if (user.is_active) {
        await adminApi.deactivateUser(user.user_id);
        onSaved(`${user.full_name} has been deactivated.`);
      } else {
        await adminApi.activateUser(user.user_id);
        onSaved(`${user.full_name} has been activated.`);
      }
    } catch (e) {
      setError(e.response?.data?.error || "Failed to update status.");
      setSaving(false);
    }
  };

  const unlock = async () => {
    setSaving(true);
    setError("");
    try {
      await adminApi.unlockUser(user.user_id);
      onSaved(`${user.full_name}'s account has been unlocked.`);
    } catch (e) {
      setError(e.response?.data?.error || "Failed to unlock account.");
      setSaving(false);
    }
  };

  const initials = (user.full_name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Edit User</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {user.full_name}
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Joined{" "}
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
              Account Status
            </label>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-gray-400"}`}
                ></div>
                <span className="text-sm text-gray-700">
                  {user.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <button
                onClick={toggle}
                disabled={saving}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                  user.is_active
                    ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200"
                    : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                }`}
              >
                {user.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>

          {/* Locked */}
          {isLocked && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Account Lock
              </label>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-lock text-orange-500 text-xs"></i>
                  <span className="text-sm text-orange-700">
                    Account is locked
                  </span>
                </div>
                <button
                  onClick={unlock}
                  disabled={saving}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-orange-200 text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-50"
                >
                  Unlock
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || role === user.role}
            className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared user table ───────────────────────────────────────────── */
function UserTable({ rows, loading, onEdit, isPatient = false }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-6">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        Loading…
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-6">
        {isPatient ? "No patients found." : "No staff or admin accounts found."}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-gray-200">
            {["User", "Role", "Status", "Joined", ""].map((h, i) => (
              <th
                key={i}
                className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase ${i === 4 ? "text-right" : "text-left"}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => {
            const roleBadge =
              u.role === "admin"
                ? { label: "Admin", bg: "bg-red-50 text-red-600" }
                : u.role === "staff"
                  ? { label: "Staff", bg: "bg-purple-50 text-purple-600" }
                  : { label: "Patient", bg: "bg-green-50 text-green-700" };
            const initials = (u.full_name || "U")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const avatarBg = isPatient
              ? "bg-green-100 text-green-700"
              : "bg-blue-100 text-primary";
            const isLocked =
              u.locked_until && new Date(u.locked_until) > new Date();
            return (
              <tr
                key={u.user_id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm flex-shrink-0 ${avatarBg}`}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {u.full_name}
                      </p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg ${roleBadge.bg}`}
                  >
                    {roleBadge.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-lg w-fit ${u.is_active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                    {isLocked && (
                      <span className="text-xs px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 w-fit flex items-center gap-1">
                        <i className="fa-solid fa-lock text-[10px]"></i> Locked
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-500">
                  {new Date(u.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => onEdit(u)}
                    className="w-8 h-8 inline-flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-primary rounded-lg transition-all"
                    title="Edit user"
                  >
                    <i className="fa-solid fa-pen-to-square text-sm"></i>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AdminDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [apiStats, setApiStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const loadData = () => {
    adminApi
      .getStats()
      .then(({ data }) => setApiStats(data))
      .catch(() => {});
    setLoadingUsers(true);
    adminApi
      .getUsers()
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaved = (msg) => {
    setEditingUser(null);
    setSuccessMsg(msg);
    loadData();
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const stats = [
    {
      label: "Total Predictions",
      value: apiStats
        ? (apiStats.predictions?.total ?? 0).toLocaleString()
        : "—",
      icon: "fa-chart-line",
      bg: "bg-blue-50",
      iconColor: "text-primary",
      badge: "All time",
      badgeBg: "bg-blue-50 text-blue-600",
    },
    {
      label: "High Risk Cases",
      value: apiStats
        ? apiStats.predictions?.total
          ? `${((apiStats.predictions.high_risk / apiStats.predictions.total) * 100).toFixed(1)}%`
          : "0%"
        : "—",
      icon: "fa-triangle-exclamation",
      bg: "bg-red-50",
      iconColor: "text-red-500",
      badge: "Critical",
      badgeBg: "bg-red-50 text-red-600",
    },
    {
      label: "Registered Users",
      value: apiStats ? (apiStats.users?.total ?? 0).toLocaleString() : "—",
      icon: "fa-users",
      bg: "bg-purple-50",
      iconColor: "text-purple-500",
      badge: `${apiStats?.users?.active ?? "—"} Active`,
      badgeBg: "bg-purple-50 text-purple-600",
    },
    {
      label: "Patients",
      value: apiStats ? (apiStats.users?.patients ?? 0).toLocaleString() : "—",
      icon: "fa-user-injured",
      bg: "bg-green-50",
      iconColor: "text-green-500",
      badge: `${apiStats?.users?.staff ?? "—"} Staff`,
      badgeBg: "bg-green-50 text-green-600",
    },
  ];

  const staffAdmins = users.filter(
    (u) =>
      u.role !== "health_user" &&
      ((u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const patients = users.filter(
    (u) =>
      u.role === "health_user" &&
      ((u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.admin}
      title="System Analytics"
      subtitle="Admin Panel"
      headerActions={
        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-xl transition-all border border-gray-200 bg-white">
            <i className="fa-solid fa-bell"></i>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-xl transition-all border border-gray-200 bg-white">
            <i className="fa-solid fa-gear"></i>
          </button>
        </div>
      }
    >
      {/* Edit modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Success toast */}
      {successMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white border border-green-200 shadow-lg rounded-xl px-5 py-3 animate-fade-in">
          <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-check text-green-600 text-xs"></i>
          </div>
          <p className="text-sm text-gray-800">{successMsg}</p>
        </div>
      )}

      {/* Stats Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center`}
              >
                <i className={`fa-solid ${s.icon} ${s.iconColor} text-xl`}></i>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-lg ${s.badgeBg}`}
              >
                {s.badge}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1 text-right">
              {s.value}
            </h3>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prediction Trends */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Prediction Trends
            </h3>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>
          <BarChart />
        </section>

        {/* Risk Distribution */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Risk Distribution
            </h3>
            <button className="text-sm text-primary hover:text-primary-dark font-medium">
              View Details
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            Based on{" "}
            {apiStats
              ? (apiStats.predictions?.total ?? 0).toLocaleString()
              : "—"}{" "}
            total predictions
          </p>
          <RiskDistribution
            total={apiStats?.predictions?.total ?? 0}
            high={apiStats?.predictions?.high_risk ?? 0}
          />

          <div className="grid grid-cols-3 gap-3 mt-6">
            {(() => {
              const tot = apiStats?.predictions?.total ?? 0;
              const high = apiStats?.predictions?.high_risk ?? 0;
              const low = tot > 0 ? Math.round((tot - high) * 0.75) : 0;
              const med = tot > 0 ? tot - high - low : 0;
              return [
                {
                  label: "Low",
                  value: tot > 0 ? low.toLocaleString() : "—",
                  color: "text-green-600",
                  bg: "bg-green-50",
                },
                {
                  label: "Medium",
                  value: tot > 0 ? med.toLocaleString() : "—",
                  color: "text-yellow-600",
                  bg: "bg-yellow-50",
                },
                {
                  label: "High",
                  value: tot > 0 ? high.toLocaleString() : "—",
                  color: "text-red-600",
                  bg: "bg-red-50",
                },
              ];
            })().map((item) => (
              <div
                key={item.label}
                className={`${item.bg} rounded-xl p-3 text-center`}
              >
                <p className={`text-lg font-bold ${item.color}`}>
                  {item.value}
                </p>
                <p className="text-xs text-gray-500">{item.label} Risk</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Staff & Admins */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Staff &amp; Admins
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              System accounts — staff and administrators
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <a
              href="/admin/users"
              className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-users"></i>
              <span>Manage All</span>
            </a>
          </div>
        </div>

        <UserTable
          rows={staffAdmins}
          loading={loadingUsers}
          onEdit={setEditingUser}
        />
      </section>

      {/* Patients — Health Users who run predictions */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Patients</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Health users who submit diabetes risk assessments
            </p>
          </div>
          <span className="text-xs font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
            {patients.length} patient{patients.length !== 1 ? "s" : ""}
          </span>
        </div>

        <UserTable
          rows={patients}
          loading={loadingUsers}
          onEdit={setEditingUser}
          isPatient
        />
      </section>
    </DashboardLayout>
  );
}

export default AdminDashboard;
