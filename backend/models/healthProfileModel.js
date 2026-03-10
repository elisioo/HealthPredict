const db = require("../database/db");

const HealthProfileModel = {
  /** Get health profile for a user */
  async findByUser(userId) {
    const [rows] = await db.query(
      "SELECT * FROM health_profiles WHERE user_id = ? LIMIT 1",
      [userId],
    );
    return rows[0] || null;
  },

  /** Insert or update health profile for a user */
  async upsert(userId, { date_of_birth, gender, height_cm, weight_kg, bmi, smoking_status }) {
    const existing = await this.findByUser(userId);
    if (existing) {
      await db.query(
        `UPDATE health_profiles
         SET date_of_birth = ?, gender = ?, height_cm = ?, weight_kg = ?, bmi = ?, smoking_status = ?
         WHERE user_id = ?`,
        [
          date_of_birth || null,
          gender || null,
          height_cm ?? null,
          weight_kg ?? null,
          bmi ?? null,
          smoking_status || null,
          userId,
        ],
      );
    } else {
      await db.query(
        `INSERT INTO health_profiles (user_id, date_of_birth, gender, height_cm, weight_kg, bmi, smoking_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          date_of_birth || null,
          gender || null,
          height_cm ?? null,
          weight_kg ?? null,
          bmi ?? null,
          smoking_status || null,
        ],
      );
    }
    return this.findByUser(userId);
  },
};

module.exports = HealthProfileModel;
