const rateLimit = require("express-rate-limit");

/** Strict limiter for login / register endpoints */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many attempts from this IP. Please try again after 15 minutes.",
  },
});

/** General API limiter */
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please slow down." },
});

module.exports = { authLimiter, generalLimiter };
