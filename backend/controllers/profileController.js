const { validationResult } = require("express-validator");
const HealthProfileModel = require("../models/healthProfileModel");
const UserModel = require("../models/userModel");

const getHealthProfile = async (req, res) => {
  try {
    const profile = await HealthProfileModel.findByUser(req.user.user_id);
    return res.json({ profile: profile || null });
  } catch (err) {
    console.error("[getHealthProfile]", err);
    return res.status(500).json({ error: "Failed to load health profile" });
  }
};

const updateHealthProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    date_of_birth,
    gender,
    height_cm,
    weight_kg,
    bmi,
    smoking_status,
    contact_phone,
  } = req.body;

  try {
    const profile = await HealthProfileModel.upsert(req.user.user_id, {
      date_of_birth: date_of_birth || null,
      gender: gender || null,
      height_cm: height_cm ? parseFloat(height_cm) : null,
      weight_kg: weight_kg ? parseFloat(weight_kg) : null,
      bmi: bmi ? parseFloat(bmi) : null,
      smoking_status: smoking_status || null,
      contact_phone: contact_phone || null,
    });
    return res.json({ profile });
  } catch (err) {
    console.error("[updateHealthProfile]", err);
    return res.status(500).json({ error: "Failed to update health profile" });
  }
};

const updatePhone = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { phone } = req.body;
  try {
    await UserModel.updatePhone(req.user.user_id, phone || null);
    return res.json({
      message: "Phone number updated successfully",
      phone: phone || null,
    });
  } catch (err) {
    console.error("[updatePhone]", err);
    return res.status(500).json({ error: "Failed to update phone number" });
  }
};

module.exports = { getHealthProfile, updateHealthProfile, updatePhone };
