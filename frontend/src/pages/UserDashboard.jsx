import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { NAV_BY_ROLE } from "../components/navConfig";

const historyData = [
  {
    date: "Jan 15, 2024",
    risk: "Low Risk",
    riskBg: "bg-green-100 text-green-800",
    confidence: "87%",
    glucose: 98,
    bmi: 23.1,
  },
  {
    date: "Dec 28, 2023",
    risk: "Low Risk",
    riskBg: "bg-green-100 text-green-800",
    confidence: "81%",
    glucose: 105,
    bmi: 23.5,
  },
  {
    date: "Dec 01, 2023",
    risk: "Medium Risk",
    riskBg: "bg-yellow-100 text-yellow-800",
    confidence: "74%",
    glucose: 120,
    bmi: 24.8,
  },
];

// Simple Line Chart using SVG
function LineChart() {
  const points = [
    { x: 0, y: 35, label: "Dec 1" },
    { x: 1, y: 28, label: "Dec 15" },
    { x: 2, y: 25, label: "Jan 1" },
    { x: 3, y: 23, label: "Jan 15" },
    { x: 4, y: 20, label: "Jan 30" },
  ];

  const width = 300;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxY = 40;

  const toSVGX = (i) => padding + (i / (points.length - 1)) * chartWidth;
  const toSVGY = (val) => padding + chartHeight - (val / maxY) * chartHeight;

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toSVGX(i)} ${toSVGY(p.y)}`)
    .join(" ");

  const fillD = `${pathD} L ${toSVGX(points.length - 1)} ${height - padding} L ${toSVGX(0)} ${height - padding} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 10, 20, 30, 40].map((v) => (
          <g key={v}>
            <line
              x1={padding}
              y1={toSVGY(v)}
              x2={width - padding}
              y2={toSVGY(v)}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
            <text
              x={padding - 6}
              y={toSVGY(v) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#9ca3af"
            >
              {v}%
            </text>
          </g>
        ))}

        {/* Fill area */}
        <path d={fillD} fill="rgba(37, 99, 235, 0.08)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#2563EB"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={toSVGX(i)} cy={toSVGY(p.y)} r="5" fill="#2563EB" />
            <text
              x={toSVGX(i)}
              y={height - 8}
              textAnchor="middle"
              fontSize="10"
              fill="#9ca3af"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function UserDashboard({ onNavigate }) {
  const [activeNav, setActiveNav] = useState("user-dashboard");

  const handleNavigate = (page) => {
    if (!page) return;
    setActiveNav(page);
    onNavigate(page);
  };

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.patient}
      activePage={activeNav}
      onNavigate={handleNavigate}
      title="Welcome back, Shane"
      subtitle="Monitor your diabetes risk and stay healthy"
      searchPlaceholder="Search your records..."
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-gray-600">Keep tracking your metrics daily</p>
        </div>
        <button
          onClick={() => onNavigate("prediction")}
          className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <i className="fa-solid fa-plus"></i>
          New Prediction
        </button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last Prediction */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Last Prediction Result
            </h2>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-check text-green-600 text-sm"></i>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Risk Level</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Low Risk
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Confidence</span>
              <span className="text-gray-900 font-semibold">87%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Date</span>
              <span className="text-gray-900 text-sm">Jan 15, 2024</span>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Your current lifestyle and health metrics indicate a low
                diabetes risk. Keep up the good work!
              </p>
            </div>
            <button
              onClick={() => onNavigate("result")}
              className="w-full text-primary hover:text-primary-dark text-sm font-medium py-2 border border-primary/20 hover:border-primary/50 rounded-xl transition-colors"
            >
              View Full Report →
            </button>
          </div>
        </div>

        {/* Risk Trend */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Risk Trend</h2>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-chart-line text-primary text-sm"></i>
            </div>
          </div>
          <LineChart />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Predictions",
            value: "12",
            icon: "fa-calculator",
            bg: "bg-blue-100",
            color: "text-primary",
          },
          {
            label: "Average Risk",
            value: "23%",
            icon: "fa-percentage",
            bg: "bg-yellow-100",
            color: "text-yellow-600",
          },
          {
            label: "Days Tracked",
            value: "89",
            icon: "fa-calendar",
            bg: "bg-green-100",
            color: "text-green-600",
          },
          {
            label: "Health Score",
            value: "8.5",
            icon: "fa-heart",
            bg: "bg-purple-100",
            color: "text-purple-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}
              >
                <i
                  className={`fa-solid ${stat.icon} ${stat.color} text-sm`}
                ></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prediction History */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Prediction History
          </h2>
          <button className="text-primary hover:text-primary-dark text-sm font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-100">
                {[
                  "Date",
                  "Risk Level",
                  "Confidence",
                  "Glucose",
                  "BMI",
                  "Details",
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
              {historyData.map((h, i) => (
                <tr
                  key={i}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 text-sm text-gray-600">{h.date}</td>
                  <td className="py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${h.riskBg}`}
                    >
                      {h.risk}
                    </span>
                  </td>
                  <td className="py-3 text-sm font-medium text-gray-900">
                    {h.confidence}
                  </td>
                  <td className="py-3 text-sm text-gray-600">{h.glucose}</td>
                  <td className="py-3 text-sm text-gray-600">{h.bmi}</td>
                  <td className="py-3">
                    <button
                      onClick={() => onNavigate("result")}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      View →
                    </button>
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

export default UserDashboard;
