import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { appointmentApi } from "../../api/authApi";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const STATUS_STYLE = {
  pending: { badge: "bg-yellow-100 text-yellow-700", label: "Pending" },
  approved: { badge: "bg-blue-100 text-blue-700", label: "Approved" },
  completed: { badge: "bg-green-100 text-green-700", label: "Completed" },
  cancelled: { badge: "bg-red-100 text-red-700", label: "Cancelled" },
};

const FILTERS = ["all", "pending", "approved", "completed", "cancelled"];

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/* Status Update Dropdown                                               */
/* ------------------------------------------------------------------ */
function StatusDropdown({ appt, onUpdate }) {
  const [updating, setUpdating] = useState(false);

  const options =
    appt.status === "pending"
      ? ["approved", "cancelled"]
      : appt.status === "approved"
        ? ["completed", "cancelled"]
        : [];

  if (options.length === 0) {
    const s = STATUS_STYLE[appt.status] ?? STATUS_STYLE.pending;
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.badge}`}>
        {s.label}
      </span>
    );
  }

  const handleChange = async (e) => {
    const newStatus = e.target.value;
    if (!newStatus) return;
    setUpdating(true);
    try {
      await appointmentApi.updateStatus(appt.appointment_id, newStatus);
      onUpdate();
    } catch {
      // error handled by parent refresh
    } finally {
      setUpdating(false);
    }
  };

  return (
    <select
      defaultValue=""
      onChange={handleChange}
      disabled={updating}
      className="text-xs border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
    >
      <option value="" disabled>
        {STATUS_STYLE[appt.status]?.label ?? appt.status}
      </option>
      {options.map((o) => (
        <option key={o} value={o}>
          Mark as {STATUS_STYLE[o]?.label ?? o}
        </option>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                            */
/* ------------------------------------------------------------------ */
export default function StaffAppointmentsPage() {
  const { user } = useAuth();
  const navItems =
    user?.role === "admin" ? NAV_BY_ROLE.admin : NAV_BY_ROLE.staff;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res =
        user?.role === "admin"
          ? await appointmentApi.getAllAppointments()
          : await appointmentApi.getStaffAppointments();
      setAppointments(res.data.appointments);
    } catch {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = appointments.filter((a) => {
    const matchStatus = filter === "all" || a.status === filter;
    const query = search.toLowerCase();
    const matchSearch =
      !query ||
      (a.patient_name ?? "").toLowerCase().includes(query) ||
      (a.staff_name ?? "").toLowerCase().includes(query) ||
      (a.notes ?? "").toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });

  const counts = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <DashboardLayout
      navItems={navItems}
      title="Appointments"
      subtitle="Manage patient consultation schedules"
      brandTitle="Glucogu"
    >
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            {user?.role === "admin"
              ? "All Appointments"
              : "My Assigned Appointments"}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review and update patient appointment statuses
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Pending",
              key: "pending",
              color: "text-yellow-600",
              bg: "bg-yellow-50",
            },
            {
              label: "Approved",
              key: "approved",
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Completed",
              key: "completed",
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              label: "Cancelled",
              key: "cancelled",
              color: "text-red-500",
              bg: "bg-red-50",
            },
          ].map(({ label, key, color, bg }) => (
            <div
              key={key}
              className={`${bg} rounded-2xl p-4 flex flex-col items-center`}
            >
              <span className={`text-2xl font-extrabold ${color}`}>
                {counts[key] ?? 0}
              </span>
              <span className="text-xs text-slate-500 mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or notes..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Alert */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Table / List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <i className="fa fa-circle-notch fa-spin text-3xl mb-3" />
            <p className="text-sm">Loading appointments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <i className="fa fa-calendar-check text-2xl text-blue-400" />
            </div>
            <p className="text-slate-600 font-semibold mb-1">
              No appointments found
            </p>
            <p className="text-slate-400 text-sm">
              {filter !== "all"
                ? `No ${filter} appointments.`
                : "No appointments have been scheduled yet."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="hidden sm:grid grid-cols-[2fr_2fr_2fr_1.5fr_1.5fr] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span>Patient</span>
              {user?.role === "admin" && <span>Staff</span>}
              {user?.role !== "admin" && <span>Date & Time</span>}
              {user?.role === "admin" && <span>Date & Time</span>}
              <span>Notes</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-slate-100">
              {filtered.map((appt) => (
                <div
                  key={appt.appointment_id}
                  className="px-4 sm:px-6 py-4 flex flex-col sm:grid sm:grid-cols-[2fr_2fr_2fr_1.5fr_1.5fr] gap-3 sm:gap-4 items-start sm:items-center"
                >
                  {/* Patient */}
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {(appt.patient_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {appt.patient_name ?? "—"}
                      </span>
                    </div>
                  </div>

                  {/* Staff name (admin only) */}
                  {user?.role === "admin" && (
                    <div className="text-sm text-slate-600">
                      {appt.staff_name ?? "—"}
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-sm text-slate-600">
                    {formatDateTime(appt.appointment_date)}
                  </div>

                  {/* Notes */}
                  <div className="text-xs text-slate-400 truncate max-w-xs">
                    {appt.notes || "—"}
                  </div>

                  {/* Status / Action */}
                  <div>
                    <StatusDropdown appt={appt} onUpdate={load} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
