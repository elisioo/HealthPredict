import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { NAV_BY_ROLE } from "../components/navConfig";

const TEAM = [
  {
    name: "Dr. Sarah Cole",
    role: "Endocrinologist",
    email: "sarah@glucogu.com",
    status: "Available",
  },
  {
    name: "Dr. Michael Chen",
    role: "General Practitioner",
    email: "michael@glucogu.com",
    status: "Available",
  },
  {
    name: "Dr. Lisa Anderson",
    role: "Diabetologist",
    email: "lisa@glucogu.com",
    status: "On Leave",
  },
];

export default function MedicalTeamPage() {
  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.staff}
      title="Medical Team"
      subtitle="Healthcare staff directory"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEAM.map((m) => (
          <div
            key={m.name}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                {m.name[0]}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{m.name}</h3>
                <p className="text-sm text-gray-500">{m.role}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">{m.email}</p>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.status === "Available" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
            >
              {m.status}
            </span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
