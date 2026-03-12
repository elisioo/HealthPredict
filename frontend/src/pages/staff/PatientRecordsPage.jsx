import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { useAuth } from "../../context/AuthContext";
import { staffApi } from "../../api/authApi";
import stripTags, { sanitizeName } from "../../utils/stripTags";

const RISK_OPTIONS = ["all", "high", "moderate", "low"];
const PAGE_SIZE = 10;

export default function PatientRecordsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState("full_name");
  const [sortDir, setSortDir] = useState("asc");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    full_name: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchPatients = useCallback(async () => {
    try {
      const { data } = await staffApi.getPatients({ search, risk: riskFilter });
      setPatients(data.patients || []);
    } catch (err) {
      console.error("Load patients error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, riskFilter]);

  useEffect(() => {
    setPage(1);
    const timer = setTimeout(() => fetchPatients(), 300);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = [...patients].sort((a, b) => {
    let av = a[sortCol],
      bv = b[sortCol];
    if (av == null) av = "";
    if (bv == null) bv = "";
    if (sortCol === "probability") {
      av = Number(av) || 0;
      bv = Number(bv) || 0;
    } else if (sortCol === "last_prediction_date") {
      av = av ? new Date(av).getTime() : 0;
      bv = bv ? new Date(bv).getTime() : 0;
    } else {
      av = String(av).toLowerCase();
      bv = String(bv).toLowerCase();
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    if (!addForm.full_name || !addForm.email) {
      setAddError("Full name and email are required.");
      return;
    }
    setAdding(true);
    try {
      const { data } = await staffApi.addPatient({
        ...addForm,
        first_name: addForm.first_name || addForm.full_name.split(" ")[0],
        last_name:
          addForm.last_name ||
          addForm.full_name.split(" ").slice(1).join(" ") ||
          "",
      });
      setAddSuccess(
        `Patient registered! Default password: ${data.default_password}`,
      );
      setAddForm({
        full_name: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
      });
      fetchPatients();
    } catch (err) {
      setAddError(err.response?.data?.error || "Failed to add patient");
    } finally {
      setAdding(false);
    }
  };

  function riskBadge(level) {
    if (level === "high") return "bg-red-100 text-red-800";
    if (level === "moderate") return "bg-yellow-100 text-yellow-800";
    if (level === "low") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-600";
  }
  function probColor(level) {
    if (level === "high") return "text-red-600";
    if (level === "moderate") return "text-yellow-600";
    return "text-green-600";
  }

  const roleNav =
    user?.role === "admin" ? NAV_BY_ROLE.admin : NAV_BY_ROLE.staff;

  return (
    <DashboardLayout
      navItems={roleNav}
      title="Patient Records"
      subtitle="Manage and review patient predictions"
    >
      <div>
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              Patient Records
            </h2>
            <p className="text-gray-600">
              Manage and review patient predictions
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowAdd(true);
                setAddError("");
                setAddSuccess("");
              }}
              className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-user-plus"></i> Add Patient
            </button>
            <button
              onClick={() => navigate("/prediction")}
              className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <i className="fa-solid fa-plus"></i> New Prediction
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(stripTags(e.target.value))}
                placeholder="Search patients by name or email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors text-sm"
              />
            </div>
            <div className="relative">
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none appearance-none bg-white text-sm capitalize"
              >
                <option value="all">All Risk Levels</option>
                {RISK_OPTIONS.filter((o) => o !== "all").map((o) => (
                  <option key={o} value={o} className="capitalize">
                    {o} risk
                  </option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"></i>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Patient List
            </h3>
            <span className="text-sm text-gray-500">
              {sorted.length} records
            </span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <i className="fa-solid fa-spinner fa-spin text-xl text-primary"></i>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { label: "Patient Name", col: "full_name" },
                      { label: "Email", col: "email" },
                      { label: "Last Prediction", col: "last_prediction_date" },
                      { label: "Risk Level", col: "risk_level" },
                      { label: "Probability", col: "probability" },
                      { label: "Actions", col: null },
                    ].map((h) => (
                      <th
                        key={h.label}
                        className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${h.col ? "cursor-pointer select-none hover:text-gray-700" : ""}`}
                        onClick={() => h.col && handleSort(h.col)}
                      >
                        <span className="inline-flex items-center gap-1">
                          {h.label}
                          {h.col && sortCol === h.col && (
                            <i
                              className={`fa-solid fa-sort-${sortDir === "asc" ? "up" : "down"} text-primary text-[10px]`}
                            ></i>
                          )}
                          {h.col && sortCol !== h.col && (
                            <i className="fa-solid fa-sort text-gray-300 text-[10px]"></i>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paged.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        No patients found
                      </td>
                    </tr>
                  ) : (
                    paged.map((p) => (
                      <tr
                        key={p.user_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold flex-shrink-0">
                              {p.full_name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {p.full_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {p.user_id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {p.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {p.last_prediction_date
                            ? new Date(
                                p.last_prediction_date,
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {p.risk_level ? (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${riskBadge(p.risk_level)}`}
                            >
                              {p.risk_level}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${probColor(p.risk_level)}`}
                        >
                          {p.probability != null ? `${p.probability}%` : "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() =>
                              navigate("/prediction", {
                                state: {
                                  target_user_id: p.user_id,
                                  patient_name: p.full_name,
                                },
                              })
                            }
                            className="text-primary hover:text-primary-dark transition-colors"
                          >
                            Predict
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {sorted.length > PAGE_SIZE && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (n) =>
                      n === 1 || n === totalPages || Math.abs(n - page) <= 1,
                  )
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push("...");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === "..." ? (
                      <span
                        key={`e${i}`}
                        className="px-2 text-gray-400 text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          n === page
                            ? "bg-primary text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {n}
                      </button>
                    ),
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Patient Modal */}
        {showAdd && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdd(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Add New Patient
                </h3>
                <button
                  onClick={() => setShowAdd(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
              {addSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                  {addSuccess}
                </div>
              )}
              {addError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {addError}
                </div>
              )}
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={addForm.full_name}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        full_name: sanitizeName(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    placeholder="e.g. Juan Dela Cruz"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={addForm.first_name}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          first_name: sanitizeName(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={addForm.last_name}
                      onChange={(e) =>
                        setAddForm({
                          ...addForm,
                          last_name: sanitizeName(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        email: stripTags(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    placeholder="e.g. patient@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        phone: stripTags(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm"
                    placeholder="+63 912 345 6789"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {adding && <i className="fa-solid fa-spinner fa-spin"></i>}
                    Register Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
