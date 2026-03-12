import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { adminApi } from "../../api/authApi";

const ACTION_ICON = {
  activate_user: {
    icon: "fa-user-check",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  deactivate_user: {
    icon: "fa-user-xmark",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
  schedule_delete: { icon: "fa-trash", color: "text-red-500", bg: "bg-red-50" },
  change_role: {
    icon: "fa-user-pen",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  login: {
    icon: "fa-right-to-bracket",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  register: {
    icon: "fa-user-plus",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  prediction: {
    icon: "fa-stethoscope",
    color: "text-teal-500",
    bg: "bg-teal-50",
  },
  logout: {
    icon: "fa-right-from-bracket",
    color: "text-slate-500",
    bg: "bg-slate-100",
  },
};
const DEFAULT_ICON = {
  icon: "fa-circle-info",
  color: "text-slate-500",
  bg: "bg-slate-100",
};

const ROLE_COLOR = {
  admin: "text-purple-600",
  staff: "text-blue-600",
  health_user: "text-green-600",
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityMonitorPage() {
  const [activity, setActivity] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [actRes, statsRes] = await Promise.all([
        adminApi.getActivity(),
        adminApi.getStats(),
      ]);
      setActivity(actRes.data.activity);
      setStats(statsRes.data);
    } catch {
      setError("Failed to load activity data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15_000); // refresh every 15s
    return () => clearInterval(interval);
  }, [load]);

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.admin}
      title="Activity Monitor"
      subtitle="Real-time system activity and status overview"
      brandTitle="Glucogu"
    >
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Activity Monitor
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Live feed — auto-refreshes every 15 seconds
            </p>
          </div>
          <button
            onClick={load}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <i className="fa fa-rotate-right" />
            Refresh
          </button>
        </div>

        {/* Overview Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Active Users",
                value: stats.users.active,
                icon: "fa-users",
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                label: "Inactive",
                value: stats.users.inactive,
                icon: "fa-user-slash",
                color: "text-red-500",
                bg: "bg-red-50",
              },
              {
                label: "Total Predictions",
                value: stats.predictions.total,
                icon: "fa-chart-line",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "High Risk Cases",
                value: stats.predictions.high_risk,
                icon: "fa-triangle-exclamation",
                color: "text-yellow-600",
                bg: "bg-yellow-50",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} rounded-2xl border border-slate-200 p-4 flex items-center gap-3`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}
                >
                  <i className={`fa ${s.icon} ${s.color} text-lg`} />
                </div>
                <div>
                  <div className={`text-xl font-extrabold ${s.color}`}>
                    {s.value ?? 0}
                  </div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Activity Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <i className="fa fa-circle-notch fa-spin text-3xl mb-3" />
            <p className="text-sm">Loading activity feed...</p>
          </div>
        ) : activity.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <i className="fa fa-wave-square text-3xl mb-3" />
            <p className="text-sm">No recent activity.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {activity.map((item) => {
              const style = ACTION_ICON[item.action_type] ?? DEFAULT_ICON;
              return (
                <div
                  key={item.log_id}
                  className="flex items-start gap-4 px-4 py-3 rounded-xl hover:bg-white transition-colors"
                >
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${style.bg}`}
                  >
                    <i className={`fa ${style.icon} ${style.color} text-sm`} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">
                        {item.user_name ?? "System"}
                      </span>
                      {item.user_role && (
                        <span
                          className={`ml-1.5 text-xs font-medium ${ROLE_COLOR[item.user_role] ?? "text-slate-500"}`}
                        >
                          ({item.user_role.replace("_", " ")})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                      <span>
                        <i className="fa fa-clock mr-1" />
                        {timeAgo(item.created_at)}
                      </span>
                      <span className="font-mono">{item.ip_address}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
