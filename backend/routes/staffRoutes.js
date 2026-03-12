const express = require("express");
const { body } = require("express-validator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  getTeams,
  getTeam,
  getMyTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  getUnassignedStaff,
  getStaffDashboardStats,
  getPatients,
  addPatient,
} = require("../controllers/teamController");

const router = express.Router();

router.use(requireAuth);

router.get("/dashboard", requireRole("staff", "admin"), getStaffDashboardStats);

router.get("/patients", requireRole("staff", "admin"), getPatients);
router.post(
  "/patients",
  requireRole("staff", "admin"),
  [
    body("full_name")
      .trim()
      .notEmpty()
      .withMessage("Full name is required")
      .matches(/^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'.,-]+$/)
      .withMessage("Name contains invalid characters"),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  addPatient,
);

router.get("/teams/my", requireRole("staff", "admin"), getMyTeam);
router.get("/teams/unassigned", requireRole("admin"), getUnassignedStaff);
router.get("/teams", requireRole("staff", "admin"), getTeams);
router.get("/teams/:id", requireRole("staff", "admin"), getTeam);

router.post(
  "/teams",
  requireRole("admin"),
  [body("team_name").trim().notEmpty().withMessage("Team name is required")],
  createTeam,
);
router.put(
  "/teams/:id",
  requireRole("admin"),
  [body("team_name").trim().notEmpty().withMessage("Team name is required")],
  updateTeam,
);
router.delete("/teams/:id", requireRole("admin"), deleteTeam);

module.exports = router;
