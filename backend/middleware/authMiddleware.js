const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

const requireAuth = async (req, res, next) => {
  let token = null;

  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorised — no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorised — user not found" });
    }
    if (!user.is_active) {
      return res.status(403).json({ error: "Account has been deactivated" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ error: "Token expired — please log in again" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorised" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden — required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

module.exports = { requireAuth, requireRole };
