import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { NAV_BY_ROLE } from "../components/navConfig";

const MOCK_USERS = [
  {
    id: 1,
    name: "John Doe",
    email: "john@glucogu.com",
    role: "health_user",
    status: "Active",
    joined: "Jan 12, 2026",
  },
  {
    id: 2,
    name: "Dr. Sarah Cole",
    email: "sarah@glucogu.com",
    role: "staff",
    status: "Active",
    joined: "Feb 3, 2026",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily@glucogu.com",
    role: "health_user",
    status: "Inactive",
    joined: "Dec 8, 2025",
  },
  {
    id: 4,
    name: "Michael Chen",
    email: "michael@glucogu.com",
    role: "staff",
    status: "Active",
    joined: "Mar 1, 2026",
  },
];

const roleBadge = {
  admin: "bg-purple-100 text-purple-800",
  staff: "bg-blue-100 text-blue-800",
  health_user: "bg-green-100 text-green-800",
};

const roleLabel = {
  admin: "Admin",
  staff: "Staff",
  health_user: "Health User",
};

export default function ManageUsersPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.admin}
      title="Manage Users"
      subtitle="View and manage all accounts"
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  {["Name", "Email", "Role", "Status", "Joined", "Actions"].map(
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
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {u.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {u.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleBadge[u.role]}`}
                      >
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {u.joined}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-primary hover:text-primary-dark font-medium mr-3">
                        Edit
                      </button>
                      <button className="text-red-500 hover:text-red-700 font-medium">
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
