const USER_MATCH_WEIGHTS = Object.freeze({
  city: 30,
  area: 10,
  budget: 25,
  roomType: 15,
  accommodationType: 10,
  amenities: 10,
});

const PROPERTY_SIMILARITY_WEIGHTS = Object.freeze({
  city: 10,
  area: 15,
  rent: 18,
  propertyType: 10,
  roomType: 14,
  sharingArrangement: 9,
  amenities: 14,
  furnishing: 5,
  availability: 5,
});

const normalize = (value) => String(value ?? "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const asFiniteNumber = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const values = (input) => [...new Set((Array.isArray(input) ? input : [])
  .map(normalize)
  .filter(Boolean))];

const sameValue = (left, right) => Boolean(normalize(left) && normalize(right) && normalize(left) === normalize(right));

const locationMatch = (left, right) => {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  if (a === b) return true;
  const aParts = new Set(a.split(" "));
  const bParts = new Set(b.split(" "));
  return [...aParts].some((part) => part.length > 2 && bParts.has(part));
};

function scoreBudget(profile, property) {
  const min = asFiniteNumber(profile?.budgetMin);
  const max = asFiniteNumber(profile?.budgetMax);
  const rent = asFiniteNumber(property?.rent);
  if ((min === null && max === null) || rent === null) return null;
  if (min !== null && max !== null) {
    if (min > max) return 0;
    if (rent >= min && rent <= max) return 1;
    const distance = rent < min ? min - rent : rent - max;
    const range = Math.max(max - min, max * 0.25, 1000);
    return Math.max(0, 1 - distance / range);
  }
  if (max !== null) {
    if (rent <= max) return 1;
    return Math.max(0, 1 - (rent - max) / Math.max(max * 0.35, 1000));
  }
  if (rent >= min) return 1;
  return Math.max(0, rent / Math.max(min, 1));
}

function calculateUserMatch(profile = {}, property = {}) {
  const preferredCity = profile.preferredCity || profile.preferredLocation;
  const preferredArea = profile.preferredArea;
  const preferredAmenities = values(profile.preferredAmenities);
  const criteria = [
    { key: "city", label: "Preferred city", active: Boolean(normalize(preferredCity)), ratio: locationMatch(preferredCity, property.city) ? 1 : 0 },
    { key: "area", label: "Preferred locality", active: Boolean(normalize(preferredArea)), ratio: locationMatch(preferredArea, property.area) ? 1 : 0 },
    { key: "budget", label: "Budget compatibility", active: asFiniteNumber(profile.budgetMin) !== null || asFiniteNumber(profile.budgetMax) !== null, ratio: scoreBudget(profile, property) },
    { key: "roomType", label: "Room type", active: Boolean(normalize(profile.preferredRoomType)), ratio: sameValue(profile.preferredRoomType, property.roomType) ? 1 : 0 },
    { key: "accommodationType", label: "Accommodation type", active: Boolean(normalize(profile.accommodationType)), ratio: sameValue(profile.accommodationType, property.propertyType) ? 1 : 0 },
    { key: "amenities", label: "Preferred amenities", active: preferredAmenities.length > 0, ratio: preferredAmenities.length ? preferredAmenities.filter((item) => values(property.amenities).includes(item)).length / preferredAmenities.length : 0 },
  ];

  const active = criteria.filter((item) => item.active);
  const availableWeight = active.reduce((sum, item) => sum + USER_MATCH_WEIGHTS[item.key], 0);
  const earnedWeight = active.reduce((sum, item) => sum + USER_MATCH_WEIGHTS[item.key] * (item.ratio ?? 0), 0);
  const score = availableWeight ? Math.round((earnedWeight / availableWeight) * 100) : 0;
  const breakdown = active.map((item) => {
    const weight = USER_MATCH_WEIGHTS[item.key];
    const earned = Math.round(weight * (item.ratio ?? 0) * 10) / 10;
    return { key: item.key, label: item.label, weight, earned, matched: (item.ratio ?? 0) >= 0.999 };
  });
  return { score: Math.max(0, Math.min(100, score)), availableWeight, breakdown };
}

function jaccard(left, right) {
  const a = new Set(values(left));
  const b = new Set(values(right));
  if (!a.size && !b.size) return null;
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((value) => b.has(value)).length;
  const union = new Set([...a, ...b]).size;
  return union ? intersection / union : 0;
}

function relativeRentSimilarity(left, right) {
  const a = asFiniteNumber(left);
  const b = asFiniteNumber(right);
  if (a === null || b === null) return null;
  const tolerance = Math.max(Math.min(a, b) * 0.7, 2500);
  return Math.max(0, 1 - Math.abs(a - b) / tolerance);
}

function availabilitySimilarity(left, right) {
  const a = left ? new Date(left).getTime() : NaN;
  const b = right ? new Date(right).getTime() : NaN;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  const differenceDays = Math.abs(a - b) / 86400000;
  return Math.max(0, 1 - differenceDays / 90);
}

function calculatePropertySimilarity(left = {}, right = {}) {
  const comparisons = [
    { key: "city", label: "Same city", ratio: sameValue(left.city, right.city) ? 1 : 0, available: Boolean(normalize(left.city) || normalize(right.city)) },
    { key: "area", label: "Nearby locality", ratio: locationMatch(left.area, right.area) ? 1 : 0, available: Boolean(normalize(left.area) || normalize(right.area)) },
    { key: "rent", label: "Similar monthly rent", ratio: relativeRentSimilarity(left.rent, right.rent), available: asFiniteNumber(left.rent) !== null || asFiniteNumber(right.rent) !== null },
    { key: "propertyType", label: "Same accommodation type", ratio: sameValue(left.propertyType, right.propertyType) ? 1 : 0, available: Boolean(normalize(left.propertyType) || normalize(right.propertyType)) },
    { key: "roomType", label: "Same room type", ratio: sameValue(left.roomType, right.roomType) ? 1 : 0, available: Boolean(normalize(left.roomType) || normalize(right.roomType)) },
    { key: "sharingArrangement", label: "Similar sharing arrangement", ratio: sameValue(left.sharingArrangement, right.sharingArrangement) ? 1 : 0, available: Boolean(normalize(left.sharingArrangement) || normalize(right.sharingArrangement)) },
    { key: "amenities", label: "Overlapping facilities", ratio: jaccard(left.amenities, right.amenities), available: values(left.amenities).length > 0 || values(right.amenities).length > 0 },
    { key: "furnishing", label: "Similar furnishing", ratio: sameValue(left.furnishing, right.furnishing) ? 1 : 0, available: Boolean(normalize(left.furnishing) || normalize(right.furnishing)) },
    { key: "availability", label: "Similar availability date", ratio: availabilitySimilarity(left.availableFrom, right.availableFrom), available: Boolean(left.availableFrom && right.availableFrom && availabilitySimilarity(left.availableFrom, right.availableFrom) !== null) },
  ];
  const available = comparisons.filter((item) => item.available);
  const totalWeight = available.reduce((sum, item) => sum + PROPERTY_SIMILARITY_WEIGHTS[item.key], 0);
  const earned = available.reduce((sum, item) => sum + PROPERTY_SIMILARITY_WEIGHTS[item.key] * (item.ratio ?? 0), 0);
  const score = totalWeight ? Math.round((earned / totalWeight) * 100) : 0;
  const breakdown = available
    .filter((item) => (item.ratio ?? 0) >= 0.45)
    .sort((a, b) => (b.ratio ?? 0) - (a.ratio ?? 0))
    .map((item) => item.label);
  return { score: Math.max(0, Math.min(100, score)), breakdown };
}

function recencyWeight(createdAt, now = Date.now()) {
  const timestamp = createdAt ? new Date(createdAt).getTime() : 0;
  if (!Number.isFinite(timestamp) || timestamp <= 0) return 0.8;
  const ageDays = Math.max(0, (now - timestamp) / 86400000);
  return 0.65 + 0.35 * Math.exp(-ageDays / 45);
}

function similarityToLikes(property, likedInteractions, now = Date.now()) {
  const likes = (likedInteractions || [])
    .map((item) => ({ property: item.property || item, createdAt: item.createdAt }))
    .filter((item) => item.property && String(item.property._id || item.property.id) !== String(property._id || property.id));
  if (!likes.length) return { score: 0, breakdown: [] };
  let weightedTotal = 0;
  let totalWeight = 0;
  const reasonWeights = new Map();
  likes.forEach((like) => {
    const weight = recencyWeight(like.createdAt, now);
    const result = calculatePropertySimilarity(property, like.property);
    weightedTotal += result.score * weight;
    totalWeight += weight;
    result.breakdown.forEach((reason) => reasonWeights.set(reason, (reasonWeights.get(reason) || 0) + weight));
  });
  return {
    score: totalWeight ? Math.round(weightedTotal / totalWeight) : 0,
    breakdown: [...reasonWeights.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([label]) => label),
  };
}

function diversifyByLandlord(sorted, maxPerLandlord = 2) {
  const firstPass = [];
  const deferred = [];
  const count = new Map();
  sorted.forEach((item) => {
    const owner = String(item.landlordId || "unknown");
    const current = count.get(owner) || 0;
    if (current < maxPerLandlord) {
      firstPass.push(item);
      count.set(owner, current + 1);
    } else deferred.push(item);
  });
  return [...firstPass, ...deferred];
}

function passesHardConstraints(profile = {}, property = {}) {
  const preferredGender = normalize(profile.roommatePreferences?.preferredGender);
  const listingGender = normalize(property.genderPreference);
  if (preferredGender && preferredGender !== "any" && listingGender && listingGender !== "any" && preferredGender !== listingGender) return false;

  const moveInDate = profile.moveInDate ? new Date(profile.moveInDate).getTime() : NaN;
  const availableFrom = property.availableFrom ? new Date(property.availableFrom).getTime() : NaN;
  if (Number.isFinite(moveInDate) && Number.isFinite(availableFrom) && availableFrom > moveInDate) return false;
  return true;
}

function filterRecommendationCandidates(properties, interactions = [], savedIds = [], profile = {}) {
  const excluded = new Set([
    ...interactions.map((item) => String(item.property?._id || item.property || item._id || "")),
    ...savedIds.map((item) => String(item?._id || item)),
  ].filter(Boolean));
  const seen = new Set();
  return (properties || []).filter((property) => {
    if (!property || property.status !== "ACTIVE" || !passesHardConstraints(profile, property)) return false;
    const id = String(property._id || property.id || "");
    if (id && (seen.has(id) || excluded.has(id))) return false;
    if (id) seen.add(id);
    return true;
  });
}

function rankRecommendations(properties, profile, likedInteractions, now = Date.now()) {
  const likes = likedInteractions || [];
  const similarityWeight = likes.length >= 5 ? 0.4 : likes.length >= 3 ? 0.3 : likes.length ? 0.2 : 0;
  const preferenceWeight = 1 - similarityWeight;
  const seenIds = new Set();
  const unique = (properties || []).filter((property) => {
    if (!property || (property.status && property.status !== "ACTIVE")) return false;
    const id = property._id || property.id;
    if (!id) return true;
    const key = String(id);
    if (seenIds.has(key)) return false;
    seenIds.add(key);
    return true;
  });
  const ranked = unique.map((property) => {
    const userMatch = calculateUserMatch(profile, property);
    const similarity = similarityToLikes(property, likes, now);
    let effectivePreferenceWeight = preferenceWeight;
    let effectiveSimilarityWeight = similarityWeight;
    if (!userMatch.availableWeight && likes.length) {
      effectivePreferenceWeight = 0;
      effectiveSimilarityWeight = 1;
    }
    const recommendationScore = Math.round(userMatch.score * effectivePreferenceWeight + similarity.score * effectiveSimilarityWeight);
    return {
      ...property,
      matchScore: userMatch.score,
      recommendationScore: Math.max(0, Math.min(100, recommendationScore)),
      similarityScore: similarity.score,
      matchBreakdown: userMatch.breakdown,
      similarityReasons: similarity.breakdown,
      rankingWeights: { preferences: effectivePreferenceWeight, likedProperties: effectiveSimilarityWeight },
    };
  });
  ranked.sort((a, b) => b.recommendationScore - a.recommendationScore || b.matchScore - a.matchScore || new Date(b.createdAt || 0) - new Date(a.createdAt || 0) || String(a._id).localeCompare(String(b._id)));
  return diversifyByLandlord(ranked);
}

function rankSimilarProperties(source, properties) {
  return (properties || [])
    .filter((property) => String(property._id) !== String(source._id))
    .map((property) => {
      const similarity = calculatePropertySimilarity(property, source);
      return { ...property, similarityScore: similarity.score, similarityReasons: similarity.breakdown };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore || new Date(b.createdAt || 0) - new Date(a.createdAt || 0) || String(a._id).localeCompare(String(b._id)));
}

module.exports = {
  USER_MATCH_WEIGHTS,
  PROPERTY_SIMILARITY_WEIGHTS,
  calculateUserMatch,
  calculatePropertySimilarity,
  similarityToLikes,
  rankRecommendations,
  rankSimilarProperties,
  filterRecommendationCandidates,
  passesHardConstraints,
};
