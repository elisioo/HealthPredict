const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const UserModel = require("../models/userModel");
const axios = require("axios");

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

  // 4. Verify password
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // 5. Update last seen
  await UserModel.updateLastSeen(user.user_id);

  // 6. Issue tokens
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
 * POST /api/auth/logout — clears cookies
 */
const logout = (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
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

module.exports = { register, login, getMe, logout, refresh };
