const mysql = require("mysql2/promise");

const REQUIRED_DB_VARS = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];

if (process.env.NODE_ENV === "production") {
  for (const key of REQUIRED_DB_VARS) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "glucogu_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Enable SSL in production if DB_SSL is set
  ...(process.env.DB_SSL === "true"
    ? { ssl: { rejectUnauthorized: true } }
    : {}),
});

// Test connection on startup
pool
  .getConnection()
  .then((conn) => {
    console.log("MySQL connected to", process.env.DB_NAME || "glucogu_db");
    conn.release();
  })
  .catch((err) => {
    console.error("MySQL connection failed:", err.message);
  });

module.exports = pool;
