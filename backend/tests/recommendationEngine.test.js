const test = require("node:test");
const assert = require("node:assert/strict");
const {
  USER_MATCH_WEIGHTS,
  PROPERTY_SIMILARITY_WEIGHTS,
  calculateUserMatch,
  calculatePropertySimilarity,
  rankRecommendations,
  filterRecommendationCandidates,
} = require("../src/services/recommendationEngine");

const profile = {
  preferredCity: "Dehradun",
  preferredArea: "Prem Nagar",
  budgetMin: 5000,
  budgetMax: 9000,
  preferredRoomType: "DOUBLE",
  accommodationType: "PG",
  preferredAmenities: ["WiFi", "Food", "Laundry"],
};
const property = (overrides = {}) => ({
  _id: "candidate-1", landlordId: "owner-1", city: "Dehradun", area: "Prem Nagar",
  rent: 7000, roomType: "DOUBLE", propertyType: "PG", amenities: ["WiFi", "Food", "Laundry"],
  sharingArrangement: "DOUBLE_SHARING", furnishing: "FURNISHED", status: "ACTIVE", ...overrides,
});

test("all documented scoring weights total 100", () => {
  assert.equal(Object.values(USER_MATCH_WEIGHTS).reduce((a, b) => a + b, 0), 100);
  assert.equal(Object.values(PROPERTY_SIMILARITY_WEIGHTS).reduce((a, b) => a + b, 0), 100);
});

test("all declared profile preferences match and score 100", () => {
  assert.equal(calculateUserMatch(profile, property()).score, 100);
});

test("city and locality comparison is case-insensitive and normalized", () => {
  const result = calculateUserMatch({ preferredCity: " DEHRADUN ", preferredArea: "prem-nagar" }, property({ city: "dehradun", area: "Prem Nagar" }));
  assert.equal(result.score, 100);
});

test("budget uses numeric range comparisons", () => {
  assert.equal(calculateUserMatch({ budgetMin: "5000", budgetMax: "9000" }, property({ rent: "7500" })).score, 100);
  assert.ok(calculateUserMatch({ budgetMax: 6000 }, property({ rent: 12000 })).score < 100);
});

test("missing property values do not earn preference points", () => {
  const result = calculateUserMatch(profile, property({ area: "", rent: undefined, amenities: [] }));
  assert.ok(result.score < 100);
  assert.equal(result.breakdown.find((item) => item.key === "area").earned, 0);
});

test("missing optional profile criteria do not dilute stated preferences", () => {
  const result = calculateUserMatch({ preferredRoomType: "DOUBLE" }, property());
  assert.equal(result.score, 100);
  assert.equal(result.availableWeight, 15);
});

test("an empty profile does not fabricate a match", () => {
  assert.equal(calculateUserMatch({}, property()).score, 0);
});

test("amenity matching uses a set-style overlap", () => {
  const result = calculateUserMatch({ preferredAmenities: ["wifi", "WiFi", "food"] }, property({ amenities: ["WIFI"] }));
  assert.equal(result.score, 50);
});

test("content similarity rewards shared area, room type, rent and amenities", () => {
  const near = calculatePropertySimilarity(property(), property({ _id: "candidate-2", rent: 7600 }));
  const far = calculatePropertySimilarity(property(), property({ _id: "candidate-3", city: "Haridwar", area: "Jwalapur", rent: 18000, propertyType: "FLAT", roomType: "SINGLE", amenities: ["AC"] }));
  assert.ok(near.score > far.score);
});

test("likes influence ranking without returning the exact liked listing", () => {
  const liked = property({ _id: "liked-1" });
  const similar = property({ _id: "similar-1", rent: 7400, createdAt: new Date("2026-01-01") });
  const other = property({ _id: "other-1", area: "Jakhan", rent: 14000, propertyType: "FLAT", roomType: "SINGLE", amenities: ["AC"] });
  const ranked = rankRecommendations([other, similar], {}, [{ property: liked, createdAt: new Date() }], Date.now());
  assert.equal(ranked[0]._id, "similar-1");
});

test("recommendation scores remain within 0-100 and are deterministic", () => {
  const candidates = [property({ _id: "b" }), property({ _id: "a", rent: 12000 })];
  const first = rankRecommendations(candidates, profile, [], 123456789);
  const second = rankRecommendations(candidates, profile, [], 123456789);
  assert.deepEqual(first.map((item) => item.recommendationScore), second.map((item) => item.recommendationScore));
  first.forEach((item) => assert.ok(item.recommendationScore >= 0 && item.recommendationScore <= 100));
});

test("three consistent likes increase the similarity contribution", () => {
  const liked = property({ _id: "liked-1" });
  const ranked = rankRecommendations([property({ _id: "candidate-2" })], profile, [
    { property: liked, createdAt: new Date() },
    { property: { ...liked, _id: "liked-2" }, createdAt: new Date() },
    { property: { ...liked, _id: "liked-3" }, createdAt: new Date() },
  ], Date.now());
  assert.equal(ranked[0].rankingWeights.likedProperties, 0.3);
});


test("candidate retrieval excludes liked, disliked, saved, duplicate and inactive listings", () => {
  const activeA = property({ _id: "a" });
  const activeB = property({ _id: "b" });
  const activeC = property({ _id: "c" });
  const inactive = property({ _id: "inactive", status: "INACTIVE" });
  const candidates = filterRecommendationCandidates(
    [activeA, activeA, activeB, activeC, inactive],
    [{ property: "a", action: "LIKE" }, { property: "c", action: "DISLIKE" }],
    ["b"],
  );
  assert.deepEqual(candidates, []);
});

test("cold-start ranking remains usable without inventing match scores", () => {
  const older = property({ _id: "older", createdAt: new Date("2026-01-01") });
  const newer = property({ _id: "newer", createdAt: new Date("2026-02-01") });
  const ranked = rankRecommendations([older, newer], {}, [], Date.now());
  assert.equal(ranked[0]._id, "newer");
  assert.ok(ranked.every((item) => item.matchScore === 0 && item.recommendationScore === 0));
});

test("ranking removes duplicate ids but keeps distinct id-less fixtures", () => {
  const first = property({ _id: "duplicate" });
  const second = property({ _id: "duplicate", rent: 8000 });
  const withoutIdA = { ...property(), _id: undefined, id: undefined };
  const withoutIdB = { ...property(), _id: undefined, id: undefined, rent: 9000 };
  const ranked = rankRecommendations([first, second, withoutIdA, withoutIdB], {}, [], 1234);
  assert.equal(ranked.length, 3);
});


test("explicit roommate gender and move-in date constraints are hard filters", () => {
  const fixtures = [
    { _id: "a", status: "ACTIVE", genderPreference: "FEMALE", availableFrom: "2026-12-01" },
    { _id: "b", status: "ACTIVE", genderPreference: "MALE", availableFrom: "2026-12-01" },
    { _id: "c", status: "ACTIVE", genderPreference: "ANY", availableFrom: "2026-12-01" },
    { _id: "d", status: "ACTIVE", genderPreference: "FEMALE", availableFrom: "2027-02-01" },
  ];
  const profile = { roommatePreferences: { preferredGender: "female" }, moveInDate: "2027-01-01" };
  const eligible = filterRecommendationCandidates(fixtures, [], [], profile).map((item) => item._id);
  assert.deepEqual(eligible, ["a", "c"]);
});


test("property similarity includes availability when both dates are known", () => {
  const nearbyDates = calculatePropertySimilarity(
    property({ availableFrom: "2026-12-01" }),
    property({ _id: "source", availableFrom: "2026-12-08" }),
  );
  const distantDates = calculatePropertySimilarity(
    property({ availableFrom: "2027-06-01" }),
    property({ _id: "source", availableFrom: "2026-12-01" }),
  );
  assert.ok(nearbyDates.score > distantDates.score);
  assert.ok(nearbyDates.breakdown.includes("Similar availability date"));
});
