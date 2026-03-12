const express = require("express");
const { body } = require("express-validator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const { appointmentLimiter } = require("../middleware/rateLimitMiddleware");
const {
  bookAppointment,
  getMyAppointments,
  getStaffAppointments,
  getAllAppointments,
  getStaffList,
  updateAppointmentStatus,
} = require("../controllers/appointmentController");

const router = express.Router();

router.use(requireAuth);

router.get("/staff-list", getStaffList);

router.get("/my", requireRole("health_user"), getMyAppointments);

router.get("/staff", requireRole("admin", "staff"), getStaffAppointments);

router.get("/all", requireRole("admin"), getAllAppointments);

router.post(
  "/",
  appointmentLimiter,
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
