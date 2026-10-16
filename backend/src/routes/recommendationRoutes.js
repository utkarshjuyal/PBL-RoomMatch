const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { getRecommendations } = require("../controllers/RecommendationController");
const router = express.Router();
router.get("/", protect, authorize("tenant"), getRecommendations);
module.exports = router;
