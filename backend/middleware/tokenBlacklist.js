/**
 * In-memory JWT token blacklist for logout invalidation.
 *
 * Tokens are stored with a TTL equal to their remaining lifetime.
 * A production system should use Redis instead of in-memory storage.
 */

const blacklist = new Map();

// Periodic cleanup of expired entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [token, expiresAt] of blacklist) {
      if (expiresAt <= now) {
        blacklist.delete(token);
      }
    }
  },
  5 * 60 * 1000,
);

/**
 * Add a token to the blacklist.
 * @param {string} token   — The JWT string
 * @param {number} expiresAt — Unix timestamp (ms) when the token naturally expires
 */
function add(token, expiresAt) {
  blacklist.set(token, expiresAt);
}

/**
 * Check whether a token has been revoked.
 * @param {string} token
 * @returns {boolean}
 */
function isBlacklisted(token) {
  if (!blacklist.has(token)) return false;

  const expiresAt = blacklist.get(token);
  // Automatically prune expired entries on lookup
  if (expiresAt <= Date.now()) {
    blacklist.delete(token);
    return false;
  }
  return true;
}

module.exports = { add, isBlacklisted };
