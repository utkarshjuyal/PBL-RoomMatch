const mongoose = require("mongoose");
const Interaction = require("../models/Interaction");
const Property = require("../models/Property");
exports.recordInteraction = async (req, res) => {
  try {
    const { propertyId, action } = req.body;
    if (!mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: "A valid propertyId is required" });
    if (!["LIKE", "DISLIKE"].includes(action)) return res.status(400).json({ message: "Action must be LIKE or DISLIKE" });
    const property = await Property.findOne({ _id: propertyId, status: "ACTIVE" });
    if (!property) return res.status(404).json({ message: "Active property not found" });
    const interaction = await Interaction.findOneAndUpdate({ user: req.user.userId, property: propertyId }, { $set: { action } }, { new: true, upsert: true, runValidators: true });
    res.json({ message: "Interaction saved", interaction });
  } catch (error) {
    console.error("Interaction error:", error.message);
    res.status(500).json({ message: "Unable to save interaction" });
  }
};
exports.getInteractions = async (req, res) => {
  try {
    const filter = { user: req.user.userId };
    if (req.query.action && ["LIKE", "DISLIKE"].includes(req.query.action)) filter.action = req.query.action;
    const interactions = await Interaction.find(filter).sort({ createdAt: -1 }).populate({ path: "property", match: { status: "ACTIVE" } });
    res.json({ interactions: interactions.filter(x => x.property) });
  } catch (error) { res.status(500).json({ message: "Unable to load interactions" }); }
};
