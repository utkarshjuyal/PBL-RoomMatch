const mongoose = require("mongoose");

const tenantProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
  age: { type: Number, min: 16, max: 100 },
  gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"] },
  occupation: { type: String, trim: true, maxlength: 100 },
  collegeOrWorkplace: { type: String, trim: true, maxlength: 150 },
  preferredLocation: { type: String, trim: true },
  preferredCity: { type: String, trim: true },
  preferredArea: { type: String, trim: true },
  budgetMin: { type: Number, min: 0 },
  budgetMax: { type: Number, min: 0 },
  accommodationType: { type: String, enum: ["PG", "FLAT", "ROOM", "HOSTEL", "OTHER", ""] },
  preferredRoomType: { type: String, enum: ["SINGLE", "DOUBLE", "TRIPLE", "OTHER", ""] },
  preferredAmenities: { type: [String], default: [] },
  moveInDate: { type: Date },
  lifestyle: {
    smoking: { type: String, enum: ["yes", "no", "occasionally"] },
    drinking: { type: String, enum: ["yes", "no", "occasionally"] },
    pets: { type: String, enum: ["yes", "no", "comfortable"] },
    cleanliness: { type: String, enum: ["low", "medium", "high"] },
    sleepSchedule: { type: String, enum: ["early", "normal", "late"] }
  },
  roommatePreferences: {
    preferredGender: { type: String, enum: ["male", "female", "any"] },
    preferredAgeMin: { type: Number, min: 16, max: 100 },
    preferredAgeMax: { type: Number, min: 16, max: 100 }
  },
  bio: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

module.exports = mongoose.models.TenantProfile || mongoose.model("TenantProfile", tenantProfileSchema);
