import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { adminApi } from "../../api/authApi";

const TYPE_BADGE = {
  activate_user: "bg-green-100 text-green-700",
  deactivate_user: "bg-yellow-100 text-yellow-700",
  schedule_delete: "bg-red-100 text-red-700",
  change_role: "bg-purple-100 text-purple-700",
  login: "bg-blue-100 text-blue-700",
  register: "bg-indigo-100 text-indigo-700",
  prediction: "bg-teal-100 text-teal-700",
};
const DEFAULT_BADGE = "bg-gray-100 text-gray-700";

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

export default function SystemLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (typeFilter) params.type = typeFilter;
      const res = await adminApi.getLogs(params);
      setLogs(res.data.logs);
    } catch {
      setError("Failed to load system logs.");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // Derive unique action types for the filter
  const actionTypes = [...new Set(logs.map((l) => l.action_type))].filter(
    Boolean,
  );

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.admin}
      title="System Logs"
      subtitle="Audit trail and activity monitoring"
      brandTitle="Glucogu"
    >
      <div className="p-4 sm:p-8">
        {/* Header stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">System Logs</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {logs.length} log entries
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search logs..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {actionTypes.map((t) => (
              <option key={t} value={t}>
                {t.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <i className="fa fa-circle-notch fa-spin text-3xl mb-3" />
            <p className="text-sm">Loading logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <i className="fa fa-file-lines text-3xl mb-3" />
            <p className="text-sm">No log entries found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "User",
                      "Description",
                      "Type",
                      "IP Address",
                      "Timestamp",
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
                  {logs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 text-sm font-medium text-slate-800">
                        {log.user_name ?? "System"}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-600 max-w-xs truncate">
                        {log.description}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            TYPE_BADGE[log.action_type] ?? DEFAULT_BADGE
                          }`}
                        >
                          {(log.action_type ?? "unknown").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500 font-mono">
                        {log.ip_address}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">
                        {formatDateTime(log.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
