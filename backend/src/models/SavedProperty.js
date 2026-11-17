const mongoose = require("mongoose");
const savedPropertySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  reminderShownAt: { type: Date, default: null },
  reminderDismissedAt: { type: Date, default: null },
}, { timestamps: true });
savedPropertySchema.index({ user: 1, property: 1 }, { unique: true });
savedPropertySchema.index({ user: 1, reminderShownAt: 1, reminderDismissedAt: 1, createdAt: 1 });
module.exports = mongoose.models.SavedProperty || mongoose.model("SavedProperty", savedPropertySchema);
