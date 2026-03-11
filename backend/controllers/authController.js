const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const UserModel = require("../models/userModel");
const axios = require("axios");
const tokenBlacklist = require("../middleware/tokenBlacklist");
const { logAction } = require("../middleware/auditLogger");
const otpStore = require("../middleware/otpStore");
const { sendResetCode } = require("../services/emailService");

const SALT_ROUNDS = 12;

const ROLE_MAP = {
  "Health User": "health_user",
  Patient: "health_user",
  "Healthcare Staff": "staff",
  Admin: "admin",
  health_user: "health_user",
  staff: "staff",
  admin: "admin",
};

const signToken = (userId, role) =>
  jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

const sendTokens = (res, user, statusCode = 200) => {
  const accessToken = signToken(user.user_id, user.role);
  const refreshToken = signRefreshToken(user.user_id);

  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(statusCode).json({
    message:
      statusCode === 201 ? "Account created successfully" : "Login successful",
    user: {
      id: user.user_id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
    },

    accessToken,
  });
};

const verifyCaptcha = async (captchaToken) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || secret === "test-skip") return true;

  try {
    const { data } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: { secret, response: captchaToken },
      },
    );
    return data.success === true;
  } catch {
    return false;
  }
};

/* ------------------------------------------------------------------ */
/* Controllers                                                           */
/* ------------------------------------------------------------------ */

/**
 * POST /api/auth/register
 * Body: { firstName, lastName, mi?, email, password, role, phone?, captchaToken }
 */
const register = async (req, res) => {
  // 1. Validate inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    firstName,
    lastName,
    mi,
    email,
    password,
    role,
    phone,
    captchaToken,
  } = req.body;

  const fullName = [
    firstName.trim(),
    mi ? mi.trim().toUpperCase() + "." : null,
    lastName.trim(),
  ]
    .filter(Boolean)
    .join(" ");

  const captchaOk = await verifyCaptcha(captchaToken);
  if (!captchaOk) {
    return res.status(400).json({ error: "CAPTCHA verification failed" });
  }

  // Map role
  const dbRole = ROLE_MAP[role];
  if (!dbRole) {
    return res.status(400).json({ error: "Invalid account role" });
  }

  // 4. Check duplicate email
  const exists = await UserModel.emailExists(email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: "Email already registered" });
  }

  // 5. Hash password
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  // 6. Persist
  const userId = await UserModel.create({
    full_name: fullName,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
    m_i: mi ? mi.trim().toUpperCase() : null,
    email: email.toLowerCase().trim(),
    password_hash,
    role: dbRole,
    phone: phone || null,
  });

  const newUser = await UserModel.findById(userId);

  // 7. Issue tokens
  return sendTokens(res, newUser, 201);
};

/**
 * POST /api/auth/login
 * Body: { email, password, captchaToken }
 */
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, captchaToken } = req.body;

  // 1. CAPTCHA
  const captchaOk = await verifyCaptcha(captchaToken);
  if (!captchaOk) {
    return res.status(400).json({ error: "CAPTCHA verification failed" });
  }

  // 2. Find user
  const user = await UserModel.findByEmail(email.toLowerCase());
  if (!user) {
    // Generic message to avoid user enumeration
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // 3. Check active
  if (!user.is_active) {
    return res
      .status(403)
      .json({ error: "Account is deactivated. Contact admin." });
  }

  // 4. Check lockout
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    const secsLeft = Math.ceil(
      (new Date(user.locked_until) - Date.now()) / 1000,
    );
    return res.status(423).json({
      error:
        "Account is temporarily locked due to too many failed login attempts.",
      locked_until: user.locked_until,
      seconds_left: secsLeft,
    });
  }

  // 5. Verify password
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    const attempt = await UserModel.recordFailedAttempt(user.user_id);
    const remaining = UserModel.MAX_ATTEMPTS - attempt.login_attempts;

    // Log the failed attempt
    await logAction(
      req,
      "login_failure",
      `Failed login attempt for ${user.email} (attempt ${attempt.login_attempts}/${UserModel.MAX_ATTEMPTS})`,
    );

    if (attempt.login_attempts >= UserModel.MAX_ATTEMPTS) {
      const secsLeft = Math.ceil(
        (new Date(attempt.locked_until) - Date.now()) / 1000,
      );
      await logAction(
        req,
        "account_locked",
        `Account locked for ${user.email} after ${UserModel.MAX_ATTEMPTS} failed attempts`,
      );
      return res.status(423).json({
        error: "Account locked after too many failed attempts.",
        locked_until: attempt.locked_until,
        seconds_left: secsLeft,
      });
    }

    return res.status(401).json({
      error: `Invalid credentials. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining before lockout.`,
      attempts_remaining: remaining,
    });
  }

  // 6. Successful login — reset counter
  await UserModel.resetLoginAttempts(user.user_id);

  // 7. Update last seen
  await UserModel.updateLastSeen(user.user_id);

  // 8. Log successful login
  await logAction(
    req,
    "login_success",
    `User ${user.email} logged in successfully`,
  );

  // 9. Issue tokens
  return sendTokens(res, user, 200);
};

/**
 * GET /api/auth/me — returns current user (requireAuth guard must run first)
 */
const getMe = async (req, res) => {
  const user = await UserModel.findById(req.user.user_id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user });
};

/**
 * POST /api/auth/logout — clears cookies and blacklists the current token
 */
const logout = (req, res) => {
  // Blacklist the current access token so it can't be reused
  const token =
    req.cookies?.token ||
    (req.headers["authorization"]?.startsWith("Bearer ")
      ? req.headers["authorization"].split(" ")[1]
      : null);

  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        tokenBlacklist.add(token, decoded.exp * 1000);
      }
    } catch {
      // Token may be malformed — ignore, we're clearing it anyway
    }
  }

  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
  });
  return res.json({ message: "Logged out successfully" });
};

/**
 * POST /api/auth/refresh — issues new access token using refresh token cookie
 */
const refresh = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const accessToken = signToken(decoded.id, decoded.role);

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "strict" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

/**
 * PATCH /api/auth/status
 * Staff-only: set availability_status to 'available' or 'unavailable'.
 */
const updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!["available", "unavailable"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Status must be 'available' or 'unavailable'" });
  }
  if (req.user.role !== "staff") {
    return res
      .status(403)
      .json({ error: "Only healthcare staff can update availability" });
  }
  try {
    await UserModel.updateAvailability(req.user.user_id, status);
    return res.json({ availability_status: status });
  } catch (err) {
    console.error("[updateStatus]", err);
    return res.status(500).json({ error: "Failed to update status" });
  }
};

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 * Sends a 6-digit OTP to the registered email.
 */
const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await UserModel.findByEmail(email.toLowerCase());
    if (!user) {
      return res
        .status(404)
        .json({ error: "No account found with that email address." });
    }
    if (!user.is_active) {
      return res
        .status(403)
        .json({
          error: "This account has been deactivated. Contact an administrator.",
        });
    }

    const code = otpStore.create(email);
    await sendResetCode(email.toLowerCase(), code);
    await logAction(
      req,
      "password_reset_requested",
      `Password reset requested for ${email}`,
    );

    return res.json({
      message: "A 6-digit reset code has been sent to your email.",
    });
  } catch (err) {
    console.error("[forgotPassword]", err);
    return res
      .status(500)
      .json({ error: "Failed to send reset code. Please try again later." });
  }
};

/**
 * POST /api/auth/reset-password
 * Body: { email, code, newPassword }
 * Verifies the OTP and sets the new password.
 */
const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, code, newPassword } = req.body;

  // Verify OTP
  const result = otpStore.verify(email, code);
  if (!result.valid) {
    return res.status(400).json({ error: result.reason });
  }

  try {
    const user = await UserModel.findByEmail(email.toLowerCase());
    if (!user) {
      return res.status(400).json({ error: "Account not found." });
    }

    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await UserModel.updatePassword(user.user_id, password_hash);

    // Reset any lockout state
    await UserModel.resetLoginAttempts(user.user_id);

    await logAction(
      req,
      "password_reset_success",
      `Password reset completed for ${email}`,
    );

    return res.json({
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (err) {
    console.error("[resetPassword]", err);
    return res
      .status(500)
      .json({ error: "Failed to reset password. Please try again." });
  }
};

module.exports = {
  register,
  login,
  getMe,
  logout,
  refresh,
  updateStatus,
  forgotPassword,
  resetPassword,
};
