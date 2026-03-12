import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { NAV_BY_ROLE } from "../../components/navConfig";
import { staffApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

function riskCls(level) {
  if (level === "high")
    return { bg: "bg-red-100 text-red-800", text: "text-red-600" };
  if (level === "moderate")
    return { bg: "bg-yellow-100 text-yellow-800", text: "text-yellow-600" };
  return { bg: "bg-green-100 text-green-800", text: "text-green-600" };
}

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_patients: 0,
    high_risk: 0,
    predictions_today: 0,
    appointments_today: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await staffApi.getDashboard();
      setStats(data.stats);
      setRecentPatients(data.recentPatients || []);
      setRecentAssessments(data.recentAssessments || []);
      setUpcomingAppointments(data.upcomingAppointments || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const STAT_CARDS = [
    {
      label: "Total Patients",
      value: stats.total_patients,
      icon: "fa-users",
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-l-blue-500",
      blob: "bg-blue-50",
    },
    {
      label: "High Risk Cases",
      value: stats.high_risk,
      icon: "fa-triangle-exclamation",
      bg: "bg-red-100",
      text: "text-red-600",
      border: "border-l-red-500",
      blob: "bg-red-50",
    },
    {
      label: "Predictions Today",
      value: stats.predictions_today,
      icon: "fa-clipboard-check",
      bg: "bg-yellow-100",
      text: "text-yellow-600",
      border: "border-l-yellow-500",
      blob: "bg-yellow-50",
    },
    {
      label: "Appointments Today",
      value: stats.appointments_today,
      icon: "fa-calendar-check",
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      border: "border-l-emerald-500",
      blob: "bg-emerald-50",
    },
  ];

  return (
    <DashboardLayout
      navItems={NAV_BY_ROLE.staff}
      title="Dashboard Overview"
      subtitle={`Welcome back, ${user?.fullName || "Staff"}`}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fa-solid fa-spinner fa-spin text-2xl text-primary"></i>
        </div>
      ) : (
        <>
          {/* Stats */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STAT_CARDS.map(
              ({ label, value, icon, bg, text, border, blob }) => (
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
                    </div>
                    <h3 className="text-slate-500 text-sm font-medium">
                      {label}
                    </h3>
                    <p className="text-3xl font-bold text-slate-800 mt-1 text-right">
                      {typeof value === "number"
                        ? value.toLocaleString()
                        : value}
                    </p>
                  </div>
                </div>
              ),
            )}
          </section>

          {/* Main Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-xl font-bold text-slate-800 mb-4">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    onClick={() => navigate("/prediction")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles text-blue-600 text-lg"></i>
                    <span className="text-xs font-medium text-slate-700">
                      New Prediction
                    </span>
                  </button>
                  <button
                    onClick={() => navigate("/staff/patients")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <i className="fa-solid fa-folder-open text-emerald-600 text-lg"></i>
                    <span className="text-xs font-medium text-slate-700">
                      Patient Records
                    </span>
                  </button>
                  <button
                    onClick={() => navigate("/staff/appointments")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <i className="fa-solid fa-calendar-check text-yellow-600 text-lg"></i>
                    <span className="text-xs font-medium text-slate-700">
                      Appointments
                    </span>
                  </button>
                  <button
                    onClick={() => navigate("/staff/team")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <i className="fa-solid fa-user-doctor text-purple-600 text-lg"></i>
                    <span className="text-xs font-medium text-slate-700">
                      Medical Team
                    </span>
                  </button>
                </div>
              </div>

              {/* Recent Assessments Table */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Recent Assessments
                    </h2>
                    <p className="text-sm text-slate-500">
                      Latest prediction results
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/staff/patients")}
                    className="text-sm text-blue-600 font-medium hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="text-left text-xs text-slate-500 uppercase border-b border-slate-100">
                        {[
                          "Patient",
                          "Date",
                          "Glucose",
                          "BMI",
                          "HbA1c",
                          "Risk Level",
                          "Probability",
                        ].map((h) => (
                          <th key={h} className="py-3 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-sm text-slate-700">
                      {recentAssessments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-8 text-center text-slate-400"
                          >
                            No assessments yet
                          </td>
                        </tr>
                      ) : (
                        recentAssessments.map((a) => {
                          const rc = riskCls(a.risk_level);
                          return (
                            <tr
                              key={a.prediction_id}
                              className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                            >
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600 text-sm">
                                    {a.full_name?.charAt(0) || "?"}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">
                                      {a.full_name}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      ID: {a.user_id}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 text-slate-600">
                                {new Date(a.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-4">
                                {a.blood_glucose_level} mg/dL
                              </td>
                              <td className="py-4">{a.bmi}</td>
                              <td className="py-4">{a.HbA1c_level}%</td>
                              <td className="py-4">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${rc.bg}`}
                                >
                                  {a.risk_level}
                                </span>
                              </td>
                              <td className={`py-4 font-semibold ${rc.text}`}>
                                {a.probability}%
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Patients */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Recent Patients
                    </h2>
                    <p className="text-sm text-slate-500">Latest predictions</p>
                  </div>
                  <button
                    onClick={() => navigate("/staff/patients")}
                    className="text-sm text-blue-600 font-medium hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {recentPatients.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No patients yet
                    </p>
                  ) : (
                    recentPatients.map((p) => {
                      const rc = riskCls(p.risk_level);
                      return (
                        <div
                          key={p.user_id}
                          className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm">
                              {p.full_name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">
                                {p.full_name}
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(p.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full border ${rc.bg}`}
                          >
                            {p.risk_level || "N/A"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      Upcoming Appointments
                    </h2>
                    <p className="text-sm text-slate-500">Today & beyond</p>
                  </div>
                  <button
                    onClick={() => navigate("/staff/appointments")}
                    className="text-sm text-blue-600 font-medium hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">
                      No upcoming appointments
                    </p>
                  ) : (
                    upcomingAppointments.map((a) => (
                      <div
                        key={a.appointment_id}
                        className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-800">
                            {a.patient_name}
                          </p>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              a.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : a.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          <i className="fa-solid fa-calendar-day mr-1"></i>
                          {new Date(a.appointment_date).toLocaleString()}
                        </p>
                        {a.notes && (
                          <p className="text-xs text-slate-400 mt-1 truncate">
                            {a.notes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  );
}
