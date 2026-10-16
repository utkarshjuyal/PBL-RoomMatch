const TenantProfile = require("../models/TenantProfile");

const cleanPayload = (body) => {
  const allowed = ["age", "gender", "occupation", "collegeOrWorkplace", "preferredLocation", "preferredCity", "preferredArea", "budgetMin", "budgetMax", "accommodationType", "preferredRoomType", "preferredAmenities", "moveInDate", "lifestyle", "roommatePreferences", "bio"];
  const result = {};
  for (const key of allowed) if (Object.prototype.hasOwnProperty.call(body, key)) result[key] = body[key];
  for (const key of ["age", "budgetMin", "budgetMax"]) if (result[key] === "") delete result[key]; else if (result[key] != null) result[key] = Number(result[key]);
  if (result.moveInDate === "") delete result.moveInDate;
  if (result.preferredAmenities && !Array.isArray(result.preferredAmenities)) result.preferredAmenities = [];
  return result;
};

const createProfile = async (req, res) => {
  try {
    const payload = cleanPayload(req.body);
    if (payload.budgetMin != null && payload.budgetMax != null && payload.budgetMin > payload.budgetMax) return res.status(400).json({ message: "Minimum budget cannot exceed maximum budget" });
    const profile = await TenantProfile.findOneAndUpdate(
      { user: req.user.userId }, { $set: payload },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ message: "Tenant profile saved successfully", profile });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") return res.status(400).json({ message: error.message });
    console.error("Save tenant profile error:", error.message);
    return res.status(500).json({ message: "Unable to save tenant profile" });
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await TenantProfile.findOne({ user: req.user.userId });
    if (!profile) return res.status(404).json({ message: "Tenant profile not found" });
    return res.json({ profile });
  } catch (error) {
    console.error("Get tenant profile error:", error.message);
    return res.status(500).json({ message: "Unable to load tenant profile" });
  }
};
module.exports = { createProfile, getProfile, updateProfile: createProfile };
