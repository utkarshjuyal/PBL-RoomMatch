const jwt = require("jsonwebtoken");
const config = require("../config/config");

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return res.status(401).json({ message: "Authentication required" });
  try {
    req.user = jwt.verify(token, config.JWT_SECRET, { algorithms: ["HS256"] });
    if (!req.user.userId || !req.user.role) return res.status(401).json({ message: "Invalid token payload" });
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = protect;
