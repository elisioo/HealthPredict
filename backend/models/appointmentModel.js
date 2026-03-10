const db = require("../database/db");

const AppointmentModel = {
  /** Patient books a new appointment */
  async create({ user_id, staff_id, appointment_date, notes }) {
    const [result] = await db.query(
      `INSERT INTO appointments (user_id, staff_id, appointment_date, notes)
       VALUES (?, ?, ?, ?)`,
      [user_id, staff_id, appointment_date, notes || null],
    );
    return result.insertId;
  },

  /** Get all appointments for a specific patient */
  async getByUser(userId) {
    const [rows] = await db.query(
      `SELECT
         a.appointment_id, a.user_id, a.staff_id,
         a.appointment_date, a.status, a.notes, a.created_at,
         u.full_name AS staff_name
       FROM appointments a
       JOIN users u ON u.user_id = a.staff_id
       WHERE a.user_id = ?
       ORDER BY a.appointment_date DESC`,
      [userId],
    );
    return rows;
  },

  /** Get all appointments assigned to a specific staff member */
  async getByStaff(staffId) {
    const [rows] = await db.query(
      `SELECT
         a.appointment_id, a.user_id, a.staff_id,
         a.appointment_date, a.status, a.notes, a.created_at,
         u.full_name AS patient_name
       FROM appointments a
       JOIN users u ON u.user_id = a.user_id
       WHERE a.staff_id = ?
       ORDER BY a.appointment_date DESC`,
      [staffId],
    );
    return rows;
  },

  /** Admin — get all appointments across the system */
  async getAll() {
    const [rows] = await db.query(
      `SELECT
         a.appointment_id, a.user_id, a.staff_id,
         a.appointment_date, a.status, a.notes, a.created_at,
         p.full_name AS patient_name,
         s.full_name AS staff_name
       FROM appointments a
       JOIN users p ON p.user_id = a.user_id
       JOIN users s ON s.user_id = a.staff_id
       ORDER BY a.appointment_date DESC`,
    );
    return rows;
  },

  /** Get list of active staff/admin available for booking */
  async getStaffList() {
    const [rows] = await db.query(
      `SELECT user_id, full_name, role, availability_status
       FROM users
       WHERE role IN ('staff', 'admin') AND is_active = 1
       ORDER BY full_name ASC`,
    );
    return rows;
  },

  /** Find a single appointment by id */
  async findById(appointmentId) {
    const [rows] = await db.query(
      `SELECT * FROM appointments WHERE appointment_id = ?`,
      [appointmentId],
    );
    return rows[0] || null;
  },

  /** Update appointment status */
  async updateStatus(appointmentId, status) {
    const [result] = await db.query(
      `UPDATE appointments SET status = ? WHERE appointment_id = ?`,
      [status, appointmentId],
    );
    return result.affectedRows;
  },
};

module.exports = AppointmentModel;
