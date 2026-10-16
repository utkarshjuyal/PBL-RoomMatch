const mongoose = require("mongoose");
const interactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  action: { type: String, enum: ["LIKE", "DISLIKE"], required: true }
}, { timestamps: true });
interactionSchema.index({ user: 1, property: 1 }, { unique: true });
module.exports = mongoose.models.Interaction || mongoose.model("Interaction", interactionSchema);
