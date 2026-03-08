const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 3307,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "glucogu_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
