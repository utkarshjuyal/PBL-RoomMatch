const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    codeHash: String,
    expiresAt: Date,
    attempts: { type: Number, default: 0 },
    sentAt: Date,
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["tenant", "landlord"], required: true },
    // True only for the dedicated, fictional accounts created by seedDemo.js.
    demoAccount: { type: Boolean, default: false, index: true, select: false },

    // New accounts start unverified. Verified by entering the emailed 6-digit code.
    emailVerified: { type: Boolean, default: false },
    emailVerification: { type: verificationSchema, select: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
