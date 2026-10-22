const mongoose = require("mongoose");
const Property = require("../models/Property");

const fields = ["title", "description", "propertyType", "roomType", "city", "area", "address", "rent", "securityDeposit", "availableFrom", "amenities", "images", "latitude", "longitude", "status"];
const pick = (body, isCreate = false) => {
  const out = {};
  for (const key of fields) if (body[key] !== undefined) out[key] = body[key];
  if (out.title !== undefined) out.title = String(out.title).trim();
  if (out.city !== undefined) out.city = String(out.city).trim();
  for (const key of ["rent", "securityDeposit", "latitude", "longitude"]) if (out[key] !== undefined && out[key] !== "") out[key] = Number(out[key]);
  for (const key of ["rent", "securityDeposit", "latitude", "longitude"]) if (out[key] === "") delete out[key];
  if (out.amenities && !Array.isArray(out.amenities)) out.amenities = [];
  if (out.images && !Array.isArray(out.images)) out.images = [];
  if (out.images) out.images = out.images.filter((v) => typeof v === "string" && v.trim()).slice(0, 10);
  if (isCreate) delete out.status;
  return out;
};
const badId = (id) => !mongoose.isValidObjectId(id);
const validationError = (res, error) => {
  if (error.name === "ValidationError" || error.name === "CastError") return res.status(400).json({ message: error.message });
  console.error("Property API error:", error.message);
  return res.status(500).json({ message: "Unable to complete property request" });
};

exports.createProperty = async (req, res) => {
  try {
    const payload = pick(req.body, true);
    const property = await Property.create({ ...payload, landlordId: req.user.userId });
    res.status(201).json({ message: "Property created successfully", property });
  } catch (e) { return validationError(res, e); }
};
exports.getMyProperties = async (req, res) => {
  try { const properties = await Property.find({ landlordId: req.user.userId }).sort({ createdAt: -1 }); res.json({ properties }); }
  catch (e) { return validationError(res, e); }
};
exports.getProperties = async (req, res) => {
  try {
    const filter = { status: "ACTIVE" };
    if (req.query.city) { const locationRegex = new RegExp(String(req.query.city).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); filter.$or = [{ city: locationRegex }, { area: locationRegex }, { address: locationRegex }]; }
    if (req.query.propertyType && ["PG", "FLAT", "ROOM", "HOSTEL", "OTHER"].includes(String(req.query.propertyType).toUpperCase())) filter.propertyType = String(req.query.propertyType).toUpperCase();
    if (req.query.maxRent !== undefined && Number.isFinite(Number(req.query.maxRent))) filter.rent = { $lte: Math.max(0, Number(req.query.maxRent)) };
    if (req.query.minRent !== undefined && Number.isFinite(Number(req.query.minRent))) filter.rent = { ...(filter.rent || {}), $gte: Math.max(0, Number(req.query.minRent)) };
    let properties = await Property.find(filter).sort({ createdAt: -1 }).limit(250).lean();
    const lat = Number(req.query.latitude), lng = Number(req.query.longitude), radius = Math.min(100, Math.max(1, Number(req.query.radiusKm) || 15));
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      const distanceKm = (p) => { if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) return Infinity; const rad = n => n * Math.PI / 180; const dLat = rad(p.latitude-lat), dLng = rad(p.longitude-lng); const a = Math.sin(dLat/2)**2 + Math.cos(rad(lat))*Math.cos(rad(p.latitude))*Math.sin(dLng/2)**2; return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); };
      properties = properties.map(p => ({ ...p, distanceKm: Math.round(distanceKm(p)*10)/10 })).filter(p => p.distanceKm <= radius).sort((a,b) => a.distanceKm-b.distanceKm);
    }
    res.json({ properties });
  } catch (e) { return validationError(res, e); }
};
exports.getProperty = async (req, res) => {
  if (badId(req.params.id)) return res.status(400).json({ message: "Invalid property ID" });
  try {
    const property = await Property.findOne({ _id: req.params.id, $or: [{ status: "ACTIVE" }, { landlordId: req.user.userId }] });
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json({ property });
  } catch (e) { return validationError(res, e); }
};
exports.updateProperty = async (req, res) => {
  if (badId(req.params.id)) return res.status(400).json({ message: "Invalid property ID" });
  try {
    const property = await Property.findOneAndUpdate({ _id: req.params.id, landlordId: req.user.userId }, { $set: pick(req.body) }, { new: true, runValidators: true });
    if (!property) return res.status(404).json({ message: "Property not found or you do not own this listing" });
    res.json({ message: "Property updated successfully", property });
  } catch (e) { return validationError(res, e); }
};
exports.deleteProperty = async (req, res) => {
  if (badId(req.params.id)) return res.status(400).json({ message: "Invalid property ID" });
  try {
    const property = await Property.findOneAndUpdate({ _id: req.params.id, landlordId: req.user.userId }, { $set: { status: "INACTIVE" } }, { new: true });
    if (!property) return res.status(404).json({ message: "Property not found or you do not own this listing" });
    res.json({ message: "Property deactivated successfully" });
  } catch (e) { return validationError(res, e); }
};
