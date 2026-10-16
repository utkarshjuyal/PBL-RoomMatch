const mongoose = require("mongoose");

const landlordProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  phone: { type: String, trim: true, maxlength: 20, default: "" },
  displayName: { type: String, trim: true, maxlength: 100, default: "" },
  bio: { type: String, trim: true, maxlength: 500, default: "" },
  city: { type: String, trim: true, maxlength: 100, default: "" }
}, { timestamps: true });

module.exports = mongoose.models.LandlordProfile || mongoose.model("LandlordProfile", landlordProfileSchema);
