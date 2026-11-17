const mongoose = require("mongoose");
const TenantProfile = require("../models/TenantProfile");
const Property = require("../models/Property");
const Interaction = require("../models/Interaction");
const SavedProperty = require("../models/SavedProperty");
const { rankRecommendations, rankSimilarProperties, filterRecommendationCandidates, USER_MATCH_WEIGHTS, PROPERTY_SIMILARITY_WEIGHTS } = require("../services/recommendationEngine");

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [profile, interactions, savedIds, properties] = await Promise.all([
      TenantProfile.findOne({ user: userId }).lean(),
      Interaction.find({ user: userId }).select("property action createdAt").lean(),
      SavedProperty.find({ user: userId }).distinct("property"),
      Property.find({ status: "ACTIVE" }).sort({ createdAt: -1 }).limit(250).lean(),
    ]);
    const candidates = filterRecommendationCandidates(properties, interactions, savedIds, profile || {});
    const likedIds = interactions.filter((item) => item.action === "LIKE").map((item) => item.property);
    const likedProperties = likedIds.length
      ? await Property.find({ _id: { $in: likedIds }, status: "ACTIVE" }).lean()
      : [];
    const likedById = new Map(likedProperties.map((property) => [String(property._id), property]));
    const likes = interactions
      .filter((item) => item.action === "LIKE")
      .map((item) => ({ property: likedById.get(String(item.property)), createdAt: item.createdAt }))
      .filter((item) => item.property)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const recommendations = rankRecommendations(candidates, profile || {}, likes);
    res.json({
      recommendations,
      scoring: {
        userMatchWeights: USER_MATCH_WEIGHTS,
        propertySimilarityWeights: PROPERTY_SIMILARITY_WEIGHTS,
        likedPropertyCount: likes.length,
        note: "Match score measures stated preferences. Similarity score compares the listing with active properties the tenant has liked. Ranking weights are returned per property.",
      },
    });
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(500).json({ message: "Unable to generate recommendations" });
  }
};

exports.getSimilarProperties = async (req, res) => {
  try {
    const { propertyId } = req.params;
    if (!mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: "Invalid property ID" });
    const source = await Property.findOne({ _id: propertyId, status: "ACTIVE" }).lean();
    if (!source) return res.status(404).json({ message: "Property not found" });
    const candidates = await Property.find({ status: "ACTIVE", _id: { $ne: propertyId } }).sort({ createdAt: -1 }).limit(250).lean();
    const similar = rankSimilarProperties(source, candidates).slice(0, 8);
    res.json({ sourcePropertyId: propertyId, similar });
  } catch (error) {
    console.error("Similar property error:", error.message);
    res.status(500).json({ message: "Unable to find similar properties" });
  }
};
