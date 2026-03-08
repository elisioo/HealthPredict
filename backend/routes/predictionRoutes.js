const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { getUserPredictions } = require("../controllers/predictionController");

const router = express.Router();

// GET /api/predictions/history — authenticated users only
router.get("/history", requireAuth, getUserPredictions);

module.exports = router;
