const { validationResult } = require("express-validator");
const UserModel = require("../models/userModel");
const db = require("../database/db");
const { logAction } = require("../middleware/auditLogger");

const getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit, 10) || 10),
    );

    const { rows, total } = await UserModel.getAll({
      search,
      role,
      status,
      page,
      limit,
    });
    return res.json({
      users: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[getUsers]", err);
    return res.status(500).json({ error: "Failed to load users" });
  }
};

const getStats = async (req, res) => {
  try {
    const userStats = await UserModel.getStats();

    const [[predStats]] = await db.query(
      `SELECT COUNT(*) AS total,
              SUM(risk_level = 'high')     AS high_risk,
              SUM(risk_level = 'moderate') AS moderate_risk,
              SUM(risk_level = 'low')      AS low_risk
       FROM predictions`,
    );

    const [[todayStats]] = await db.query(
      `SELECT COUNT(*) AS predictions_today FROM predictions
       WHERE DATE(created_at) = CURDATE()`,
    );
    const [[newUsersToday]] = await db.query(
      `SELECT COUNT(*) AS new_users_today FROM users
       WHERE DATE(created_at) = CURDATE()`,
    );

    const [[logCount]] = await db.query(
      "SELECT COUNT(*) AS total FROM system_logs",
    );

    const [monthlyTrends] = await db.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
              COUNT(*) AS count
       FROM predictions
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
       GROUP BY month
       ORDER BY month`,
    );

    const [[avgProb]] = await db.query(
      `SELECT AVG(probability) AS avg_probability FROM predictions WHERE probability IS NOT NULL`,
    );

    return res.json({
      users: userStats,
      predictions: {
        total: predStats.total,
        high_risk: predStats.high_risk || 0,
        moderate_risk: predStats.moderate_risk || 0,
        low_risk: predStats.low_risk || 0,
        avg_probability:
          avgProb.avg_probability != null
            ? parseFloat(avgProb.avg_probability)
            : null,
      },
      today: {
        predictions: todayStats.predictions_today,
        new_users: newUsersToday.new_users_today,
      },
      monthly_trends: monthlyTrends,
      logs: logCount.total,
    });
  } catch (err) {
    console.error("[getStats]", err);
    return res.status(500).json({ error: "Failed to load stats" });
  }
};

const activateUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!userId) return res.status(400).json({ error: "Invalid user id" });

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    await UserModel.setActive(userId, true);
    await UserModel.cancelScheduledDelete(userId);

    await logAction(
      req,
      "activate_user",
      `Activated user #${userId} (${user.email})`,
    );
    return res.json({ message: "User activated" });
  } catch (err) {
    console.error("[activateUser]", err);
    return res.status(500).json({ error: "Failed to activate user" });
  }
};

const deactivateUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!userId) return res.status(400).json({ error: "Invalid user id" });

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.user_id === req.user.user_id) {
      return res.status(400).json({ error: "Cannot deactivate yourself" });
    }

    await UserModel.setActive(userId, false);
    await logAction(
      req,
      "deactivate_user",
      `Deactivated user #${userId} (${user.email})`,
    );
    return res.json({ message: "User deactivated" });
  } catch (err) {
    console.error("[deactivateUser]", err);
    return res.status(500).json({ error: "Failed to deactivate user" });
  }
};

const changeRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const userId = parseInt(req.params.id, 10);
  if (!userId) return res.status(400).json({ error: "Invalid user id" });

  const { role } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.user_id === req.user.user_id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }

    await UserModel.updateRole(userId, role);
    await logAction(
      req,
      "change_role",
      `Changed user #${userId} role to ${role}`,
    );
    return res.json({ message: "Role updated" });
  } catch (err) {
    console.error("[changeRole]", err);
    return res.status(500).json({ error: "Failed to change role" });
  }
};

const scheduleDeleteUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!userId) return res.status(400).json({ error: "Invalid user id" });

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.user_id === req.user.user_id) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    await UserModel.scheduleDelete(userId);
    await logAction(
      req,
      "schedule_delete",
      `Scheduled deletion for user #${userId} (${user.email})`,
    );
    return res.json({
      message:
        "User scheduled for permanent deletion in 1 minute. Activate the user to cancel.",
    });
  } catch (err) {
    console.error("[scheduleDeleteUser]", err);
    return res.status(500).json({ error: "Failed to schedule deletion" });
  }
};

const getLogs = async (req, res) => {
  try {
    const { search, type, limit: rawLimit } = req.query;
    const limit = Math.min(parseInt(rawLimit, 10) || 100, 500);

    if (search && search.length > 200) {
      return res
        .status(400)
        .json({ error: "Search term too long (max 200 chars)" });
    }

    let sql = `SELECT l.log_id, l.action_type, l.ip_address, l.description, l.created_at,
                      u.full_name AS user_name
               FROM system_logs l
               LEFT JOIN users u ON u.user_id = l.user_id
               WHERE 1=1`;
    const params = [];

    if (search) {
      sql += " AND (l.description LIKE ? OR u.full_name LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like);
    }
    if (type) {
      sql += " AND l.action_type = ?";
      params.push(type);
    }

    sql += " ORDER BY l.created_at DESC LIMIT ?";
    params.push(limit);

    const [rows] = await db.query(sql, params);
    return res.json({ logs: rows });
  } catch (err) {
    console.error("[getLogs]", err);
    return res.status(500).json({ error: "Failed to load logs" });
  }
};

const getActivity = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT l.log_id, l.action_type, l.ip_address, l.description, l.created_at,
              u.full_name AS user_name, u.role AS user_role
       FROM system_logs l
       LEFT JOIN users u ON u.user_id = l.user_id
       ORDER BY l.created_at DESC
       LIMIT 50`,
    );
    return res.json({ activity: rows });
  } catch (err) {
    console.error("[getActivity]", err);
    return res.status(500).json({ error: "Failed to load activity" });
  }
};

const getLockedAccounts = async (req, res) => {
  try {
    const accounts = await UserModel.getLockedAccounts();
    return res.json({ accounts });
  } catch (err) {
    console.error("[getLockedAccounts]", err);
    return res.status(500).json({ error: "Failed to load locked accounts" });
  }
};

const unlockUser = async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!userId) return res.status(400).json({ error: "Invalid user id" });

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    await UserModel.unlockAccount(userId);
    await logAction(
      req,
      "unlock_account",
      `Unlocked account for user #${userId} (${user.email})`,
    );
    return res.json({ message: "Account unlocked" });
  } catch (err) {
    console.error("[unlockUser]", err);
    return res.status(500).json({ error: "Failed to unlock account" });
  }
};

const getAllPredictions = async (req, res) => {
  try {
    const { search, risk, from, to, limit: rawLimit } = req.query;
    const limit = Math.min(parseInt(rawLimit, 10) || 500, 2000);

    if (search && search.length > 200) {
      return res
        .status(400)
        .json({ error: "Search term too long (max 200 chars)" });
    }

    if (risk && !["low", "moderate", "high"].includes(risk)) {
      return res.status(400).json({ error: "Invalid risk level filter" });
    }

    if (from && !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
      return res
        .status(400)
        .json({ error: "Invalid 'from' date format (YYYY-MM-DD)" });
    }
    if (to && !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      return res
        .status(400)
        .json({ error: "Invalid 'to' date format (YYYY-MM-DD)" });
    }

    let sql = `SELECT p.*,
                      u.full_name AS user_name, u.email AS user_email,
                      pb.full_name AS predicted_by_name
               FROM predictions p
               JOIN users u ON u.user_id = p.user_id
               LEFT JOIN users pb ON pb.user_id = p.predicted_by
               WHERE 1=1`;
    const params = [];

    if (search) {
      sql += " AND (u.full_name LIKE ? OR u.email LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like);
    }
    if (risk) {
      sql += " AND p.risk_level = ?";
      params.push(risk);
    }
    if (from) {
      sql += " AND DATE(p.created_at) >= ?";
      params.push(from);
    }
    if (to) {
      sql += " AND DATE(p.created_at) <= ?";
      params.push(to);
    }

    sql += " ORDER BY p.created_at DESC LIMIT ?";
    params.push(limit);

    const [rows] = await db.query(sql, params);
    return res.json({ predictions: rows });
  } catch (err) {
    console.error("[getAllPredictions]", err);
    return res.status(500).json({ error: "Failed to load predictions" });
  }
};

const getMessageThreads = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
         LEAST(m.sender_id, m.receiver_id)    AS user1_id,
         GREATEST(m.sender_id, m.receiver_id) AS user2_id,
         COUNT(*)                             AS message_count,
         SUM(m.is_read = 0)                   AS unread_count,
         MAX(m.sent_at)                       AS last_message_at,
         u1.full_name AS user1_name, u1.role AS user1_role,
         u2.full_name AS user2_name, u2.role AS user2_role
       FROM messages m
       JOIN users u1 ON u1.user_id = LEAST(m.sender_id, m.receiver_id)
       JOIN users u2 ON u2.user_id = GREATEST(m.sender_id, m.receiver_id)
       GROUP BY LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)
       ORDER BY last_message_at DESC
       LIMIT 200`,
    );
    return res.json({ threads: rows });
  } catch (err) {
    console.error("[getMessageThreads]", err);
    return res.status(500).json({ error: "Failed to load message threads" });
  }
};

const getAdminConversation = async (req, res) => {
  const u1 = parseInt(req.params.userId1, 10);
  const u2 = parseInt(req.params.userId2, 10);
  if (!u1 || !u2) return res.status(400).json({ error: "Invalid user ids" });
  try {
    const [rows] = await db.query(
      `SELECT m.*, s.full_name AS sender_name, s.role AS sender_role
       FROM messages m
       JOIN users s ON s.user_id = m.sender_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.sent_at ASC`,
      [u1, u2, u2, u1],
    );
    return res.json({ messages: rows });
  } catch (err) {
    console.error("[getAdminConversation]", err);
    return res.status(500).json({ error: "Failed to load conversation" });
  }
};

const deleteAdminMessage = async (req, res) => {
  const msgId = parseInt(req.params.messageId, 10);
  if (!msgId) return res.status(400).json({ error: "Invalid message id" });
  try {
    const [[msg]] = await db.query(
      "SELECT message_id FROM messages WHERE message_id = ?",
      [msgId],
    );
    if (!msg) return res.status(404).json({ error: "Message not found" });
    await db.query("DELETE FROM messages WHERE message_id = ?", [msgId]);
    await logAction(req, "delete_message", `Deleted message #${msgId}`);
    return res.json({ message: "Message deleted" });
  } catch (err) {
    console.error("[deleteAdminMessage]", err);
    return res.status(500).json({ error: "Failed to delete message" });
  }
};

const deleteAdminThread = async (req, res) => {
  const u1 = parseInt(req.params.userId1, 10);
  const u2 = parseInt(req.params.userId2, 10);
  if (!u1 || !u2) return res.status(400).json({ error: "Invalid user ids" });
  try {
    const [result] = await db.query(
      "DELETE FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
      [u1, u2, u2, u1],
    );
    await logAction(
      req,
      "delete_thread",
      `Deleted conversation between users #${u1} and #${u2} (${result.affectedRows} messages)`,
    );
    return res.json({ message: `Deleted ${result.affectedRows} messages` });
  } catch (err) {
    console.error("[deleteAdminThread]", err);
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
};

const processDeletions = async () => {
  try {
    const due = await UserModel.getDueForDeletion();
    for (const { user_id } of due) {
      await UserModel.permanentDelete(user_id);
      console.log(`[deletionWorker] Permanently deleted user #${user_id}`);
    }
  } catch (err) {
    console.error("[deletionWorker]", err);
  }
};

module.exports = {
  getUsers,
  getStats,
  activateUser,
  deactivateUser,
  changeRole,
  scheduleDeleteUser,
  getLogs,
  getActivity,
  getAllPredictions,
  getMessageThreads,
  getAdminConversation,
  deleteAdminMessage,
  deleteAdminThread,
  getLockedAccounts,
  unlockUser,
  processDeletions,
};
