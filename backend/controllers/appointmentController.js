const { validationResult } = require("express-validator");
const AppointmentModel = require("../models/appointmentModel");

/* ------------------------------------------------------------------ */
/* POST /api/appointments                                               */
/* Health user books an appointment with a staff member                */
/* ------------------------------------------------------------------ */
const bookAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { staff_id, appointment_date, notes } = req.body;

  // Only health_users can book; staff/admin use their own workflow
  if (req.user.role !== "health_user") {
    return res
      .status(403)
      .json({ error: "Only patients can book appointments" });
  }

  // Ensure the requested date is in the future
  if (new Date(appointment_date) <= new Date()) {
    return res
      .status(400)
      .json({ error: "Appointment date must be in the future" });
  }

  try {
    const id = await AppointmentModel.create({
      user_id: req.user.user_id,
      staff_id,
      appointment_date,
      notes,
    });
    return res
      .status(201)
      .json({ message: "Appointment booked", appointment_id: id });
  } catch (err) {
    console.error("[bookAppointment]", err);
    return res.status(500).json({ error: "Failed to book appointment" });
  }
};

/* ------------------------------------------------------------------ */
/* GET /api/appointments/my                                             */
/* Returns appointments for the currently logged-in patient            */
/* ------------------------------------------------------------------ */
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentModel.getByUser(req.user.user_id);
    return res.json({ appointments });
  } catch (err) {
    console.error("[getMyAppointments]", err);
    return res.status(500).json({ error: "Failed to load appointments" });
  }
};

/* ------------------------------------------------------------------ */
/* GET /api/appointments/staff                                          */
/* Staff/admin: returns appointments assigned to this staff member      */
/* ------------------------------------------------------------------ */
const getStaffAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentModel.getByStaff(req.user.user_id);
    return res.json({ appointments });
  } catch (err) {
    console.error("[getStaffAppointments]", err);
    return res.status(500).json({ error: "Failed to load appointments" });
  }
};

/* ------------------------------------------------------------------ */
/* GET /api/appointments/all                                            */
/* Admin only: returns all appointments in the system                   */
/* ------------------------------------------------------------------ */
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentModel.getAll();
    return res.json({ appointments });
  } catch (err) {
    console.error("[getAllAppointments]", err);
    return res.status(500).json({ error: "Failed to load appointments" });
  }
};

/* ------------------------------------------------------------------ */
/* GET /api/appointments/staff-list                                     */
/* Returns active staff available for booking                           */
/* ------------------------------------------------------------------ */
const getStaffList = async (req, res) => {
  try {
    const staff = await AppointmentModel.getStaffList();
    return res.json({ staff });
  } catch (err) {
    console.error("[getStaffList]", err);
    return res.status(500).json({ error: "Failed to load staff list" });
  }
};

/* ------------------------------------------------------------------ */
/* PATCH /api/appointments/:id/status                                   */
/* Staff/admin updates status: approved | completed | cancelled         */
/* ------------------------------------------------------------------ */
const updateAppointmentStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const appointmentId = parseInt(req.params.id, 10);
  if (!appointmentId || isNaN(appointmentId)) {
    return res.status(400).json({ error: "Invalid appointment id" });
  }

  const { status } = req.body;

  try {
    const appointment = await AppointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Staff can only update their own appointments; admin can update any
    if (
      req.user.role === "staff" &&
      appointment.staff_id !== req.user.user_id
    ) {
      return res.status(403).json({ error: "Not your appointment" });
    }

    // Patients can only cancel their own pending appointments
    if (req.user.role === "health_user") {
      if (appointment.user_id !== req.user.user_id) {
        return res.status(403).json({ error: "Not your appointment" });
      }
      if (status !== "cancelled") {
        return res
          .status(403)
          .json({ error: "Patients can only cancel appointments" });
      }
      if (appointment.status !== "pending") {
        return res
          .status(400)
          .json({ error: "Only pending appointments can be cancelled" });
      }
    }

    await AppointmentModel.updateStatus(appointmentId, status);
    return res.json({ message: "Status updated", status });
  } catch (err) {
    console.error("[updateAppointmentStatus]", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getStaffAppointments,
  getAllAppointments,
  getStaffList,
  updateAppointmentStatus,
};
