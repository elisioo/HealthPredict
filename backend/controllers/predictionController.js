const PredictionModel = require("../models/predictionModel");

/**
 * GET /api/predictions/history
 * Returns the logged-in health_user's prediction history.
 */
const getUserPredictions = async (req, res) => {
  try {
    const predictions = await PredictionModel.getByUser(req.user.user_id);
    return res.json({ predictions });
  } catch (err) {
    console.error("[getUserPredictions]", err);
    return res.status(500).json({ error: "Failed to load prediction history" });
  }
};

module.exports = { getUserPredictions };
