const express = require("express");
const { body } = require("express-validator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  bookAppointment,
  getMyAppointments,
  getStaffAppointments,
  getAllAppointments,
  getStaffList,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

// All appointment routes require authentication
router.use(requireAuth);

// GET /api/appointments/staff-list  — active staff available for booking
router.get("/staff-list", getStaffList);

// GET /api/appointments/my  — patient: view own appointments
router.get("/my", requireRole("health_user"), getMyAppointments);

// GET /api/appointments/staff  — staff/admin: view their assigned appointments
router.get("/staff", requireRole("admin", "staff"), getStaffAppointments);

// GET /api/appointments/all  — admin only: all appointments in system
router.get("/all", requireRole("admin"), getAllAppointments);

// POST /api/appointments  — patient books an appointment
router.post(
  "/",
  [
    body("staff_id")
      .isInt({ min: 1 })
      .withMessage("Please select a staff member"),
    body("appointment_date")
      .isISO8601()
      .withMessage("Invalid appointment date"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes too long (max 500 chars)"),
  ],
  bookAppointment,
);

// PATCH /api/appointments/:id/status  — update an appointment's status
router.patch(
  "/:id/status",
  [
    body("status")
      .isIn(["approved", "completed", "cancelled"])
      .withMessage("Invalid status value"),
  ],
  updateAppointmentStatus,
);

module.exports = router;
