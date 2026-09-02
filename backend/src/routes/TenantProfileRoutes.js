const express = require("express");

const {
    createProfile,
    getProfile,
    updateProfile
} = require("../controllers/TenantProfileController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    authorize("tenant"),
    createProfile
);

router.get(
    "/",
    protect,
    authorize("tenant"),
    getProfile
);

router.put(
    "/",
    protect,
    authorize("tenant"),
    updateProfile
);

module.exports = router;