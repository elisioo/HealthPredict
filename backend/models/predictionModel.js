const db = require("../database/db");

const PredictionModel = {
  /** Get all predictions made by or for a specific user, newest first */
  async getByUser(userId) {
    const [rows] = await db.query(
      `SELECT
        prediction_id, user_id, gender, age, hypertension,
        heart_disease, smoking_history, bmi, HbA1c_level,
        blood_glucose_level, diabetes_result, risk_level,
        probability, created_at
       FROM predictions
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId],
    );
    return rows;
  },
};

module.exports = PredictionModel;
