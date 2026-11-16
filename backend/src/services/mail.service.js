const nodemailer = require("nodemailer");
const config = require("../config/config");
const { CODE_TTL_MS } = require("../constants/auth");

// Brevo SMTP relay: smtp-relay.brevo.com:587 (STARTTLS). Port 465 uses implicit TLS.
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: config.SMTP_PORT,
  secure: config.SMTP_PORT === 465,
  auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
  connectionTimeout: 10000,
  socketTimeout: 15000,
});

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function sendVerificationEmail({ to, name, code }) {
  const minutes = CODE_TTL_MS / 60000;

  await transporter.sendMail({
    from: config.MAIL_FROM,
    to,
    subject: `Your RoomMatch code is ${code}`,
    text: `Hi ${name},\n\nYour RoomMatch verification code is ${code}.\nIt expires in ${minutes} minutes.\n\nIf you did not create an account, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#342620">
      <p style="color:#c96f50;font-weight:bold;letter-spacing:2px">ROOMMATCH</p>
      <p>Hi ${escapeHtml(name)}, here is your verification code:</p>
      <p style="font-size:34px;letter-spacing:8px;margin:24px 0"><strong>${code}</strong></p>
      <p>It expires in ${minutes} minutes. If you did not create an account, you can ignore this email.</p>
    </div>`,
  });
}

module.exports = { sendVerificationEmail };
