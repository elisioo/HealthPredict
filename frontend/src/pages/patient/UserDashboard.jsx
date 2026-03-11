import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { predictionApi } from "../../api/authApi";

const RISK_STYLE = {
  high: {
    label: "High Risk",
    bg: "bg-red-100 text-red-800",
    dot: "bg-red-500",
  },
  moderate: {
    label: "Moderate Risk",
    bg: "bg-yellow-100 text-yellow-800",
    dot: "bg-yellow-500",
  },
  low: {
    label: "Low Risk",
    bg: "bg-green-100 text-green-800",
    dot: "bg-green-500",
  },
};

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Risk trend chart using real probability values
function TrendChart({ predictions }) {
  if (!predictions || predictions.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        Not enough data for a trend chart yet.
      </div>
    );
  }
  const pts = [...predictions].reverse().slice(-8); // oldest first, max 8
  const values = pts.map((p) => parseFloat(p.probability) || 0);
  const w = 300,
    h = 180,
    pad = 30;
  const max = Math.max(...values, 1);
  const x = (i) => pad + (i / (pts.length - 1)) * (w - pad * 2);
  const y = (v) => pad + (1 - v / max) * (h - pad * 2);
  const path = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`)
    .join(" ");
  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <path
          d={`${path} L${x(pts.length - 1)},${h - pad} L${x(0)},${h - pad} Z`}
          fill="rgba(37,99,235,0.08)"
        />
        <path
          d={path}
          fill="none"
          stroke="#2563EB"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((v, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(v)} r="4" fill="#2563EB" />
            <text
              x={x(i)}
              y={h - 6}
              textAnchor="middle"
              fontSize="9"
              fill="#9ca3af"
            >
              {fmt(pts[i].created_at).split(",")[0]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function UserDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] || "there";

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    predictionApi
      .getHistory()
      .then(({ data }) => setHistory(data.predictions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const latest = history[0] ?? null;
  const latestStyle = latest
    ? (RISK_STYLE[latest.risk_level] ?? RISK_STYLE.low)
    : null;

  // Stats derived from real data
  const totalPredictions = history.length;
  const avgRisk = history.length
    ? (
        history.reduce((s, p) => s + parseFloat(p.probability || 0), 0) /
        history.length
      ).toFixed(1)
    : null;
  const highRiskCount = history.filter((p) => p.risk_level === "high").length;

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.patient}
      title={`Welcome back, ${firstName}!`}
      subtitle="Monitor your diabetes risk and stay healthy"
    >
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last Prediction */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Last Prediction Result
            </h2>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${latest ? (latest.risk_level === "high" ? "bg-red-100" : latest.risk_level === "moderate" ? "bg-yellow-100" : "bg-green-100") : "bg-gray-100"}`}
            >
              <i
                className={`fa-solid fa-check text-sm ${latest ? (latest.risk_level === "high" ? "text-red-600" : latest.risk_level === "moderate" ? "text-yellow-600" : "text-green-600") : "text-gray-400"}`}
              ></i>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Loading…
            </div>
          ) : latest ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Risk Level</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${latestStyle.bg}`}
                >
                  {latestStyle.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Probability</span>
                <span className="text-gray-900 font-semibold">
                  {latest.probability}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Diabetes Result</span>
                <span
                  className={`text-sm font-medium ${latest.diabetes_result === 1 ? "text-red-600" : "text-green-600"}`}
                >
                  {latest.diabetes_result === 1 ? "Positive" : "Negative"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Date</span>
                <span className="text-gray-900 text-sm">
                  {fmt(latest.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">BMI</span>
                <span className="text-gray-900 text-sm">{latest.bmi}</span>
              </div>
              <button
                onClick={() => navigate("/prediction")}
                className="w-full text-primary hover:text-primary-dark text-sm font-medium py-2 border border-primary/20 hover:border-primary/50 rounded-xl transition-colors"
              >
                New Prediction →
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-4">No predictions yet.</p>
              <button
                onClick={() => navigate("/prediction")}
                className="bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
              >
                Run Your First Assessment
              </button>
            </div>
          )}
        </div>

        {/* Risk Trend */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Risk Probability Trend
            </h2>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-primary text-sm"></i>
            </div>
          </div>
          <TrendChart predictions={history} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Predictions",
            value: loading ? "—" : String(totalPredictions),
            icon: "fa-calculator",
            bg: "bg-blue-100",
            color: "text-primary",
          },
          {
            label: "Avg. Risk Prob.",
            value: loading ? "—" : avgRisk !== null ? `${avgRisk}%` : "—",
            icon: "fa-percentage",
            bg: "bg-yellow-100",
            color: "text-yellow-600",
          },
          {
            label: "High Risk Results",
            value: loading ? "—" : String(highRiskCount),
            icon: "fa-triangle-exclamation",
            bg: "bg-red-100",
            color: "text-red-600",
          },
          {
            label: "Last Assessment",
            value: loading
              ? "—"
              : latest
                ? fmt(latest.created_at).split(",")[0]
                : "None",
            icon: "fa-calendar",
            bg: "bg-green-100",
            color: "text-green-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}
              >
                <i
                  className={`fa-solid ${stat.icon} ${stat.color} text-sm`}
                ></i>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Prediction History */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Predictions
          </h2>
          <button
            onClick={() => navigate("/history")}
            className="text-primary hover:text-primary-dark text-sm font-medium"
          >
            View All →
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            Loading…
          </div>
        ) : history.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">
            No predictions yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {[
                    "Date",
                    "Risk Level",
                    "Probability",
                    "Diabetes",
                    "Glucose",
                    "BMI",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 text-xs font-semibold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 5).map((p) => {
                  const rs = RISK_STYLE[p.risk_level] ?? RISK_STYLE.low;
                  return (
                    <tr
                      key={p.prediction_id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 text-sm text-gray-600">
                        {fmt(p.created_at)}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${rs.bg}`}
                        >
                          {rs.label}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-medium text-gray-900">
                        {p.probability}%
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs font-medium ${p.diabetes_result === 1 ? "text-red-600" : "text-green-600"}`}
                        >
                          {p.diabetes_result === 1 ? "Positive" : "Negative"}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {p.blood_glucose_level}
                      </td>
                      <td className="py-3 text-sm text-gray-600">{p.bmi}</td>
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

export default UserDashboard;
