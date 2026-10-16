const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const safeUser = (user) => ({ id: user._id, name: user.name, email: user.email, role: user.role });

const register = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = String(req.body.role || "").toLowerCase();

    if (!name || !email || !password || !role) return res.status(400).json({ message: "Name, email, password and role are required" });
    if (name.length < 2 || name.length > 50) return res.status(400).json({ message: "Name must be between 2 and 50 characters" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
    if (password.length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
    if (!["tenant", "landlord"].includes(role)) return res.status(400).json({ message: "Role must be tenant or landlord" });
    if (await User.findOne({ email })) return res.status(409).json({ message: "Email is already registered" });

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role });
    return res.status(201).json({ message: "Registration successful", user: safeUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Email is already registered" });
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    console.error("Registration error:", error.message);
    return res.status(500).json({ message: "Unable to register right now" });
  }
};

const login = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Server authentication is not configured" });
    const token = jwt.sign({ userId: String(user._id), role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return res.json({ message: "Login successful", token, user: safeUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Unable to log in right now" });
  }
};

module.exports = { register, login };
