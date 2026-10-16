const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const tenantProfileRoutes = require("./routes/tenantProfileRoutes");
const landlordProfileRoutes = require("./routes/landlordProfileRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const interactionRoutes = require("./routes/interactionRoutes");
const savedRoutes = require("./routes/savedRoutes");

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map(x => x.trim());
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Origin not allowed by CORS"));
} }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), { maxAge: "1d", immutable: false }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (_req, res) => res.json({ message: "RoomMatch API is running", status: "ok" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/tenant-profile", tenantProfileRoutes);
app.use("/api/landlord-profile", landlordProfileRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/saved", savedRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((err, _req, res, _next) => {
  console.error("Request error:", err.message);
  res.status(500).json({ message: "Unexpected server error" });
});
module.exports = app;
