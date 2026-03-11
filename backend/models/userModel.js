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
  async create({
    full_name,
    first_name,
    last_name,
    m_i,
    email,
    password_hash,
    role,
    phone,
  }) {
    const [result] = await db.query(
      "INSERT INTO users (full_name, first_name, last_name, m_i, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        full_name,
        first_name,
        last_name,
        m_i || null,
        email,
        password_hash,
        role,
        phone || null,
      ],
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
    return rows[0]?.availability_status ?? "available";
  },

  /* ---------------------------------------------------------------- */
  /* Admin-only data access                                            */
  /* ---------------------------------------------------------------- */

  /** Get all users with optional filters */
  async getAll({ search, role, status } = {}) {
    let sql = `SELECT user_id, full_name, email, role, phone, is_active,
                      login_attempts, locked_until,
                      availability_status, created_at, updated_at
               FROM users WHERE 1=1`;
    const params = [];

    if (search) {
      sql += " AND (full_name LIKE ? OR email LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like);
    }
    if (role) {
      sql += " AND role = ?";
      params.push(role);
    }
    if (status === "active") {
      sql += " AND is_active = 1";
    } else if (status === "inactive") {
      sql += " AND is_active = 0";
    }

    sql += " ORDER BY created_at DESC";
    const [rows] = await db.query(sql, params);
    return rows;
  },

  /** Admin stats — counts per role and active status */
  async getStats() {
    const [rows] = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(role = 'health_user')  AS patients,
         SUM(role = 'staff')        AS staff,
         SUM(role = 'admin')        AS admins,
         SUM(is_active = 1)         AS active,
         SUM(is_active = 0)         AS inactive,
         SUM(locked_until IS NOT NULL AND locked_until > NOW()) AS locked
       FROM users`,
    );
    return rows[0];
  },

  /** Activate or deactivate a user */
  async setActive(userId, isActive) {
    const [result] = await db.query(
      "UPDATE users SET is_active = ? WHERE user_id = ?",
      [isActive ? 1 : 0, userId],
    );
    return result.affectedRows;
  },

  /** Update a user's role */
  async updateRole(userId, role) {
    const [result] = await db.query(
      "UPDATE users SET role = ? WHERE user_id = ?",
      [role, userId],
    );
    return result.affectedRows;
  },

  /** Permanently delete a user and all related data */
  async permanentDelete(userId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        "DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?",
        [userId, userId],
      );
      await conn.query("DELETE FROM predictions WHERE user_id = ?", [userId]);
      await conn.query("DELETE FROM health_profiles WHERE user_id = ?", [
        userId,
      ]);
      await conn.query(
        "DELETE FROM appointments WHERE user_id = ? OR staff_id = ?",
        [userId, userId],
      );
      await conn.query("DELETE FROM users WHERE user_id = ?", [userId]);
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /** Mark a user for scheduled deletion (sets is_active = 0 + scheduled_delete_at) */
  async scheduleDelete(userId) {
    const deleteAt = new Date(Date.now() + 60 * 1000); // 1 minute from now
    const [result] = await db.query(
      "UPDATE users SET is_active = 0, scheduled_delete_at = ? WHERE user_id = ?",
      [deleteAt, userId],
    );
    return result.affectedRows;
  },

  /** Cancel a pending scheduled deletion */
  async cancelScheduledDelete(userId) {
    const [result] = await db.query(
      "UPDATE users SET scheduled_delete_at = NULL WHERE user_id = ?",
      [userId],
    );
    return result.affectedRows;
  },

  /** Get all users whose scheduled deletion time has passed */
  async getDueForDeletion() {
    const [rows] = await db.query(
      "SELECT user_id FROM users WHERE scheduled_delete_at IS NOT NULL AND scheduled_delete_at <= NOW()",
    );
    return rows;
  },

  /* ---------------------------------------------------------------- */
  /* Login attempt / lockout helpers                                   */
  /* ---------------------------------------------------------------- */

  /** Max consecutive failures before lockout */
  MAX_ATTEMPTS: 5,

  /** Lockout duration in milliseconds (1 minute — testing only) */
  LOCKOUT_MS: 1 * 60 * 1000,

  /**
   * Increment the failed login counter.
   * If the counter reaches MAX_ATTEMPTS, set locked_until.
   * Returns the new attempt count.
   */
  async recordFailedAttempt(userId) {
    const lockoutAt = new Date(Date.now() + UserModel.LOCKOUT_MS);

    await db.query(
      `UPDATE users
          SET login_attempts = login_attempts + 1,
              locked_until   = CASE
                WHEN (login_attempts + 1) >= ? THEN ?
                ELSE locked_until
              END
        WHERE user_id = ?`,
      [UserModel.MAX_ATTEMPTS, lockoutAt, userId],
    );

    const [[row]] = await db.query(
      "SELECT login_attempts, locked_until FROM users WHERE user_id = ?",
      [userId],
    );
    return row;
  },

  async resetLoginAttempts(userId) {
    await db.query(
      "UPDATE users SET login_attempts = 0, locked_until = NULL WHERE user_id = ?",
      [userId],
    );
  },

  async unlockAccount(userId) {
    await db.query(
      "UPDATE users SET login_attempts = 0, locked_until = NULL WHERE user_id = ?",
      [userId],
    );
  },

  /** Update a user's password hash */
  async updatePassword(userId, passwordHash) {
    await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
      passwordHash,
      userId,
    ]);
  },

  async getLockedAccounts() {
    const [rows] = await db.query(
      `SELECT user_id, full_name, email, role, login_attempts, locked_until
         FROM users
        WHERE locked_until IS NOT NULL AND locked_until > NOW()
        ORDER BY locked_until ASC`,
    );
    return rows;
  },
};

module.exports = UserModel;
