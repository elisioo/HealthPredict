import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { predictionApi } from "../../api/authApi";

const riskStyle = {
  high: {
    label: "High Risk",
    cls: "bg-red-100 text-red-800",
    prob: "text-red-600",
  },
  moderate: {
    label: "Moderate Risk",
    cls: "bg-yellow-100 text-yellow-800",
    prob: "text-yellow-600",
  },
  low: {
    label: "Low Risk",
    cls: "bg-green-100 text-green-800",
    prob: "text-green-600",
  },
};

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    predictionApi
      .getHistory()
      .then(({ data }) => setHistory(data.predictions || []))
      .catch(() => setError("Failed to load prediction history."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.patient}
      title="Prediction History"
      subtitle="Your past diabetes risk assessments"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading history…</span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center justify-center py-16">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <i className="fa-solid fa-clock-rotate-left text-4xl"></i>
            <p className="text-sm">
              No predictions yet. Run your first assessment!
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && history.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Date",
                    "Risk Level",
                    "Probability",
                    "Diabetes Result",
                    "BMI",
                    "Blood Glucose",
                    "HbA1c",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((row) => {
                  const rs = riskStyle[row.risk_level] ?? riskStyle.low;
                  return (
                    <tr
                      key={row.prediction_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {fmt(row.created_at)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${rs.cls}`}
                        >
                          {rs.label}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-4 text-sm font-semibold whitespace-nowrap ${rs.prob}`}
                      >
                        {row.probability !== null ? `${row.probability}%` : "—"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {row.diabetes_result === 1 ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            Positive
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Negative
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {row.bmi ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {row.blood_glucose_level ?? "—"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {row.HbA1c_level ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
