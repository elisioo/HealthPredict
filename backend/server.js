require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { generalLimiter } = require("./middleware/rateLimitMiddleware");

// Routes
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

/* ------------------------------------------------------------------ */
/* Security Middleware                                                   */
/* ------------------------------------------------------------------ */

// HTTP security headers
app.use(helmet());

// CORS — allow the React dev server
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    credentials: true, // allow cookies
  }),
);

// Parse JSON bodies (limit to 10kb to prevent large payloads)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

// Cookie parser (required for httpOnly cookie auth)
app.use(cookieParser());

// General rate limit on all /api routes
app.use("/api", generalLimiter);

/* ------------------------------------------------------------------ */
/* Request logger (dev only)                                            */
/* ------------------------------------------------------------------ */
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

/* ------------------------------------------------------------------ */
/* API Routes                                                            */
/* ------------------------------------------------------------------ */

app.get("/", (_req, res) =>
  res.json({ message: "HealthPredict API is running" }),
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

/* ------------------------------------------------------------------ */
/* 404 + Global error handlers                                          */
/* ------------------------------------------------------------------ */

app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

/* ------------------------------------------------------------------ */
/* Start server                                                          */
/* ------------------------------------------------------------------ */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 HealthPredict API running on http://localhost:${PORT}`);
});
