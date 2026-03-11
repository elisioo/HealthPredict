const crypto = require("crypto");

/**
 * In-memory OTP store for password reset codes.
 * Each entry: { code, expiresAt, attempts }
 * Key: lowercase email
 */
const store = new Map();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_VERIFY_ATTEMPTS = 5;

/** Generate a 6-digit numeric OTP */
function generateOTP() {
  // crypto.randomInt is cryptographically secure
  return crypto.randomInt(100000, 999999).toString();
}

/** Create and store an OTP for the given email */
function create(email) {
  const key = email.toLowerCase();
  const code = generateOTP();
  store.set(key, {
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });
  return code;
}

/**
 * Verify an OTP for the given email.
 * Returns { valid: true } or { valid: false, reason: string }
 */
function verify(email, code) {
  const key = email.toLowerCase();
  const entry = store.get(key);

  if (!entry) {
    return {
      valid: false,
      reason: "No reset code found. Please request a new one.",
    };
  }

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return {
      valid: false,
      reason: "Reset code has expired. Please request a new one.",
    };
  }

  entry.attempts += 1;
  if (entry.attempts > MAX_VERIFY_ATTEMPTS) {
    store.delete(key);
    return {
      valid: false,
      reason: "Too many failed attempts. Please request a new code.",
    };
  }

  if (entry.code !== code) {
    return { valid: false, reason: "Invalid reset code." };
  }

  // Valid — remove so it can't be reused
  store.delete(key);
  return { valid: true };
}

/** Remove expired entries (called periodically) */
function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.expiresAt) store.delete(key);
  }
}

// Cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000).unref();

module.exports = { create, verify };
