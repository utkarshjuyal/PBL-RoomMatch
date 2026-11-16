const crypto = require("crypto");
const config = require("../config/config");
const { CODE_TTL_MS, RESEND_COOLDOWN_MS } = require("../constants/auth");
const User = require("../models/User");
const { sendVerificationEmail } = require("./mail.service");

// Codes are never stored in plain text: HMAC(userId:code) keyed with JWT_SECRET.
const hashCode = (userId, code) =>
  crypto.createHmac("sha256", config.JWT_SECRET).update(`${userId}:${code}`).digest("hex");

function codeMatches(userId, code, storedHash) {
  const a = Buffer.from(hashCode(userId, code), "hex");
  const b = Buffer.from(storedHash ?? "", "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Returns false (and sends nothing) while the resend cooldown is active.
async function sendVerificationCode(user) {
  const sentAt = user.emailVerification?.sentAt;
  if (sentAt && Date.now() - sentAt.getTime() < RESEND_COOLDOWN_MS) return false;

  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
  const now = Date.now();

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        emailVerification: {
          codeHash: hashCode(String(user._id), code),
          expiresAt: new Date(now + CODE_TTL_MS),
          attempts: 0,
          sentAt: new Date(now),
        },
      },
    },
  );

  try {
    await sendVerificationEmail({ to: user.email, name: user.name, code });
  } catch (error) {
    await User.updateOne({ _id: user._id }, { $unset: { emailVerification: "" } });
    throw error;
  }
  return true;
}

module.exports = { codeMatches, sendVerificationCode };
