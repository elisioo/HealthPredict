import React from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";

const MOCK_LOGS = [
  {
    id: 1,
    user: "Admin",
    action: "User Login",
    ip: "192.168.1.10",
    time: "Mar 8, 2026 09:42 AM",
    type: "auth",
  },
  {
    id: 2,
    user: "Dr. Sarah Cole",
    action: "Created Prediction",
    ip: "192.168.1.15",
    time: "Mar 8, 2026 09:38 AM",
    type: "prediction",
  },
  {
    id: 3,
    user: "System",
    action: "Backup Completed",
    ip: "127.0.0.1",
    time: "Mar 8, 2026 03:00 AM",
    type: "system",
  },
  {
    id: 4,
    user: "John Doe",
    action: "Updated Profile",
    ip: "192.168.1.22",
    time: "Mar 7, 2026 04:15 PM",
    type: "profile",
  },
  {
    id: 5,
    user: "Admin",
    action: "Deactivated User",
    ip: "192.168.1.10",
    time: "Mar 7, 2026 02:30 PM",
    type: "admin",
  },
];

const typeBadge = {
  auth: "bg-blue-100 text-blue-800",
  prediction: "bg-green-100 text-green-800",
  system: "bg-gray-100 text-gray-800",
  profile: "bg-yellow-100 text-yellow-800",
  admin: "bg-purple-100 text-purple-800",
};

export default function SystemLogsPage() {
  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.admin}
      title="System Logs"
      subtitle="Audit trail and activity monitoring"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                {["User", "Action", "Type", "IP Address", "Timestamp"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.action}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${typeBadge[log.type]}`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                    {log.ip}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
