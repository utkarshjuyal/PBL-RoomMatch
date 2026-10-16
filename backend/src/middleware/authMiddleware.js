const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return res.status(401).json({ message: "Authentication required" });
  if (!process.env.JWT_SECRET) return res.status(500).json({ message: "Server authentication is not configured" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    if (!req.user.userId || !req.user.role) return res.status(401).json({ message: "Invalid token payload" });
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = protect;
