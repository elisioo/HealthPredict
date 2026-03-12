const express = require("express");
const { body } = require("express-validator");
const { requireAuth, requireRole } = require("../middleware/authMiddleware");
const {
  getHealthProfile,
  updateHealthProfile,
  updatePhone,
} = require("../controllers/profileController");

const router = express.Router();

const healthProfileValidation = [
  body("date_of_birth")
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage("Invalid date of birth"),
  body("gender")
    .optional({ checkFalsy: true })
    .isIn(["male", "female", "other"])
    .withMessage("Invalid gender"),
  body("height_cm")
    .optional({ checkFalsy: true })
    .isFloat({ min: 50, max: 300 })
    .withMessage("Height must be between 50 and 300 cm"),
  body("weight_kg")
    .optional({ checkFalsy: true })
    .isFloat({ min: 1, max: 500 })
    .withMessage("Weight must be between 1 and 500 kg"),
  body("smoking_status")
    .optional({ checkFalsy: true })
    .isIn(["non-smoker", "former", "current"])
    .withMessage("Invalid smoking status"),
  body("contact_phone")
    .optional({ checkFalsy: true })
    .matches(/^\+?[0-9\-\s().]{6,25}$/)
    .withMessage("Invalid contact phone number"),
];

const phoneValidation = [
  body("phone")
    .optional({ checkFalsy: true })
    .matches(/^\+?[0-9\-\s().]{6,25}$/)
    .withMessage("Invalid phone number"),
];

router.get(
  "/health",
  requireAuth,
  requireRole("health_user"),
  getHealthProfile,
);

router.put(
  "/health",
  requireAuth,
  requireRole("health_user"),
  healthProfileValidation,
  updateHealthProfile,
);

router.patch("/phone", requireAuth, phoneValidation, updatePhone);

module.exports = router;
