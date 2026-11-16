const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Central, strict environment config.
 * Each required variable is checked on its own: the first one that is missing
 * (or blank) throws immediately with an error naming exactly that variable.
 * Never read process.env anywhere else in the backend - import this file.
 */
const required = (name) => {
  const value = process.env[name];
  if (value === undefined || String(value).trim() === "") {
    throw new Error(`${name} is not defined in environment variables`);
  }
  return String(value).trim();
};

const optional = (name, fallback) => {
  const value = process.env[name];
  return value === undefined || String(value).trim() === "" ? fallback : String(value).trim();
};

const port = (name, value) => {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 65535) {
    throw new Error(`${name} must be a valid port number`);
  }
  return number;
};

const NODE_ENV = optional("NODE_ENV", "development");
const PORT = port("PORT", optional("PORT", "5000"));

const MONGODB_URI = required("MONGODB_URI");

const JWT_SECRET = required("JWT_SECRET");
if (JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be at least 32 characters");

const SMTP_HOST = required("SMTP_HOST");
const SMTP_PORT = port("SMTP_PORT", required("SMTP_PORT"));
const SMTP_USER = required("SMTP_USER");
const SMTP_PASS = required("SMTP_PASS");

const MAIL_FROM = required("MAIL_FROM");
if (!MAIL_FROM.includes("@")) {
  throw new Error('MAIL_FROM must include a sender email, for example "RoomMatch <you@example.com>"');
}

module.exports = Object.freeze({
  NODE_ENV,
  isProduction: NODE_ENV === "production",
  PORT,
  MONGODB_URI,
  JWT_SECRET,
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM,
});
