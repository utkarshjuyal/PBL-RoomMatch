const mongoose = require("mongoose");
const SavedProperty = require("../models/SavedProperty");
const Property = require("../models/Property");
const { SAVED_REMINDER_MINUTES } = require("../config/config");
const { reminderDueBefore } = require("../services/savedReminderPolicy");

exports.saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: "A valid propertyId is required" });
    const property = await Property.findOne({ _id: propertyId, status: "ACTIVE" }).select("_id");
    if (!property) return res.status(404).json({ message: "Active property not found" });
    let saved = await SavedProperty.findOne({ user: req.user.userId, property: propertyId });
    if (!saved) saved = await SavedProperty.create({ user: req.user.userId, property: propertyId, reminderShownAt: null, reminderDismissedAt: null });
    res.status(201).json({ message: "Property saved", saved });
  } catch (error) {
    if (error.code === 11000) {
      const saved = await SavedProperty.findOne({ user: req.user.userId, property: req.body.propertyId });
      return res.status(200).json({ message: "Property already saved", saved });
    }
    console.error("Save property error:", error.message);
    res.status(500).json({ message: "Unable to save property" });
  }
};

exports.getSaved = async (req, res) => {
  try {
    const saved = await SavedProperty.find({ user: req.user.userId }).sort({ createdAt: -1 }).populate({ path: "property", match: { status: "ACTIVE" } });
    res.json({ saved: saved.filter((item) => item.property) });
  } catch (error) { res.status(500).json({ message: "Unable to load saved properties" }); }
};

exports.getDueReminder = async (req, res) => {
  try {
    const dueBefore = reminderDueBefore(Date.now(), SAVED_REMINDER_MINUTES);
    const saved = await SavedProperty.findOneAndUpdate(
      { user: req.user.userId, createdAt: { $lte: dueBefore }, reminderShownAt: null, reminderDismissedAt: null },
      { $set: { reminderShownAt: new Date() } },
      { new: true, sort: { createdAt: 1 } },
    ).populate({ path: "property", match: { status: "ACTIVE" } });
    if (!saved || !saved.property) return res.json({ reminder: null, reminderMinutes: SAVED_REMINDER_MINUTES });
    res.json({ reminder: saved, reminderMinutes: SAVED_REMINDER_MINUTES });
  } catch (error) {
    console.error("Saved reminder error:", error.message);
    res.status(500).json({ message: "Unable to check saved-property reminders" });
  }
};

exports.dismissReminder = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.propertyId)) return res.status(400).json({ message: "Invalid property ID" });
    const saved = await SavedProperty.findOneAndUpdate(
      { user: req.user.userId, property: req.params.propertyId },
      { $set: { reminderDismissedAt: new Date() } },
      { new: true },
    );
    if (!saved) return res.status(404).json({ message: "Saved property not found" });
    res.json({ message: "Reminder dismissed" });
  } catch (error) { res.status(500).json({ message: "Unable to dismiss reminder" }); }
};

exports.removeSaved = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.propertyId)) return res.status(400).json({ message: "Invalid property ID" });
    await SavedProperty.deleteOne({ user: req.user.userId, property: req.params.propertyId });
    res.json({ message: "Saved property removed" });
  } catch (error) { res.status(500).json({ message: "Unable to remove saved property" }); }
};
