import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { NAV_BY_ROLE } from "../components/navConfig";
import { useAuth } from "../context/AuthContext";

export default function HistoryPage() {
  const { user } = useAuth();

  const MOCK_HISTORY = [
    {
      date: "Mar 7, 2026",
      risk: "High Risk",
      probability: "78%",
      riskCls: "bg-red-100 text-red-800",
      probCls: "text-red-600",
    },
    {
      date: "Feb 20, 2026",
      risk: "Moderate",
      probability: "45%",
      riskCls: "bg-yellow-100 text-yellow-800",
      probCls: "text-yellow-600",
    },
    {
      date: "Jan 15, 2026",
      risk: "Low Risk",
      probability: "18%",
      riskCls: "bg-green-100 text-green-800",
      probCls: "text-green-600",
    },
  ];

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.patient}
      title="Prediction History"
      subtitle="Your past assessments"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Risk Level", "Probability"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {MOCK_HISTORY.map((h, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{h.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${h.riskCls}`}
                    >
                      {h.risk}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 text-sm font-semibold ${h.probCls}`}
                  >
                    {h.probability}
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
