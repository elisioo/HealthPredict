require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("SMTP Config:");
console.log("  Host:", process.env.SMTP_HOST);
console.log("  Port:", process.env.SMTP_PORT);
console.log("  User:", process.env.SMTP_USER);
console.log("  Pass:", process.env.SMTP_PASS ? "***set***" : "!!!EMPTY!!!");
console.log("  From:", process.env.SMTP_FROM);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

console.log("\nVerifying SMTP connection...");
transporter
  .verify()
  .then(() => {
    console.log("SUCCESS - SMTP connection works!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAILED:", err.message);
    console.error("Full error:", err.code, err.responseCode);
    process.exit(1);
  });
