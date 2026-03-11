const { spawn } = require("child_process");
const path = require("path");
const { validationResult } = require("express-validator");
const PredictionModel = require("../models/predictionModel");
const UserModel = require("../models/userModel");
const { logAction } = require("../middleware/auditLogger");

const PYTHON_SCRIPT = path.join(__dirname, "../ml-training/predict.py");

/**
 * Call the Python ML model and resolve with the parsed result object.
 */
function runPythonModel(inputData) {
  return new Promise((resolve, reject) => {
    const proc = spawn("python", [PYTHON_SCRIPT], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        try {
          const errObj = JSON.parse(stderr.trim());
          return reject(new Error(errObj.error || "Python script failed"));
        } catch {
          return reject(
            new Error(
              stderr.trim() || "Python script exited with code " + code,
            ),
          );
        }
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        reject(new Error("Invalid JSON from prediction model"));
      }
    });

    proc.on("error", (err) =>
      reject(new Error("Failed to spawn Python: " + err.message)),
    );

    proc.stdin.write(JSON.stringify(inputData));
    proc.stdin.end();
  });
}

/**
 * POST /api/predictions/predict
 * Run the ML model and save the result to the database.
 */
const createPrediction = async (req, res) => {
  // Validate inputs from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    gender,
    age,
    hypertension,
    heart_disease,
    smoking_history,
    bmi,
    HbA1c_level,
    blood_glucose_level,
    // Optional: predict for another user (staff/admin only)
    target_user_id,
  } = req.body;

  // Basic validation
  const missing = [
    "gender",
    "age",
    "hypertension",
    "heart_disease",
    "smoking_history",
    "bmi",
    "HbA1c_level",
    "blood_glucose_level",
  ].filter((k) => req.body[k] === undefined || req.body[k] === "");

  if (missing.length > 0) {
    return res
      .status(400)
      .json({ error: `Missing fields: ${missing.join(", ")}` });
  }

  try {
    // Authorization: Only staff/admin can predict for other users
    let userId = req.user.user_id;
    if (target_user_id && Number(target_user_id) !== req.user.user_id) {
      if (req.user.role === "health_user") {
        return res.status(403).json({
          error: "Patients cannot submit predictions for other users",
        });
      }
      // Verify the target user exists
      const targetUser = await UserModel.findById(Number(target_user_id));
      if (!targetUser) {
        return res.status(404).json({ error: "Target user not found" });
      }
      userId = Number(target_user_id);
    }

    const mlResult = await runPythonModel({
      gender,
      age: Number(age),
      hypertension: Number(hypertension),
      heart_disease: Number(heart_disease),
      smoking_history,
      bmi: Number(bmi),
      HbA1c_level: Number(HbA1c_level),
      blood_glucose_level: Number(blood_glucose_level),
    });

    const predictionId = await PredictionModel.create({
      userId,
      gender,
      age: Number(age),
      hypertension: Number(hypertension),
      heart_disease: Number(heart_disease),
      smoking_history,
      bmi: Number(bmi),
      HbA1c_level: Number(HbA1c_level),
      blood_glucose_level: Number(blood_glucose_level),
      diabetes_result: mlResult.diabetes_result,
      risk_level: mlResult.risk_level,
      probability: mlResult.probability,
      predicted_by: req.user.user_id,
    });

    // Audit log for prediction creation
    await logAction(
      req,
      "prediction_created",
      `Prediction #${predictionId} created for user #${userId} — risk: ${mlResult.risk_level} (${mlResult.probability}%)`,
    );

    return res.status(201).json({
      prediction_id: predictionId,
      diabetes_result: mlResult.diabetes_result,
      probability: mlResult.probability,
      risk_level: mlResult.risk_level,
    });
  } catch (err) {
    console.error("[createPrediction]", err);
    return res
      .status(500)
      .json({ error: "Prediction failed. Please try again." });
  }
};

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

module.exports = { createPrediction, getUserPredictions };
