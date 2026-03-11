const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  logout,
  refresh,
  updateStatus,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

/* ------------------------------------------------------------------ */
/* Validation rules                                                     */
/* ------------------------------------------------------------------ */

const registerValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 250 })
    .withMessage("First name too long"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 250 })
    .withMessage("Last name too long"),

  body("mi")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1 })
    .withMessage("Middle initial must be a single character"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address")
    .isLength({ max: 120 })
    .withMessage("Email too long"),

  body("password")
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain a special character"),

  body("role")
    .isIn(["Health User", "Patient", "Healthcare Staff", "Admin"])
    .withMessage("Invalid role selected"),

  body("phone")
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Invalid phone number"),
];

const loginValidation = [
  body("email").trim().isEmail().withMessage("Invalid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email").trim().isEmail().withMessage("A valid email is required"),
];

const resetPasswordValidation = [
  body("email").trim().isEmail().withMessage("A valid email is required"),
  body("code")
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage("Reset code must be 6 digits")
    .isNumeric()
    .withMessage("Reset code must be numeric"),
  body("newPassword")
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain a lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain a special character"),
];

/* ------------------------------------------------------------------ */
/* Routes                                                               */
/* ------------------------------------------------------------------ */

// POST /api/auth/register
router.post("/register", authLimiter, registerValidation, register);

// POST /api/auth/login
router.post("/login", authLimiter, loginValidation, login);

// GET  /api/auth/me  (protected)
router.get("/me", requireAuth, getMe);

// POST /api/auth/logout (auth optional — works even if token is expired)
router.post("/logout", logout);

// POST /api/auth/refresh
router.post("/refresh", refresh);

// PATCH /api/auth/status  (staff only)
router.patch("/status", requireAuth, updateStatus);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  forgotPassword,
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidation,
  resetPassword,
);

module.exports = router;
