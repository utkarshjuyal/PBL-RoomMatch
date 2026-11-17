const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { getRecommendations, getSimilarProperties } = require("../controllers/RecommendationController");
const router = express.Router();
router.use(protect, authorize("tenant"));
router.get("/:propertyId/similar", getSimilarProperties);
router.get("/", getRecommendations);
module.exports = router;
