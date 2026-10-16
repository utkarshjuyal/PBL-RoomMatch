const LandlordProfile = require("../models/LandlordProfile");

const saveProfile = async (req, res) => {
  try {
    const allowed = ["phone", "displayName", "bio", "city"];
    const payload = {};
    for (const key of allowed) if (req.body[key] !== undefined) payload[key] = typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
    const profile = await LandlordProfile.findOneAndUpdate(
      { user: req.user.userId }, { $set: payload },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ message: "Landlord profile saved successfully", profile });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") return res.status(400).json({ message: error.message });
    console.error("Save landlord profile error:", error.message);
    res.status(500).json({ message: "Unable to save landlord profile" });
  }
};
const getProfile = async (req, res) => {
  try {
    const profile = await LandlordProfile.findOne({ user: req.user.userId });
    if (!profile) return res.status(404).json({ message: "Landlord profile not found" });
    res.json({ profile });
  } catch (error) {
    res.status(500).json({ message: "Unable to load landlord profile" });
  }
};
module.exports = { saveProfile, getProfile };
