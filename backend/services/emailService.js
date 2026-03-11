const nodemailer = require("nodemailer");

/**
 * Email service for sending transactional emails (password reset, etc.)
 *
 * Required environment variables:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional:
 *   SMTP_FROM  (defaults to SMTP_USER)
 */

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

/**
 * Send a password-reset OTP email.
 * @param {string} to  — recipient email
 * @param {string} code — 6-digit OTP
 */
async function sendResetCode(to, code) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await getTransporter().sendMail({
    from: `"Glucogu Health" <${from}>`,
    to,
    subject: "Your Password Reset Code — Glucogu",
    text: `Your password reset code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #2563EB; margin: 0;">Glucogu</h2>
          <p style="color: #6B7280; font-size: 14px;">Diabetes Risk Prediction</p>
        </div>
        <div style="background: #F9FAFB; border-radius: 12px; padding: 24px; text-align: center;">
          <p style="color: #374151; margin: 0 0 16px;">Your password reset code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563EB; padding: 16px; background: white; border-radius: 8px; display: inline-block;">
            ${code}
          </div>
          <p style="color: #6B7280; font-size: 13px; margin: 16px 0 0;">This code expires in <strong>10 minutes</strong>.</p>
        </div>
        <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin-top: 24px;">
          If you did not request a password reset, please ignore this email.
        </p>
      </div>
    `,
  });
}

module.exports = { sendResetCode };
