const mongoose = require("mongoose");
const SavedProperty = require("../models/SavedProperty");
const Property = require("../models/Property");
exports.saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: "A valid propertyId is required" });
    const property = await Property.findOne({ _id: propertyId, status: "ACTIVE" });
    if (!property) return res.status(404).json({ message: "Active property not found" });
    const saved = await SavedProperty.findOneAndUpdate({ user: req.user.userId, property: propertyId }, { $set: {} }, { new: true, upsert: true, runValidators: true });
    res.status(201).json({ message: "Property saved", saved });
  } catch (error) {
    console.error("Save property error:", error.message);
    res.status(500).json({ message: "Unable to save property" });
  }
};
exports.getSaved = async (req, res) => {
  try {
    const saved = await SavedProperty.find({ user: req.user.userId }).sort({ createdAt: -1 }).populate({ path: "property", match: { status: "ACTIVE" } });
    res.json({ saved: saved.filter(x => x.property) });
  } catch (error) { res.status(500).json({ message: "Unable to load saved properties" }); }
};
exports.removeSaved = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.propertyId)) return res.status(400).json({ message: "Invalid property ID" });
    await SavedProperty.deleteOne({ user: req.user.userId, property: req.params.propertyId });
    res.json({ message: "Saved property removed" });
  } catch (error) { res.status(500).json({ message: "Unable to remove saved property" }); }
};
