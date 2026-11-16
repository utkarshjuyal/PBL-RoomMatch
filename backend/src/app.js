const express = require("express");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const tenantProfileRoutes = require("./routes/TenantProfileRoutes");
const landlordProfileRoutes = require("./routes/landlordProfileRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const interactionRoutes = require("./routes/interactionRoutes");
const savedRoutes = require("./routes/savedRoutes");

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), { maxAge: "1d", immutable: false }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/tenant-profile", tenantProfileRoutes);
app.use("/api/landlord-profile", landlordProfileRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/interactions", interactionRoutes);
app.use("/api/saved", savedRoutes);

app.use("/api", (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));

// Serve the built frontend (frontend/dist) from this server, so the browser talks to one origin.
const distDir = path.resolve(__dirname, "../../frontend/dist");
app.use(express.static(distDir));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
  res.sendFile(path.join(distDir, "index.html"), (error) => {
    if (error) res.status(404).send("Frontend not built yet. Run: npm run build:frontend");
  });
});
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));

app.use((err, _req, res, _next) => {
  console.error("Request error:", err.message);
  res.status(500).json({ message: "Unexpected server error" });
});
module.exports = app;
