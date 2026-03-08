const db = require("../database/db");

/**
 * User Model — pure data-access layer (no business logic)
 */
const UserModel = {
  /** Find a user by email */
  async findByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    return rows[0] || null;
  },

  /** Find a user by id */
  async findById(id) {
    const [rows] = await db.query(
      "SELECT user_id, full_name, email, role, phone, is_active, availability_status, created_at FROM users WHERE user_id = ? LIMIT 1",
      [id],
    );
    return rows[0] || null;
  },

  /** Create a new user; returns insertId */
  async create({ full_name, first_name, last_name, m_i, email, password_hash, role, phone }) {
    const [result] = await db.query(
      "INSERT INTO users (full_name, first_name, last_name, m_i, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [full_name, first_name, last_name, m_i || null, email, password_hash, role, phone || null],
    );
    return result.insertId;
  },

  /** Check if email already exists */
  async emailExists(email) {
    const [rows] = await db.query(
      "SELECT user_id FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    return rows.length > 0;
  },

  /** Update last login (optional audit) */
  async updateLastSeen(userId) {
    await db.query("UPDATE users SET updated_at = NOW() WHERE user_id = ?", [
      userId,
    ]);
  },

  /** Set staff availability status */
  async updateAvailability(userId, status) {
    await db.query(
      "UPDATE users SET availability_status = ? WHERE user_id = ? AND role = 'staff'",
      [status, userId],
    );
  },

  /** Get current availability status */
  async getAvailability(userId) {
    const [rows] = await db.query(
      "SELECT availability_status FROM users WHERE user_id = ? LIMIT 1",
      [userId],
    );
    return rows[0]?.availability_status ?? 'available';
  },
};

module.exports = UserModel;
