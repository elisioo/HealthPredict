/**
 * AES-256-GCM encryption utility for sensitive health data at rest.
 *
 * Usage:
 *   const { encrypt, decrypt } = require("./encryption");
 *   const cipher = encrypt("sensitive data");  // → { iv, tag, data }
 *   const plain  = decrypt(cipher);            // → "sensitive data"
 */

const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // 128-bit IV for GCM

function getKey() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY env var must be a 64-character hex string (32 bytes)",
    );
  }
  return Buffer.from(hex, "hex");
}

/**
 * Encrypt a plaintext string → { iv, tag, data } (all hex-encoded).
 */
function encrypt(plaintext) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
    data: encrypted,
  };
}

/**
 * Decrypt { iv, tag, data } → plaintext string.
 */
function decrypt({ iv, tag, data }) {
  const key = getKey();
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tag, "hex"));

  let decrypted = decipher.update(data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = { encrypt, decrypt };
