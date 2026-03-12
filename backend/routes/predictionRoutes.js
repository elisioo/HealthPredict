const express = require("express");
const { body } = require("express-validator");
const { requireAuth } = require("../middleware/authMiddleware");
const { predictionLimiter } = require("../middleware/rateLimitMiddleware");
const {
  createPrediction,
  getUserPredictions,
} = require("../controllers/predictionController");

const router = express.Router();

const predictionValidation = [
  body("gender")
    .isIn(["Male", "Female", "Other"])
    .withMessage("Gender must be Male, Female, or Other"),
  body("age")
    .isFloat({ min: 0, max: 150 })
    .withMessage("Age must be between 0 and 150"),
  body("hypertension")
    .isIn([0, 1, "0", "1"])
    .withMessage("Hypertension must be 0 or 1"),
  body("heart_disease")
    .isIn([0, 1, "0", "1"])
    .withMessage("Heart disease must be 0 or 1"),
  body("smoking_history")
    .isIn(["never", "former", "current", "not current", "ever", "No Info"])
    .withMessage("Invalid smoking history value"),
  body("bmi")
    .isFloat({ min: 1, max: 100 })
    .withMessage("BMI must be between 1 and 100"),
  body("HbA1c_level")
    .isFloat({ min: 0, max: 20 })
    .withMessage("HbA1c level must be between 0 and 20"),
  body("blood_glucose_level")
    .isFloat({ min: 0, max: 600 })
    .withMessage("Blood glucose level must be between 0 and 600"),
  body("target_user_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Invalid target user ID"),
];

router.post(
  "/predict",
  requireAuth,
  predictionLimiter,
  predictionValidation,
  createPrediction,
);

router.get("/history", requireAuth, getUserPredictions);

module.exports = router;
