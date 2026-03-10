import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { adminApi } from "../../api/authApi";
import { useToast } from "../../context/ToastContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ------------------------------------------------------------------ */
/* Constants                                                            */
/* ------------------------------------------------------------------ */
const RISK_BADGE = {
  low: "bg-green-100 text-green-700",
  moderate: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-600",
};

function fmt(val, decimals = 1) {
  if (val == null) return "—";
  return Number(val).toFixed(decimals);
}
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/* CSV export                                                           */
/* ------------------------------------------------------------------ */
function exportCSV(predictions) {
  const headers = [
    "ID",
    "User",
    "Email",
    "Age",
    "Gender",
    "Hypertension",
    "Heart Disease",
    "BMI",
    "HbA1c",
    "Blood Glucose",
    "Risk Level",
    "Probability (%)",
    "Diabetes",
    "Date",
  ];
  const rows = predictions.map((p) => [
    p.prediction_id,
    p.user_name,
    p.user_email,
    p.age,
    p.gender,
    p.hypertension ? "Yes" : "No",
    p.heart_disease ? "Yes" : "No",
    fmt(p.bmi, 2),
    fmt(p.HbA1c_level, 1),
    p.blood_glucose_level,
    p.risk_level,
    fmt(p.probability, 1),
    p.diabetes_result ? "Positive" : "Negative",
    fmtDate(p.created_at),
  ]);

  const escape = (v) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `predictions_report_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/* PDF export                                                           */
/* ------------------------------------------------------------------ */
function exportPDF(predictions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("HealthPredict — Predictions Report", 40, 40);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generated: ${new Date().toLocaleString()}   |   Total records: ${predictions.length}`,
    40,
    58,
  );

  autoTable(doc, {
    startY: 72,
    margin: { left: 30, right: 30 },
    styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    head: [
      [
        "#",
        "User",
        "Age",
        "BMI",
        "HbA1c",
        "Glucose",
        "Risk",
        "Prob%",
        "Diabetes",
        "Date",
      ],
    ],
    body: predictions.map((p) => [
      p.prediction_id,
      p.user_name ?? p.user_email,
      p.age,
      fmt(p.bmi, 1),
      fmt(p.HbA1c_level, 1),
      p.blood_glucose_level,
      (p.risk_level ?? "—").toUpperCase(),
      fmt(p.probability, 1),
      p.diabetes_result ? "Positive" : "Negative",
      fmtDate(p.created_at),
    ]),
    didParseCell({ cell, row, column }) {
      if (column.index === 6 && row.section === "body") {
        const risk = String(cell.raw).toLowerCase();
        cell.styles.textColor =
          risk === "high"
            ? [220, 38, 38]
            : risk === "moderate"
              ? [217, 119, 6]
              : [22, 163, 74];
        cell.styles.fontStyle = "bold";
      }
    },
  });

  doc.save(`predictions_report_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/* ------------------------------------------------------------------ */
/* Stat chip                                                             */
/* ------------------------------------------------------------------ */
function StatCard({ label, value, color = "text-slate-800", bg = "bg-white" }) {
  return (
    <div
      className={`${bg} rounded-2xl border border-slate-200 p-4 text-center shadow-sm`}
    >
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */
export default function PredictionsReportPage() {
  const { showToast } = useToast();

  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [risk, setRisk] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (risk) params.risk = risk;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      const res = await adminApi.getAllPredictions(params);
      setPredictions(res.data.predictions);
    } catch {
      showToast("Failed to load predictions.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, risk, fromDate, toDate, showToast]);

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [load]);

  // Derived stats
  const total = predictions.length;
  const high = predictions.filter((p) => p.risk_level === "high").length;
  const moderate = predictions.filter(
    (p) => p.risk_level === "moderate",
  ).length;
  const low = predictions.filter((p) => p.risk_level === "low").length;
  const positive = predictions.filter((p) => p.diabetes_result).length;

  const handleExportCSV = () => {
    if (!predictions.length) {
      showToast("No data to export.", "warning");
      return;
    }
    exportCSV(predictions);
    showToast("CSV downloaded.", "success");
  };

  const handleExportPDF = () => {
    if (!predictions.length) {
      showToast("No data to export.", "warning");
      return;
    }
    exportPDF(predictions);
    showToast("PDF downloaded.", "success");
  };

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.admin}
      title="Predictions Report"
      subtitle="Full audit table of every prediction — export as PDF or CSV"
      brandTitle="Glucogu"
    >
      <div className="p-4 sm:p-8">
        {/* Stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
          <StatCard label="Total" value={total} color="text-slate-800" />
          <StatCard
            label="High Risk"
            value={high}
            color="text-red-600"
            bg="bg-red-50"
          />
          <StatCard
            label="Moderate"
            value={moderate}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            label="Low Risk"
            value={low}
            color="text-green-600"
            bg="bg-green-50"
          />
          <StatCard
            label="Positive"
            value={positive}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <i className="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or email…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Risk filter */}
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>

          {/* Date range */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Export buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <i className="fa fa-file-csv" /> CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              <i className="fa fa-file-pdf" /> PDF
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex flex-col items-center py-24 text-slate-400">
            <i className="fa fa-circle-notch fa-spin text-3xl mb-3" />
            <p className="text-sm">Loading predictions…</p>
          </div>
        ) : predictions.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-slate-400">
            <i className="fa fa-database text-3xl mb-3" />
            <p className="text-sm">No predictions match your filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "#",
                      "User",
                      "Age",
                      "Gender",
                      "Hypert.",
                      "Heart Dis.",
                      "BMI",
                      "HbA1c",
                      "Glucose",
                      "Risk",
                      "Prob %",
                      "Diabetes",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {predictions.map((p) => (
                    <tr key={p.prediction_id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {p.prediction_id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">
                          {p.user_name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {p.user_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{p.age}</td>
                      <td className="px-4 py-3 text-slate-600 capitalize">
                        {p.gender?.toLowerCase()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.hypertension ? (
                          <i className="fa fa-check text-red-500" />
                        ) : (
                          <i className="fa fa-xmark text-slate-300" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {p.heart_disease ? (
                          <i className="fa fa-check text-red-500" />
                        ) : (
                          <i className="fa fa-xmark text-slate-300" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {fmt(p.bmi, 1)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {fmt(p.HbA1c_level, 1)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {p.blood_glucose_level}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${RISK_BADGE[p.risk_level] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {p.risk_level ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-mono">
                        {fmt(p.probability, 1)}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.diabetes_result ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                        >
                          {p.diabetes_result ? "Positive" : "Negative"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {fmtDateTime(p.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400 flex justify-between">
              <span>
                Showing {predictions.length} record
                {predictions.length !== 1 ? "s" : ""}
              </span>
              <span>HealthPredict — Predictions Report</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
