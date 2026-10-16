const mongoose = require("mongoose");
const savedPropertySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true }
}, { timestamps: true });
savedPropertySchema.index({ user: 1, property: 1 }, { unique: true });
module.exports = mongoose.models.SavedProperty || mongoose.model("SavedProperty", savedPropertySchema);
