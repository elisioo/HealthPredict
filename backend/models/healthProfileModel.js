const db = require("../database/db");
const { encrypt, decrypt } = require("../middleware/encryption");

const ENCRYPTED_FIELDS = ["contact_phone"];

function encryptField(value) {
  if (value === null || value === undefined || value === "") return null;
  return JSON.stringify(encrypt(String(value)));
}

function decryptField(value) {
  if (value === null || value === undefined) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && parsed.iv && parsed.tag && parsed.data) {
      return decrypt(parsed);
    }
    return value;
  } catch {
    return value;
  }
}

function decryptProfile(row) {
  if (!row) return null;
  const result = { ...row };
  for (const field of ENCRYPTED_FIELDS) {
    if (field in result) result[field] = decryptField(result[field]);
  }
  return result;
}

const HealthProfileModel = {

  async findByUser(userId) {
    const [rows] = await db.query(
      "SELECT * FROM health_profiles WHERE user_id = ? LIMIT 1",
      [userId],
    );
    return decryptProfile(rows[0]) || null;
  },

  async upsert(
    userId,
    {
      date_of_birth,
      gender,
      height_cm,
      weight_kg,
      bmi,
      smoking_status,
      contact_phone,
    },
  ) {
    const existing = await this._findRaw(userId);
    const params = [
      date_of_birth || null,
      gender || null,
      height_cm ?? null,
      weight_kg ?? null,
      bmi ?? null,
      smoking_status || null,
      encryptField(contact_phone || null),
    ];

    if (existing) {
      await db.query(
        `UPDATE health_profiles
         SET date_of_birth = ?, gender = ?, height_cm = ?, weight_kg = ?, bmi = ?, smoking_status = ?, contact_phone = ?
         WHERE user_id = ?`,
        [...params, userId],
      );
    } else {
      await db.query(
        `INSERT INTO health_profiles (user_id, date_of_birth, gender, height_cm, weight_kg, bmi, smoking_status, contact_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, ...params],
      );
    }
    return this.findByUser(userId);
  },

  async _findRaw(userId) {
    const [rows] = await db.query(
      "SELECT profile_id FROM health_profiles WHERE user_id = ? LIMIT 1",
      [userId],
    );
    return rows[0] || null;
  },
};

module.exports = HealthProfileModel;
