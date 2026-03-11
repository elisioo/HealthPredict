/**
 * XSS sanitization middleware.
 * Strips HTML tags from all string values in req.body, req.query, and req.params.
 */

function stripTags(str) {
  if (typeof str !== "string") return str;
  return str.replace(/<[^>]*>/g, "");
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  for (const key of Object.keys(obj)) {
    if (typeof obj[key] === "string") {
      obj[key] = stripTags(obj[key]);
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
  return obj;
}

function sanitizeInput(req, _res, next) {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
}

module.exports = sanitizeInput;
