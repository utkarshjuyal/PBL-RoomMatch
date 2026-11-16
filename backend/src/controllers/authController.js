const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { MAX_CODE_ATTEMPTS } = require("../constants/auth");
const User = require("../models/User");
const { codeMatches, sendVerificationCode } = require("../services/verification.service");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUMMY_HASH = bcrypt.hashSync("not a real password", 12);

const cleanEmail = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");
const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, emailVerified: Boolean(user.emailVerified) });
const issueToken = (user) => jwt.sign({ userId: String(user._id), role: user.role }, config.JWT_SECRET, { expiresIn: "1d" });

const register = async (req, res) => {
  try {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const email = cleanEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const role = String(req.body?.role || "").toLowerCase();

    if (!name || !email || !password || !role) return res.status(400).json({ message: "Name, email, password and role are required" });
    if (name.length < 2 || name.length > 50) return res.status(400).json({ message: "Name must be between 2 and 50 characters" });
    if (!EMAIL_RE.test(email) || email.length > 254) return res.status(400).json({ message: "Enter a valid email address" });
    if (password.length < 8 || Buffer.byteLength(password) > 72) return res.status(400).json({ message: "Password must be 8 to 72 characters" });
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return res.status(400).json({ message: "Password must contain at least one letter and one number" });
    if (!["tenant", "landlord"].includes(role)) return res.status(400).json({ message: "Role must be tenant or landlord" });

    const passwordHash = await bcrypt.hash(password, 12);
    let user = await User.findOne({ email }).select("+emailVerification");

    if (user?.emailVerified) return res.status(409).json({ message: "Email is already registered" });

    if (user) {
      // Unverified account re-registering: refresh details so nobody can squat an email.
      user.name = name;
      user.role = role;
      user.password = passwordHash;
      await user.save();
    } else {
      try {
        user = await User.create({ name, email, password: passwordHash, role });
      } catch (error) {
        if (error.code === 11000) return res.status(409).json({ message: "Email is already registered" });
        throw error;
      }
    }

    try {
      await sendVerificationCode(user);
    } catch (error) {
      console.error("Verification email failed:", error.message);
      return res.status(502).json({ message: "We could not send the verification email. Please try again." });
    }

    return res.status(201).json({ verificationRequired: true, email, message: "Account created. We sent a 6 digit code to your email." });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Unable to create your account right now" });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const email = cleanEmail(req.body?.email);
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    if (!email || !/^\d{6}$/.test(code)) return res.status(400).json({ message: "Enter the 6 digit code from your email." });

    // Atomic attempt counter: only one wrong guess can be counted at a time, so
    // parallel requests cannot get more than MAX_CODE_ATTEMPTS tries.
    const user = await User.findOneAndUpdate(
      {
        email,
        emailVerified: { $ne: true },
        "emailVerification.attempts": { $lt: MAX_CODE_ATTEMPTS },
        "emailVerification.expiresAt": { $gt: new Date() },
      },
      { $inc: { "emailVerification.attempts": 1 } },
      { returnDocument: "after" },
    ).select("+emailVerification");

    if (!user) return res.status(400).json({ message: "That code has expired or is no longer valid. Request a new one." });

    if (!codeMatches(String(user._id), code, user.emailVerification.codeHash)) {
      const left = MAX_CODE_ATTEMPTS - user.emailVerification.attempts;
      return res.status(400).json({
        message: left > 0 ? `That code is not correct. ${left} ${left === 1 ? "attempt" : "attempts"} left.` : "That code is not correct. Request a new one.",
      });
    }

    await User.updateOne({ _id: user._id }, { $set: { emailVerified: true }, $unset: { emailVerification: "" } });
    user.emailVerified = true;

    return res.json({ message: "Email verified", token: issueToken(user), user: safeUser(user) });
  } catch (error) {
    console.error("Email verification error:", error.message);
    return res.status(500).json({ message: "Unable to verify your email right now." });
  }
};

const resendCode = async (req, res) => {
  try {
    const email = cleanEmail(req.body?.email);
    if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "Enter a valid email address." });

    const user = await User.findOne({ email, emailVerified: { $ne: true } }).select("+emailVerification");
    if (user) await sendVerificationCode(user);

    // Same answer whether or not the account exists, so emails cannot be probed.
    return res.json({ message: "If that account is waiting for verification, a new code is on its way." });
  } catch (error) {
    console.error("Resend code error:", error.message);
    return res.status(502).json({ message: "Unable to send a new code right now." });
  }
};

const login = async (req, res) => {
  try {
    const email = cleanEmail(req.body?.email);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email }).select("+emailVerification");
    const matches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
    if (!user || !matches) return res.status(401).json({ message: "Invalid email or password" });

    if (user.emailVerified !== true) {
      try {
        await sendVerificationCode(user);
      } catch (error) {
        console.error("Verification email failed:", error.message);
      }
      return res.status(403).json({
        message: "Please verify your email to continue. Check your inbox for the code.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    return res.json({ message: "Login successful", token: issueToken(user), user: safeUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Unable to log in right now" });
  }
};

module.exports = { register, login, verifyEmail, resendCode };
