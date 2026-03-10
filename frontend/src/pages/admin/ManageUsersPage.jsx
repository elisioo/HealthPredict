import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { adminApi } from "../../api/authApi";
import ConfirmModal from "../../components/ConfirmModal";
import { useToast } from "../../context/ToastContext";

const ROLE_BADGE = {
  admin: "bg-purple-100 text-purple-800",
  staff: "bg-blue-100 text-blue-800",
  health_user: "bg-green-100 text-green-800",
};
const ROLE_LABEL = {
  admin: "Admin",
  staff: "Staff",
  health_user: "Health User",
};
const ROLE_OPTIONS = ["admin", "staff", "health_user"];
const STATUS_FILTERS = ["all", "active", "inactive", "locked"];

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtLockCountdown(lockedUntilIso) {
  if (!lockedUntilIso) return null;
  const secs = Math.max(
    0,
    Math.ceil((new Date(lockedUntilIso) - Date.now()) / 1000),
  );
  if (secs <= 0) return null;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/* ------------------------------------------------------------------ */
/* Main Page                                                            */
/* ------------------------------------------------------------------ */
export default function ManageUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [, setTick] = useState(0); // force re-render for countdown

  // Tick every second to refresh lockout countdowns
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Action confirm modal state
  const [modal, setModal] = useState(null); // { type, user }
  const [modalLoading, setModalLoading] = useState(false);

  // Role-change pending state (confirm before applying)
  const [pendingRole, setPendingRole] = useState(null); // { user, newRole }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const [usersRes, statsRes] = await Promise.all([
        adminApi.getUsers(params),
        adminApi.getStats(),
      ]);
      setUsers(usersRes.data.users);
      setStats(statsRes.data);
    } catch {
      showToast("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  /* Action handlers */
  const handleActivate = async () => {
    setModalLoading(true);
    try {
      await adminApi.activateUser(modal.user.user_id);
      showToast(`${modal.user.full_name} has been activated.`, "success");
      setModal(null);
      load();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to activate user.",
        "error",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setModalLoading(true);
    try {
      await adminApi.deactivateUser(modal.user.user_id);
      showToast(`${modal.user.full_name} has been deactivated.`, "success");
      setModal(null);
      load();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to deactivate user.",
        "error",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    setModalLoading(true);
    try {
      await adminApi.scheduleDelete(modal.user.user_id);
      showToast(
        `${modal.user.full_name} scheduled for permanent deletion in 1 minute. Activate to cancel.`,
        "warning",
        6000,
      );
      setModal(null);
      load();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to schedule deletion.",
        "error",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleUnlock = async () => {
    setModalLoading(true);
    try {
      await adminApi.unlockUser(modal.user.user_id);
      showToast(
        `${modal.user.full_name}'s account has been unlocked.`,
        "success",
      );
      setModal(null);
      load();
    } catch (err) {
      showToast(
        err.response?.data?.error || "Failed to unlock account.",
        "error",
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!pendingRole) return;
    try {
      await adminApi.changeRole(pendingRole.user.user_id, pendingRole.newRole);
      showToast(
        `Role updated to ${pendingRole.newRole.replace("_", " ")}.`,
        "success",
      );
      setPendingRole(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to change role.", "error");
    }
  };

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.admin}
      title="Manage Users"
      subtitle="View, manage, and monitor all system accounts"
      brandTitle="Glucogu"
    >
      <div className="p-4 sm:p-8">
        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {[
              {
                label: "Total Users",
                value: stats.users.total,
                color: "text-slate-800",
                bg: "bg-white",
              },
              {
                label: "Patients",
                value: stats.users.patients,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                label: "Staff",
                value: stats.users.staff,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Inactive",
                value: stats.users.inactive,
                color: "text-red-500",
                bg: "bg-red-50",
              },
              {
                label: "Locked Now",
                value: stats.users.locked ?? 0,
                color: "text-orange-600",
                bg: "bg-orange-50",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} rounded-2xl border border-slate-200 p-4 text-center`}
              >
                <div className={`text-2xl font-extrabold ${s.color}`}>
                  {s.value}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Alerts */}
        {/* (Replaced with floating toasts — no inline banners needed) */}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  statusFilter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <i className="fa fa-circle-notch fa-spin text-3xl mb-3" />
            <p className="text-sm">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <i className="fa fa-users text-3xl mb-3" />
            <p className="text-sm">No users found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "User",
                      "Email",
                      "Role",
                      "Status",
                      "Joined",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.user_id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {(u.full_name ?? "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-slate-800">
                            {u.full_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600">
                        {u.email}
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            setPendingRole({ user: u, newRole: e.target.value })
                          }
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${ROLE_BADGE[u.role]}`}
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABEL[r]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium w-fit ${
                              u.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                          {u.locked_until &&
                            new Date(u.locked_until) > new Date() && (
                              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 w-fit">
                                <i className="fa fa-lock text-[10px]" />
                                Locked {fmtLockCountdown(u.locked_until)}
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 flex-wrap">
                          {u.locked_until &&
                          new Date(u.locked_until) > new Date() ? (
                            <button
                              onClick={() =>
                                setModal({ type: "unlock", user: u })
                              }
                              className="text-xs text-orange-600 hover:text-orange-800 border border-orange-200 rounded-lg px-2.5 py-1 hover:bg-orange-50 transition-colors"
                            >
                              <i className="fa fa-unlock mr-1" />
                              Unlock
                            </button>
                          ) : null}
                          {u.is_active ? (
                            <button
                              onClick={() =>
                                setModal({ type: "deactivate", user: u })
                              }
                              className="text-xs text-yellow-600 hover:text-yellow-800 border border-yellow-200 rounded-lg px-2.5 py-1 hover:bg-yellow-50 transition-colors"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setModal({ type: "activate", user: u })
                              }
                              className="text-xs text-green-600 hover:text-green-800 border border-green-200 rounded-lg px-2.5 py-1 hover:bg-green-50 transition-colors"
                            >
                              Activate
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setModal({ type: "delete", user: u })
                            }
                            className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2.5 py-1 hover:bg-red-50 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal?.type === "deactivate" && (
        <ConfirmModal
          title="Deactivate User"
          message={`Are you sure you want to deactivate ${modal.user.full_name}? They will be unable to log in.`}
          confirmLabel="Deactivate"
          danger
          loading={modalLoading}
          onConfirm={handleDeactivate}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "activate" && (
        <ConfirmModal
          title="Activate User"
          message={`Re-activate ${modal.user.full_name}? This will also cancel any pending deletion.`}
          confirmLabel="Activate"
          loading={modalLoading}
          onConfirm={handleActivate}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "unlock" && (
        <ConfirmModal
          title="Unlock Account"
          message={`Immediately unlock ${modal.user.full_name}'s account? Their failed login counter will be reset.`}
          confirmLabel="Unlock Now"
          loading={modalLoading}
          onConfirm={handleUnlock}
          onCancel={() => setModal(null)}
        />
      )}
      {modal?.type === "delete" && (
        <ConfirmModal
          title="Permanently Delete User"
          message={`${modal.user.full_name} and ALL their data will be permanently deleted in 1 minute. You can cancel by activating the user before the timer expires.`}
          confirmLabel="Delete Permanently"
          danger
          loading={modalLoading}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
        />
      )}
      {pendingRole && (
        <ConfirmModal
          title="Change User Role"
          message={`Change ${pendingRole.user.full_name}'s role to "${pendingRole.newRole.replace("_", " ")}"?`}
          confirmLabel="Change Role"
          onConfirm={handleRoleChange}
          onCancel={() => setPendingRole(null)}
        />
      )}
    </DashboardLayout>
  );
}
