import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/authApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SUMMARY = [
  {
    label: "Total Patients Screened",
    value: "2,847",
    change: "+12%",
    up: true,
    icon: "fa-users",
    bg: "bg-blue-100",
    text: "text-blue-600",
  },
  {
    label: "High Risk Percentage",
    value: "18.4%",
    change: "+5%",
    up: false,
    icon: "fa-exclamation-triangle",
    bg: "bg-red-100",
    text: "text-red-600",
  },
  {
    label: "Average Risk Score",
    value: "42.6",
    change: "0%",
    up: null,
    icon: "fa-chart-line",
    bg: "bg-purple-100",
    text: "text-purple-600",
  },
  {
    label: "Monthly Predictions",
    value: "324",
    change: "+8%",
    up: true,
    icon: "fa-calendar-check",
    bg: "bg-green-100",
    text: "text-green-600",
  },
];

// Simple SVG bar chart
function BarChart({ data, color = "#2563EB" }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2 h-52 pt-4">
      {data.map((d) => (
        <div key={d.label} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-xs text-gray-500 font-medium">{d.value}</span>
          <div
            className="w-full flex items-end justify-center"
            style={{ height: "160px" }}
          >
            <div
              className="w-full rounded-t-lg transition-all hover:opacity-80"
              style={{
                height: `${(d.value / max) * 100}%`,
                backgroundColor: color,
              }}
            />
          </div>
          <span className="text-xs text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// Donut chart using SVG
function DonutChart() {
  const segments = [
    { label: "Low Risk", pct: 61.6, color: "#22c55e" },
    { label: "Moderate", pct: 20, color: "#eab308" },
    { label: "High Risk", pct: 18.4, color: "#ef4444" },
  ];
  const r = 60,
    cx = 80,
    cy = 80,
    circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex flex-col items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {segments.map((s) => {
          const dash = (s.pct / 100) * circumference;
          const el = (
            <circle
              key={s.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="20"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#1e293b"
        >
          2,847
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
        >
          total
        </text>
      </svg>
      <div className="flex gap-4 flex-wrap justify-center">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color }}
            ></div>
            <span className="text-xs text-gray-600">
              {s.label} ({s.pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const trendData = [
  { label: "Jul", value: 210 },
  { label: "Aug", value: 245 },
  { label: "Sep", value: 280 },
  { label: "Oct", value: 260 },
  { label: "Nov", value: 305 },
  { label: "Dec", value: 290 },
  { label: "Jan", value: 324 },
];

const RECENT_REPORTS = [
  {
    name: "Monthly Risk Assessment Report",
    date: "Jan 15, 2025",
    type: "PDF",
    size: "2.4 MB",
  },
  {
    name: "Q4 2024 Analytics Summary",
    date: "Jan 1, 2025",
    type: "Excel",
    size: "1.8 MB",
  },
  {
    name: "High Risk Patient Overview",
    date: "Dec 28, 2024",
    type: "PDF",
    size: "3.1 MB",
  },
  {
    name: "Model Performance Report",
    date: "Dec 15, 2024",
    type: "PDF",
    size: "1.2 MB",
  },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [period, setPeriod] = useState("Last 7 Months");
  const [stats, setStats] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    adminApi
      .getStats()
      .then(({ data }) => setStats(data))
      .catch(() => {});
  }, []);

  const LIVE_SUMMARY = stats
    ? [
        {
          label: "Total Patients Screened",
          value: stats.users?.patients?.toLocaleString() ?? "—",
          change: "+12%",
          up: true,
          icon: "fa-users",
          bg: "bg-blue-100",
          text: "text-blue-600",
        },
        {
          label: "High Risk Cases",
          value:
            stats.predictions?.high_risk != null
              ? `${((stats.predictions.high_risk / (stats.predictions.total || 1)) * 100).toFixed(1)}%`
              : "—",
          change: "+5%",
          up: false,
          icon: "fa-exclamation-triangle",
          bg: "bg-red-100",
          text: "text-red-600",
        },
        {
          label: "Total Predictions",
          value: stats.predictions?.total?.toLocaleString() ?? "—",
          change: "All time",
          up: null,
          icon: "fa-chart-line",
          bg: "bg-purple-100",
          text: "text-purple-600",
        },
        {
          label: "Registered Users",
          value: stats.users?.total?.toLocaleString() ?? "—",
          change: "Active",
          up: null,
          icon: "fa-calendar-check",
          bg: "bg-green-100",
          text: "text-green-600",
        },
      ]
    : SUMMARY;

  const handleDownloadPDF = async () => {
    setExporting(true);
    try {
      const { data } = await adminApi.getAllPredictions({ limit: 1000 });
      const predictions = data.predictions || [];
      const statsData = stats;

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const now = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // ── Title header ──
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 297, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Glucogu — Diabetes Risk Predictions Report", 14, 12);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${now}`, 14, 22);

      // ── Summary stats ──
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Summary", 14, 38);

      if (statsData) {
        const total = statsData.predictions?.total ?? 0;
        const high = statsData.predictions?.high_risk ?? 0;
        const users = statsData.users?.total ?? 0;
        autoTable(doc, {
          startY: 42,
          head: [
            [
              "Total Predictions",
              "High Risk Cases",
              "High Risk %",
              "Total Users",
            ],
          ],
          body: [
            [
              total.toLocaleString(),
              high.toLocaleString(),
              total > 0 ? `${((high / total) * 100).toFixed(1)}%` : "0%",
              users.toLocaleString(),
            ],
          ],
          headStyles: {
            fillColor: [37, 99, 235],
            textColor: 255,
            fontStyle: "bold",
          },
          styles: { fontSize: 10, halign: "center" },
          margin: { left: 14, right: 14 },
        });
      }

      // ── Predictions table ──
      const tableStartY = doc.lastAutoTable?.finalY + 10 || 70;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Prediction Records", 14, tableStartY);

      const riskColor = (lvl) => {
        if (lvl === "high") return [239, 68, 68];
        if (lvl === "moderate") return [234, 179, 8];
        return [34, 197, 94];
      };

      autoTable(doc, {
        startY: tableStartY + 4,
        head: [
          [
            "#",
            "Date",
            "Gender",
            "Age",
            "BMI",
            "Glucose",
            "HbA1c",
            "Risk Level",
            "Probability",
            "Diabetes",
          ],
        ],
        body: predictions.map((p, i) => [
          i + 1,
          new Date(p.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          p.gender ?? "—",
          p.age ?? "—",
          p.bmi ?? "—",
          p.blood_glucose_level ?? "—",
          p.HbA1c_level ?? "—",
          (p.risk_level ?? "—").charAt(0).toUpperCase() +
            (p.risk_level ?? "").slice(1),
          p.probability != null ? `${p.probability}%` : "—",
          p.diabetes_result === 1 ? "Positive" : "Negative",
        ]),
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: 255,
          fontStyle: "bold",
          fontSize: 8,
        },
        styles: { fontSize: 7.5, cellPadding: 2 },
        bodyStyles: { textColor: [30, 41, 59] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (hookData) => {
          if (hookData.column.index === 7 && hookData.section === "body") {
            const raw = (hookData.row.raw[7] ?? "").toLowerCase();
            const [r, g, b] = riskColor(raw);
            hookData.cell.styles.textColor = [r, g, b];
            hookData.cell.styles.fontStyle = "bold";
          }
          if (hookData.column.index === 9 && hookData.section === "body") {
            const val = hookData.row.raw[9];
            hookData.cell.styles.textColor =
              val === "Positive" ? [239, 68, 68] : [34, 197, 94];
            hookData.cell.styles.fontStyle = "bold";
          }
        },
        margin: { left: 14, right: 14 },
      });

      // footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${i} of ${pageCount} — Glucogu Confidential`,
          14,
          doc.internal.pageSize.height - 6,
        );
      }

      doc.save(`glucogu-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const roleNav =
    user?.role === "admin" ? NAV_BY_ROLE.admin : NAV_BY_ROLE.staff;

  return (
    <DashboardLayout
      navItems={roleNav}
      title="Reports & Analytics"
      subtitle="Prediction insights and export tools"
    >
      <main className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {LIVE_SUMMARY.map(({ label, value, change, up, icon, bg, text }) => (
            <div
              key={label}
              className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}
                >
                  <i className={`fa-solid ${icon} ${text} text-xl`}></i>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    up === null
                      ? "bg-gray-100 text-gray-600"
                      : up
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                  }`}
                >
                  {change}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 text-right">
                {value}
              </p>
              <h3 className="text-gray-500 text-sm font-medium mb-1">
                {label}
              </h3>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100 shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Risk Distribution
            </h3>
            <DonutChart />
          </div>
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Monthly Prediction Trends
              </h3>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {["Last 7 Months", "Last 6 Months", "Last Year"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <BarChart data={trendData} color="#2563EB" />
          </div>
        </div>

        {/* Export & Recent Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export */}
          <div className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100 shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Export Reports
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                disabled={exporting}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary transition-all text-sm font-medium text-gray-700 disabled:opacity-60"
              >
                {exporting ? (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <i className="fa-solid fa-file-pdf text-red-500 text-lg"></i>
                )}
                {exporting ? "Generating PDF…" : "Full Report PDF"}
              </button>
              <button
                onClick={() => {
                  adminApi
                    .getAllPredictions({ limit: 10000 })
                    .then(({ data }) => {
                      const rows = data.predictions || [];
                      const header = [
                        "ID",
                        "Date",
                        "Gender",
                        "Age",
                        "Hypertension",
                        "Heart Disease",
                        "Smoking",
                        "BMI",
                        "HbA1c",
                        "Glucose",
                        "Diabetes Result",
                        "Risk Level",
                        "Probability",
                      ];
                      const csv = [
                        header,
                        ...rows.map((p) => [
                          p.prediction_id,
                          new Date(p.created_at).toLocaleDateString(),
                          p.gender,
                          p.age,
                          p.hypertension,
                          p.heart_disease,
                          p.smoking_history,
                          p.bmi,
                          p.HbA1c_level,
                          p.blood_glucose_level,
                          p.diabetes_result === 1 ? "Positive" : "Negative",
                          p.risk_level,
                          p.probability != null ? p.probability + "%" : "",
                        ]),
                      ]
                        .map((r) => r.join(","))
                        .join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const a = document.createElement("a");
                      a.href = URL.createObjectURL(blob);
                      a.download = `glucogu-predictions-${new Date().toISOString().slice(0, 10)}.csv`;
                      a.click();
                    })
                    .catch(() => {});
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 hover:border-primary transition-all text-sm font-medium text-gray-700"
              >
                <i className="fa-solid fa-file-csv text-blue-600 text-lg"></i>
                Export Raw CSV
              </button>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur rounded-2xl p-6 border border-blue-100 shadow-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Recent Reports
            </h3>
            <div className="space-y-3">
              {RECENT_REPORTS.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.type === "PDF" ? "bg-red-50" : "bg-green-50"}`}
                    >
                      <i
                        className={`fa-solid ${r.type === "PDF" ? "fa-file-pdf text-red-500" : "fa-file-excel text-green-600"}`}
                      ></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {r.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {r.date} · {r.size}
                      </p>
                    </div>
                  </div>
                  <button className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1">
                    <i className="fa-solid fa-download text-xs"></i>
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
