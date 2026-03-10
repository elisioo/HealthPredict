import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { NAV_BY_ROLE } from "../components/navConfig";
import { useAuth } from "../context/AuthContext";
import { appointmentApi } from "../api/authApi";

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

const STATUS_STYLE = {
  pending: {
    badge: "bg-yellow-100 text-yellow-700",
    label: "Pending",
  },
  approved: {
    badge: "bg-blue-100 text-blue-700",
    label: "Approved",
  },
  completed: {
    badge: "bg-green-100 text-green-700",
    label: "Completed",
  },
  cancelled: {
    badge: "bg-red-100 text-red-700",
    label: "Cancelled",
  },
};

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ------------------------------------------------------------------ */
/* Book Appointment Modal                                               */
/* ------------------------------------------------------------------ */
function BookModal({ staffList, onClose, onBooked }) {
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Minimum date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!staffId) return setError("Please select a staff member.");
    if (!date || !time) return setError("Please select a date and time.");

    const appointmentDate = `${date}T${time}:00`;
    if (new Date(appointmentDate) <= new Date()) {
      return setError("Appointment must be in the future.");
    }

    setSubmitting(true);
    try {
      await appointmentApi.bookAppointment({
        staff_id: parseInt(staffId, 10),
        appointment_date: appointmentDate,
        notes: notes.trim() || undefined,
      });
      onBooked();
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.error ||
        "Failed to book appointment.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">
            Book an Appointment
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Staff selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Staff Member
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select a staff member —</option>
              {staffList.map((s) => (
                <option key={s.user_id} value={s.user_id}>
                  {s.full_name}{" "}
                  {s.availability_status === "available" ? "✓" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              min={minDateStr}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Describe the reason for your visit..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? "Booking..." : "Book Appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                            */
/* ------------------------------------------------------------------ */
export default function AppointmentsPage() {
  const { user } = useAuth();
  const navItems = NAV_BY_ROLE.patient;

  const [appointments, setAppointments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [apptRes, staffRes] = await Promise.all([
        appointmentApi.getMyAppointments(),
        appointmentApi.getStaffList(),
      ]);
      setAppointments(apptRes.data.appointments);
      setStaffList(staffRes.data.staff);
    } catch {
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleBooked = () => {
    setShowModal(false);
    setSuccessMsg("Appointment booked successfully!");
    load();
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?"))
      return;
    setCancelling(id);
    try {
      await appointmentApi.updateStatus(id, "cancelled");
      setSuccessMsg("Appointment cancelled.");
      load();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to cancel appointment.");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <DashboardLayout
      navItems={navItems}
      title="My Appointments"
      subtitle="Schedule and manage your health consultations"
      brandTitle="HealthPredict"
      brandSubtitle="Patient Portal"
    >
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        {/* Header actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Book and track your consultations with our medical staff
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow transition-colors"
          >
            <i className="fa fa-plus" />
            Book Appointment
          </button>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <i className="fa fa-circle-notch fa-spin text-3xl mb-3" />
            <p className="text-sm">Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <i className="fa fa-calendar-check text-2xl text-blue-400" />
            </div>
            <p className="text-slate-600 font-semibold mb-1">
              No appointments yet
            </p>
            <p className="text-slate-400 text-sm">
              Click "Book Appointment" to schedule your first consultation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => {
              const style = STATUS_STYLE[appt.status] ?? STATUS_STYLE.pending;
              return (
                <div
                  key={appt.appointment_id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* Date block */}
                  <div className="flex-shrink-0 w-14 text-center">
                    <div className="text-2xl font-extrabold text-blue-600">
                      {new Date(appt.appointment_date).getDate()}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wide">
                      {new Date(appt.appointment_date).toLocaleString(
                        "default",
                        {
                          month: "short",
                        },
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-800">
                        {appt.staff_name}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge}`}
                      >
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <i className="fa fa-clock mr-1" />
                      {formatDateTime(appt.appointment_date)}
                    </p>
                    {appt.notes && (
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {appt.notes}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  {appt.status === "pending" && (
                    <button
                      onClick={() => handleCancel(appt.appointment_id)}
                      disabled={cancelling === appt.appointment_id}
                      className="flex-shrink-0 text-sm text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 disabled:opacity-60 transition-colors"
                    >
                      {cancelling === appt.appointment_id
                        ? "Cancelling..."
                        : "Cancel"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <BookModal
          staffList={staffList}
          onClose={() => setShowModal(false)}
          onBooked={handleBooked}
        />
      )}
    </DashboardLayout>
  );
}
