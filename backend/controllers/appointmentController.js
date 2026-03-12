const { validationResult } = require("express-validator");
const AppointmentModel = require("../models/appointmentModel");

const bookAppointment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { staff_id, appointment_date, notes } = req.body;

  if (req.user.role !== "health_user") {
    return res
      .status(403)
      .json({ error: "Only patients can book appointments" });
  }

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

const getMyAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentModel.getByUser(req.user.user_id);
    return res.json({ appointments });
  } catch (err) {
    console.error("[getMyAppointments]", err);
    return res.status(500).json({ error: "Failed to load appointments" });
  }
};

const getStaffAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentModel.getByStaff(req.user.user_id);
    return res.json({ appointments });
  } catch (err) {
    console.error("[getStaffAppointments]", err);
    return res.status(500).json({ error: "Failed to load appointments" });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    const appointments = await AppointmentModel.getAll();
    return res.json({ appointments });
  } catch (err) {
    console.error("[getAllAppointments]", err);
    return res.status(500).json({ error: "Failed to load appointments" });
  }
};

const getStaffList = async (req, res) => {
  try {
    const staff = await AppointmentModel.getStaffList();
    return res.json({ staff });
  } catch (err) {
    console.error("[getStaffList]", err);
    return res.status(500).json({ error: "Failed to load staff list" });
  }
};

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

    if (
      req.user.role === "staff" &&
      appointment.staff_id !== req.user.user_id
    ) {
      return res.status(403).json({ error: "Not your appointment" });
    }

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
