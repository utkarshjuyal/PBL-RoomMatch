const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  landlordId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 2000, default: "" },
  propertyType: { type: String, enum: ["PG", "FLAT", "ROOM", "HOSTEL", "OTHER"], required: true },
  roomType: { type: String, enum: ["SINGLE", "DOUBLE", "TRIPLE", "OTHER"], required: true },
  city: { type: String, required: true, trim: true },
  area: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
  rent: { type: Number, required: true, min: 0 },
  securityDeposit: { type: Number, min: 0, default: 0 },
  availableFrom: { type: Date },
  amenities: { type: [String], default: [] },
  images: { type: [String], default: [] },
  latitude: { type: Number },
  longitude: { type: Number },
  status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE", index: true }
}, { timestamps: true });

module.exports = mongoose.models.Property || mongoose.model("Property", propertySchema);
