const express = require("express");
const { createProfile, getProfile, updateProfile } = require("../controllers/TenantProfileController");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const router = express.Router();
router.use(protect, authorize("tenant"));
router.route("/").get(getProfile).post(createProfile).put(updateProfile);
module.exports = router;
