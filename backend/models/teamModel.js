const db = require("../database/db");

const TeamModel = {

  async create({ team_name, description, created_by }) {
    const [result] = await db.query(
      "INSERT INTO medical_teams (team_name, description, created_by) VALUES (?, ?, ?)",
      [team_name, description || null, created_by],
    );
    return result.insertId;
  },

  async getAll() {
    const [rows] = await db.query(
      `SELECT t.*, u.full_name AS creator_name,
              (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.team_id) AS member_count
       FROM medical_teams t
       JOIN users u ON u.user_id = t.created_by
       ORDER BY t.created_at DESC`,
    );
    return rows;
  },

  async findById(teamId) {
    const [rows] = await db.query(
      `SELECT t.*, u.full_name AS creator_name
       FROM medical_teams t
       JOIN users u ON u.user_id = t.created_by
       WHERE t.team_id = ?`,
      [teamId],
    );
    return rows[0] || null;
  },

  async getMembers(teamId) {
    const [rows] = await db.query(
      `SELECT tm.id, tm.added_at,
              u.user_id, u.full_name, u.email, u.role, u.availability_status
       FROM team_members tm
       JOIN users u ON u.user_id = tm.user_id
       WHERE tm.team_id = ?
       ORDER BY u.full_name ASC`,
      [teamId],
    );
    return rows;
  },

  async getTeamByUser(userId) {
    const [rows] = await db.query(
      `SELECT t.*, u.full_name AS creator_name
       FROM team_members tm
       JOIN medical_teams t ON t.team_id = tm.team_id
       JOIN users u ON u.user_id = t.created_by
       WHERE tm.user_id = ?
       LIMIT 1`,
      [userId],
    );
    return rows[0] || null;
  },

  async addMember(teamId, userId) {

    await db.query("DELETE FROM team_members WHERE user_id = ?", [userId]);
    const [result] = await db.query(
      "INSERT INTO team_members (team_id, user_id) VALUES (?, ?)",
      [teamId, userId],
    );
    return result.insertId;
  },

  async removeMember(teamId, userId) {
    const [result] = await db.query(
      "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
      [teamId, userId],
    );
    return result.affectedRows;
  },

  async setMembers(teamId, userIds) {
    await db.query("DELETE FROM team_members WHERE team_id = ?", [teamId]);
    if (userIds.length === 0) return;

    await db.query("DELETE FROM team_members WHERE user_id IN (?)", [userIds]);
    const values = userIds.map((uid) => [teamId, uid]);
    await db.query("INSERT INTO team_members (team_id, user_id) VALUES ?", [
      values,
    ]);
  },

  async update(teamId, { team_name, description }) {
    await db.query(
      "UPDATE medical_teams SET team_name = ?, description = ? WHERE team_id = ?",
      [team_name, description || null, teamId],
    );
  },

  async delete(teamId) {
    await db.query("DELETE FROM medical_teams WHERE team_id = ?", [teamId]);
  },

  async getUnassignedStaff() {
    const [rows] = await db.query(
      `SELECT u.user_id, u.full_name, u.email, u.role, u.availability_status
       FROM users u
       WHERE u.role IN ('staff', 'admin')
         AND u.is_active = 1
         AND u.user_id NOT IN (SELECT user_id FROM team_members)
       ORDER BY u.full_name ASC`,
    );
    return rows;
  },
};

module.exports = TeamModel;
