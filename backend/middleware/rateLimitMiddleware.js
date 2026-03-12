const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

// Helper: use user ID when authenticated, otherwise fall back to IPv6-safe IP key
const userOrIp = (req) =>
  req.user ? String(req.user.user_id) : ipKeyGenerator(req.ip);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many attempts from this IP. Please try again after 15 minutes.",
  },
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please slow down." },
});

/* Rate limiter for ML predictions (resource-intensive) */
const predictionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 predictions per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIp,
  message: { error: "Too many predictions. Maximum 5 per minute." },
});

/* Rate limiter for appointment booking */
const appointmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 bookings per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIp,
  message: { error: "Too many appointment requests. Please try again later." },
});

/* Rate limiter for messages (prevent spam) */
const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 messages per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: userOrIp,
  message: { error: "Too many messages. Please slow down." },
});

module.exports = {
  authLimiter,
  generalLimiter,
  predictionLimiter,
  appointmentLimiter,
  messageLimiter,
};

module.exports = {
  authLimiter,
  generalLimiter,
  predictionLimiter,
  appointmentLimiter,
  messageLimiter,
};
