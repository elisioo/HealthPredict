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
  deleteAccount,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

const registerValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ max: 250 })
    .withMessage("First name too long")
    .matches(/^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'.,-]+$/)
    .withMessage("First name contains invalid characters"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ max: 250 })
    .withMessage("Last name too long")
    .matches(/^[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF\s'.,-]+$/)
    .withMessage("Last name contains invalid characters"),

  body("mi")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 1 })
    .withMessage("Middle initial must be a single character")
    .isAlpha()
    .withMessage("Middle initial must be a letter"),

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

router.post("/register", authLimiter, registerValidation, register);

router.post("/login", authLimiter, loginValidation, login);

router.get("/me", requireAuth, getMe);

router.post("/logout", logout);

router.post("/refresh", refresh);

router.patch("/status", requireAuth, updateStatus);

router.post(
  "/forgot-password",
  authLimiter,
  forgotPasswordValidation,
  forgotPassword,
);

router.post(
  "/reset-password",
  authLimiter,
  resetPasswordValidation,
  resetPassword,
);

const deleteAccountValidation = [
  body("password").notEmpty().withMessage("Password is required"),
];

router.delete(
  "/account",
  requireAuth,
  deleteAccountValidation,
  deleteAccount,
);

module.exports = router;
