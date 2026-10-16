const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const c = require("../controllers/PropertyController");
const upload = require("../middleware/uploadImages");
const router = express.Router();
router.get("/", protect, authorize("tenant"), c.getProperties);
router.get("/mine", protect, authorize("landlord"), c.getMyProperties);
router.post("/images", protect, authorize("landlord"), (req, res) => {
  upload.array("images", 8)(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || "Image upload failed" });
    if (!req.files?.length) return res.status(400).json({ message: "Choose at least one image" });
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    res.status(201).json({ images: req.files.map((file) => `${baseUrl}/uploads/${file.filename}`) });
  });
});
router.post("/", protect, authorize("landlord"), c.createProperty);
router.get("/:id", protect, c.getProperty);
router.put("/:id", protect, authorize("landlord"), c.updateProperty);
router.delete("/:id", protect, authorize("landlord"), c.deleteProperty);
module.exports = router;
