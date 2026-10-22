const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, emailVerified: Boolean(user.emailVerified) });
const tokenHash = (token) => crypto.createHash("sha256").update(token).digest("hex");
const emailReady = () => Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM && process.env.CLIENT_URL);

async function sendVerificationEmail(user, token) {
  if (!emailReady()) throw new Error("Email verification is not configured. Set RESEND_API_KEY, EMAIL_FROM, and CLIENT_URL in backend/.env.");
  const verifyUrl = `${process.env.CLIENT_URL.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [user.email],
      subject: "Verify your RoomMatch email",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#342620"><div style="background:#fff9f2;padding:32px;border-radius:18px"><p style="color:#c96f50;font-weight:bold">ROOMMATCH</p><h1>Welcome, ${String(user.name).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}.</h1><p>Confirm your email address to finish setting up your RoomMatch account.</p><p style="margin:28px 0"><a href="${verifyUrl}" style="background:#c96f50;color:white;padding:13px 20px;border-radius:999px;text-decoration:none;font-weight:bold">Verify my email</a></p><p>This link expires in 24 hours and can be used once. If you did not create this account, you can ignore this email.</p></div></div>`
    })
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Email provider rejected the message (${response.status}). ${body.slice(0, 180)}`);
  }
}

const register = async (req, res) => {
  let createdUser;
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = String(req.body.role || "").toLowerCase();
    if (!name || !email || !password || !role) return res.status(400).json({ message: "Name, email, password and role are required" });
    if (name.length < 2 || name.length > 50) return res.status(400).json({ message: "Name must be between 2 and 50 characters" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) return res.status(400).json({ message: "Password must contain at least one letter and one number" });
    if (!["tenant", "landlord"].includes(role)) return res.status(400).json({ message: "Role must be tenant or landlord" });
    if (!emailReady()) return res.status(503).json({ message: "Email verification is not configured yet. Add RESEND_API_KEY, EMAIL_FROM, and CLIENT_URL to backend/.env before registering." });
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email is already registered" });

    const token = crypto.randomBytes(32).toString("hex");
    createdUser = await User.create({ name, email, password: await bcrypt.hash(password, 12), role, emailVerified: false, emailVerificationTokenHash: tokenHash(token), emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) });
    await sendVerificationEmail(createdUser, token);
    return res.status(201).json({ message: "Account created. A verification link has been sent to your email. Check your inbox and spam folder." });
  } catch (error) {
    if (createdUser?._id) await User.deleteOne({ _id: createdUser._id }).catch(() => {});
    if (error.code === 11000) return res.status(409).json({ message: "Email is already registered" });
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    console.error("Registration/email error:", error.message);
    return res.status(502).json({ message: "We could not send the verification email. Check the email-provider configuration and try again." });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const token = String(req.body.token || "");
    if (!/^[a-f0-9]{64}$/i.test(token)) return res.status(400).json({ message: "This verification link is invalid or incomplete." });
    const user = await User.findOne({ emailVerificationTokenHash: tokenHash(token), emailVerificationExpires: { $gt: new Date() } }).select("+emailVerificationTokenHash +emailVerificationExpires");
    if (!user) return res.status(400).json({ message: "This verification link is invalid, expired, or already used. Request a new link and try again." });
    user.emailVerified = true;
    user.emailVerificationTokenHash = null;
    user.emailVerificationExpires = null;
    await user.save();
    return res.json({ message: "Your email is verified. You can now sign in to RoomMatch." });
  } catch (error) {
    console.error("Email verification error:", error.message);
    return res.status(500).json({ message: "Unable to verify your email right now." });
  }
};

const resendVerification = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
    const generic = "If an unverified account exists for this address, a new verification email will be sent.";
    if (!emailReady()) return res.status(503).json({ message: "Email verification is not configured. Contact the site administrator." });
    const user = await User.findOne({ email });
    if (!user || user.emailVerified) return res.json({ message: generic });
    const token = crypto.randomBytes(32).toString("hex");
    user.emailVerificationTokenHash = tokenHash(token);
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    await sendVerificationEmail(user, token);
    return res.json({ message: generic });
  } catch (error) {
    console.error("Resend verification error:", error.message);
    return res.status(502).json({ message: "Unable to send a verification email right now." });
  }
};

const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });
    if (user.emailVerified === false) return res.status(403).json({ message: "Please verify your email before signing in. Check your inbox or request a new verification link." });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Server authentication is not configured" });
    const token = jwt.sign({ userId: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.json({ message: "Login successful", token, user: safeUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Unable to log in right now" });
  }
};
module.exports = { register, login, verifyEmail, resendVerification };
