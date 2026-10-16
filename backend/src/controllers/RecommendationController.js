const TenantProfile = require("../models/TenantProfile");
const Property = require("../models/Property");
const Interaction = require("../models/Interaction");
const SavedProperty = require("../models/SavedProperty");

exports.getRecommendations = async (req, res) => {
  try {
    const [profile, processed, saved] = await Promise.all([
      TenantProfile.findOne({ user: req.user.userId }).lean(),
      Interaction.find({ user: req.user.userId }).distinct("property"),
      SavedProperty.find({ user: req.user.userId }).distinct("property")
    ]);
    const exclude = [...processed, ...saved];
    const properties = await Property.find({ status: "ACTIVE", _id: { $nin: exclude } }).lean();
    const score = (p) => {
      if (!profile) return 0;
      let total = 0;
      const city = profile.preferredCity || profile.preferredLocation;
      if (city && p.city && city.trim().toLowerCase() === p.city.trim().toLowerCase()) total += 30;
      if (profile.preferredArea && p.area && profile.preferredArea.trim().toLowerCase() === p.area.trim().toLowerCase()) total += 10;
      if (profile.budgetMin != null && profile.budgetMax != null && p.rent >= profile.budgetMin && p.rent <= profile.budgetMax) total += 25;
      else if (profile.budgetMax != null && p.rent <= profile.budgetMax) total += 15;
      if (profile.preferredRoomType && p.roomType === profile.preferredRoomType) total += 15;
      if (profile.accommodationType && p.propertyType === profile.accommodationType) total += 10;
      const preferred = profile.preferredAmenities || [];
      if (preferred.length) total += Math.round(10 * preferred.filter(a => (p.amenities || []).some(x => x.toLowerCase() === a.toLowerCase())).length / preferred.length);
      return total;
    };
    properties.sort((a, b) => score(b) - score(a) || new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ recommendations: properties.map(p => ({ ...p, recommendationScore: score(p) })) });
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(500).json({ message: "Unable to generate recommendations" });
  }
};
