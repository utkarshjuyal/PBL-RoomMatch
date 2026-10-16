const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { saveProfile, getProfile } = require("../controllers/LandlordProfileController");
const router = express.Router();
router.use(protect, authorize("landlord"));
router.route("/").get(getProfile).post(saveProfile).put(saveProfile);
module.exports = router;
