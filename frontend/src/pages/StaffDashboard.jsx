import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { NAV_BY_ROLE } from "../components/navConfig";

const STATS = [
  {
    label: "Total Patients",
    value: "1,284",
    change: "+12%",
    up: true,
    icon: "fa-users",
    bg: "bg-blue-100",
    text: "text-blue-600",
    blob: "bg-blue-50",
    border: "border-l-blue-500",
  },
  {
    label: "High Risk Cases",
    value: "142",
    change: "+5%",
    up: true,
    icon: "fa-triangle-exclamation",
    bg: "bg-red-100",
    text: "text-red-600",
    blob: "bg-red-50",
    border: "border-l-red-500",
  },
  {
    label: "Predictions Today",
    value: "28",
    change: "Today",
    up: null,
    icon: "fa-clipboard-check",
    bg: "bg-yellow-100",
    text: "text-yellow-600",
    blob: "bg-yellow-50",
    border: "border-l-yellow-500",
  },
  {
    label: "Model Accuracy",
    value: "94.8%",
    change: null,
    up: null,
    icon: "fa-bullseye",
    bg: "bg-emerald-100",
    text: "text-emerald-600",
    blob: "bg-emerald-50",
    border: "border-l-emerald-500",
  },
];

const FORM_FIELDS = [
  {
    label: "Glucose Level (mg/dL)",
    icon: "fa-droplet",
    placeholder: "e.g. 140",
  },
  {
    label: "Blood Pressure (mm Hg)",
    icon: "fa-heart-pulse",
    placeholder: "e.g. 80",
  },
  {
    label: "BMI Index",
    icon: "fa-weight-scale",
    placeholder: "e.g. 24.5",
    step: "0.1",
  },
  { label: "Age", icon: "fa-calendar", placeholder: "e.g. 45" },
];

const RECENT_PATIENTS = [
  {
    name: "Wade Warren",
    id: "#P-7732",
    age: "58yo",
    risk: "Moderate",
    cls: "bg-yellow-100 text-yellow-600 border-yellow-200",
  },
  {
    name: "Esther Howard",
    id: "#P-1234",
    age: "29yo",
    risk: "Low Risk",
    cls: "bg-green-100 text-green-600 border-green-200",
  },
];

const TABLE_ROWS = [
  {
    initials: "RF",
    name: "Robert Fox",
    date: "Oct 24, 2023",
    glucose: "142 mg/dL",
    bp: "88 mm Hg",
    bmi: "28.4",
    score: 85,
    risk: "High Risk",
    riskCls: "bg-red-50 text-red-600 border-red-100",
    barCls: "bg-red-500",
    avatarCls: "bg-blue-100 text-blue-600",
  },
  {
    initials: "JC",
    name: "Jane Cooper",
    date: "Oct 23, 2023",
    glucose: "98 mg/dL",
    bp: "72 mm Hg",
    bmi: "22.1",
    score: 12,
    risk: "Healthy",
    riskCls: "bg-green-50 text-green-600 border-green-100",
    barCls: "bg-green-500",
    avatarCls: null,
  },
  {
    initials: "WW",
    name: "Wade Warren",
    date: "Oct 22, 2023",
    glucose: "115 mg/dL",
    bp: "80 mm Hg",
    bmi: "26.8",
    score: 45,
    risk: "Moderate",
    riskCls: "bg-yellow-50 text-yellow-600 border-yellow-100",
    barCls: "bg-yellow-400",
    avatarCls: "bg-purple-100 text-purple-600",
  },
];

function LineChart() {
  const pts = [120, 132, 101, 134, 90, 130, 110];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const w = 400,
    h = 160,
    pad = 20;
  const max = Math.max(...pts),
    min = Math.min(...pts);
  const x = (i) => pad + (i / (pts.length - 1)) * (w - pad * 2);
  const y = (v) => pad + (1 - (v - min) / (max - min)) * (h - pad * 2);
  const path = pts
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <path
        d={`${path} L${x(pts.length - 1)},${h - pad} L${x(0)},${h - pad} Z`}
        fill="rgba(37,99,235,0.1)"
      />
      <path
        d={path}
        fill="none"
        stroke="#2563eb"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {pts.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r="4"
          fill="#2563eb"
          stroke="white"
          strokeWidth="2"
        />
      ))}
      {days.map((d, i) => (
        <text
          key={i}
          x={x(i)}
          y={h - 4}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
        >
          {d}
        </text>
      ))}
    </svg>
  );
}

export default function StaffDashboard({ onNavigate }) {
  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.staff}
      activePage="staff-dashboard"
      onNavigate={onNavigate}
      title="Dashboard Overview"
      subtitle="Welcome back, Dr. Sarah"
    >
      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map(
          ({ label, value, change, up, icon, bg, text, blob, border }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl p-6 h-40 relative overflow-hidden group hover:shadow-lg transition-all border-l-4 ${border} shadow-sm`}
            >
              <div
                className={`absolute right-0 top-0 w-24 h-24 ${blob} rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform`}
              />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 ${bg} ${text} rounded-lg`}>
                    <i className={`fa-solid ${icon} text-lg`}></i>
                  </div>
                  {change && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${
                        up === true
                          ? "text-green-600 bg-green-50"
                          : up === false
                            ? "text-red-600 bg-red-50"
                            : "text-slate-500 bg-slate-100"
                      }`}
                    >
                      {up !== null && (
                        <i
                          className={`fa-solid fa-arrow-${up ? "up" : "down"} text-[10px]`}
                        ></i>
                      )}
                      {change}
                    </span>
                  )}
                </div>
                <h3 className="text-slate-500 text-sm font-medium">{label}</h3>
                <p className="text-3xl font-bold text-slate-800 mt-1">
                  {value}
                </p>
              </div>
            </div>
          ),
        )}
      </section>

      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Prediction Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                New Risk Assessment
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Enter patient vitals for instant AI prediction
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {FORM_FIELDS.map(({ label, icon, placeholder, step }) => (
                <div key={label} className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {label}
                  </label>
                  <div className="relative">
                    <i
                      className={`fa-solid ${icon} absolute left-3 top-1/2 -translate-y-1/2 text-slate-400`}
                    ></i>
                    <input
                      type="number"
                      step={step}
                      placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigate("result")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Run Prediction
              </button>
              <button className="px-6 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <i className="fa-solid fa-floppy-disk"></i>
                Save Draft
              </button>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Glucose Trends
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Past 7 day patient readings
                </p>
              </div>
              <button className="text-sm text-blue-600 font-medium">
                Export CSV
              </button>
            </div>
            <div className="mt-6">
              <LineChart />
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Recent patients */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Recent patients
                </h2>
                <p className="text-sm text-slate-500">High priority</p>
              </div>
              <button className="text-sm text-blue-600 font-medium">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {RECENT_PATIENTS.map(({ name, id, age, risk, cls }) => (
                <div
                  key={id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {id} · {age}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${cls}`}
                  >
                    {risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Tasks</h2>
                <p className="text-sm text-slate-500">Follow-up reminders</p>
              </div>
              <button className="text-sm text-blue-600 font-medium">
                Add task
              </button>
            </div>
            {[
              "Review lab results",
              "Schedule dietitian consult",
              "Update care plan",
            ].map((task) => (
              <div
                key={task}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors"
              >
                <input type="checkbox" className="accent-blue-600 w-4 h-4" />
                <span className="text-sm text-slate-700">{task}</span>
              </div>
            ))}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-700 font-medium">
                AI suggestions ready
              </p>
              <p className="text-xs text-blue-600">
                3 new recommendations for high-risk patients
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Recent assessments
            </h2>
            <p className="text-sm text-slate-500">Updated 2 hours ago</p>
          </div>
          <div className="flex gap-2">
            {["All", "Healthy", "Moderate", "High risk"].map((filter) => (
              <button
                key={filter}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  filter === "All"
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-[880px]">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                {[
                  "Patient",
                  "Date",
                  "Glucose",
                  "Blood Pressure",
                  "BMI",
                  "Risk Score",
                  "Status",
                ].map((head) => (
                  <th key={head} className="py-3 font-semibold">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {TABLE_ROWS.map(
                ({
                  initials,
                  name,
                  date,
                  glucose,
                  bp,
                  bmi,
                  score,
                  risk,
                  riskCls,
                  barCls,
                  avatarCls,
                }) => (
                  <tr
                    key={name}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-semibold text-slate-700 ${avatarCls}`}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{name}</p>
                          <p className="text-xs text-slate-400">ID: P-1024</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-600">{date}</td>
                    <td className="py-4">{glucose}</td>
                    <td className="py-4">{bp}</td>
                    <td className="py-4">{bmi}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full ${barCls}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {score}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full border ${riskCls}`}
                      >
                        {risk}
                      </span>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  );
}
