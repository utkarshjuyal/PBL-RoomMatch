const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        emailVerified: { type: Boolean, default: true },
        emailVerificationTokenHash: { type: String, default: null, select: false },
        emailVerificationExpires: { type: Date, default: null, select: false },

        role: {
            type: String,
            enum: ["tenant", "landlord"],
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;