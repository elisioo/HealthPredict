/**
 * Audit logger — records security-relevant events to system_logs.
 * Centralised module so any controller can log without importing db directly.
 */

const db = require("../database/db");

/**
 * Write an entry to system_logs.
 * @param {object} req        — Express request (used for user + IP)
 * @param {string} actionType — Event type identifier
 * @param {string} description — Human-readable description
 */
async function logAction(req, actionType, description) {
  const userId = req.user?.user_id || null;
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  try {
    await db.query(
      "INSERT INTO system_logs (user_id, action_type, ip_address, description) VALUES (?, ?, ?, ?)",
      [userId, actionType, ip, description],
    );
  } catch (err) {
    console.error("[auditLogger]", err);
  }
}

module.exports = { logAction };
