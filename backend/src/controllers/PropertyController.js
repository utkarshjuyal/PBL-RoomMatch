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
    if (req.query.city) filter.city = new RegExp(String(req.query.city).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const properties = await Property.find(filter).sort({ createdAt: -1 }).limit(100);
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
