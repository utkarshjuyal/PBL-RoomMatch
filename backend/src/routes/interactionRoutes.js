const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const c = require("../controllers/InteractionController");
const router = express.Router();
router.use(protect, authorize("tenant"));
router.route("/").get(c.getInteractions).post(c.recordInteraction);
module.exports = router;
