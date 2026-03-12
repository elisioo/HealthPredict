const { validationResult } = require("express-validator");
const TeamModel = require("../models/teamModel");
const UserModel = require("../models/userModel");
const db = require("../database/db");
const { logAction } = require("../middleware/auditLogger");

const getTeams = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const teams = await TeamModel.getAll();
      return res.json({ teams });
    }
    const team = await TeamModel.getTeamByUser(req.user.user_id);
    return res.json({ teams: team ? [team] : [] });
  } catch (err) {
    console.error("[getTeams]", err);
    return res.status(500).json({ error: "Failed to load teams" });
  }
};

const getTeam = async (req, res) => {
  const teamId = parseInt(req.params.id, 10);
  if (!teamId) return res.status(400).json({ error: "Invalid team id" });

  try {
    const team = await TeamModel.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const members = await TeamModel.getMembers(teamId);
    return res.json({ team, members });
  } catch (err) {
    console.error("[getTeam]", err);
    return res.status(500).json({ error: "Failed to load team" });
  }
};

const getMyTeam = async (req, res) => {
  try {
    const team = await TeamModel.getTeamByUser(req.user.user_id);
    if (!team) return res.json({ team: null, members: [] });

    const members = await TeamModel.getMembers(team.team_id);
    return res.json({ team, members });
  } catch (err) {
    console.error("[getMyTeam]", err);
    return res.status(500).json({ error: "Failed to load your team" });
  }
};

const createTeam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { team_name, description, member_ids } = req.body;

  try {
    const teamId = await TeamModel.create({
      team_name,
      description,
      created_by: req.user.user_id,
    });

    if (Array.isArray(member_ids) && member_ids.length > 0) {
      await TeamModel.setMembers(teamId, member_ids.map(Number));
    }

    await logAction(
      req,
      "team_created",
      `Created team "${team_name}" (#${teamId})`,
    );
    return res.status(201).json({ message: "Team created", team_id: teamId });
  } catch (err) {
    console.error("[createTeam]", err);
    return res.status(500).json({ error: "Failed to create team" });
  }
};

const updateTeam = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const teamId = parseInt(req.params.id, 10);
  if (!teamId) return res.status(400).json({ error: "Invalid team id" });

  const { team_name, description, member_ids } = req.body;

  try {
    const team = await TeamModel.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    await TeamModel.update(teamId, { team_name, description });

    if (Array.isArray(member_ids)) {
      await TeamModel.setMembers(teamId, member_ids.map(Number));
    }

    await logAction(
      req,
      "team_updated",
      `Updated team "${team_name}" (#${teamId})`,
    );
    return res.json({ message: "Team updated" });
  } catch (err) {
    console.error("[updateTeam]", err);
    return res.status(500).json({ error: "Failed to update team" });
  }
};

const deleteTeam = async (req, res) => {
  const teamId = parseInt(req.params.id, 10);
  if (!teamId) return res.status(400).json({ error: "Invalid team id" });

  try {
    const team = await TeamModel.findById(teamId);
    if (!team) return res.status(404).json({ error: "Team not found" });

    await TeamModel.delete(teamId);
    await logAction(
      req,
      "team_deleted",
      `Deleted team "${team.team_name}" (#${teamId})`,
    );
    return res.json({ message: "Team deleted" });
  } catch (err) {
    console.error("[deleteTeam]", err);
    return res.status(500).json({ error: "Failed to delete team" });
  }
};

const getUnassignedStaff = async (req, res) => {
  try {
    const staff = await TeamModel.getUnassignedStaff();
    return res.json({ staff });
  } catch (err) {
    console.error("[getUnassignedStaff]", err);
    return res.status(500).json({ error: "Failed to load unassigned staff" });
  }
};

const getStaffDashboardStats = async (req, res) => {
  try {
    const staffId = req.user.user_id;

    const [[{ total_patients }]] = await db.query(
      "SELECT COUNT(*) AS total_patients FROM users WHERE role = 'health_user' AND is_active = 1",
    );

    const [[{ high_risk }]] = await db.query(
      `SELECT COUNT(DISTINCT user_id) AS high_risk
       FROM predictions WHERE risk_level = 'high'`,
    );

    const [[{ predictions_today }]] = await db.query(
      "SELECT COUNT(*) AS predictions_today FROM predictions WHERE DATE(created_at) = CURDATE()",
    );

    const [[{ appointments_today }]] = await db.query(
      `SELECT COUNT(*) AS appointments_today FROM appointments
       WHERE staff_id = ? AND DATE(appointment_date) = CURDATE()`,
      [staffId],
    );

    const [recentPatients] = await db.query(
      `SELECT u.user_id, u.full_name, p.risk_level, p.probability, p.created_at
       FROM predictions p
       JOIN users u ON u.user_id = p.user_id
       WHERE p.prediction_id IN (
         SELECT MAX(prediction_id) FROM predictions GROUP BY user_id
       )
       ORDER BY p.created_at DESC
       LIMIT 5`,
    );

    const [recentAssessments] = await db.query(
      `SELECT p.prediction_id, p.user_id, u.full_name, p.gender, p.age,
              p.bmi, p.HbA1c_level, p.blood_glucose_level, p.risk_level,
              p.probability, p.created_at
       FROM predictions p
       JOIN users u ON u.user_id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT 10`,
    );

    const [upcomingAppointments] = await db.query(
      `SELECT a.appointment_id, a.appointment_date, a.status, a.notes,
              u.full_name AS patient_name
       FROM appointments a
       JOIN users u ON u.user_id = a.user_id
       WHERE a.staff_id = ? AND a.appointment_date >= NOW()
       ORDER BY a.appointment_date ASC
       LIMIT 5`,
      [staffId],
    );

    return res.json({
      stats: {
        total_patients,
        high_risk,
        predictions_today,
        appointments_today,
      },
      recentPatients,
      recentAssessments,
      upcomingAppointments,
    });
  } catch (err) {
    console.error("[getStaffDashboardStats]", err);
    return res.status(500).json({ error: "Failed to load dashboard stats" });
  }
};

const getPatients = async (req, res) => {
  try {
    const { search, risk } = req.query;

    let sql = `
      SELECT u.user_id, u.full_name, u.email, u.phone, u.created_at,
             p.prediction_id, p.age, p.risk_level, p.probability, p.created_at AS last_prediction_date
      FROM users u
      LEFT JOIN predictions p ON p.user_id = u.user_id
        AND p.prediction_id = (SELECT MAX(p2.prediction_id) FROM predictions p2 WHERE p2.user_id = u.user_id)
      WHERE u.role = 'health_user' AND u.is_active = 1
    `;
    const params = [];

    if (search) {
      sql += " AND (u.full_name LIKE ? OR u.email LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like);
    }
    if (risk && risk !== "all") {
      sql += " AND p.risk_level = ?";
      params.push(risk);
    }

    sql += " ORDER BY u.full_name ASC";

    const [rows] = await db.query(sql, params);
    return res.json({ patients: rows });
  } catch (err) {
    console.error("[getPatients]", err);
    return res.status(500).json({ error: "Failed to load patients" });
  }
};

const addPatient = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { full_name, first_name, last_name, m_i, email, phone } = req.body;

  try {
    const exists = await UserModel.emailExists(email);
    if (exists) return res.status(409).json({ error: "Email already exists" });

    const bcrypt = require("bcryptjs");
    const defaultPass = (last_name || "User").slice(0, 3) + "2026!";
    const password_hash = await bcrypt.hash(defaultPass, 12);

    const userId = await UserModel.create({
      full_name,
      first_name: first_name || full_name.split(" ")[0],
      last_name: last_name || full_name.split(" ").slice(1).join(" ") || "",
      m_i: m_i || null,
      email,
      password_hash,
      role: "health_user",
      phone: phone || null,
    });

    await logAction(
      req,
      "patient_added",
      `Staff added patient "${full_name}" (#${userId})`,
    );

    return res.status(201).json({
      message: "Patient registered",
      user_id: userId,
      default_password: defaultPass,
    });
  } catch (err) {
    console.error("[addPatient]", err);
    return res.status(500).json({ error: "Failed to add patient" });
  }
};

module.exports = {
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
};
