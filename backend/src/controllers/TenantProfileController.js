const TenantProfile = require("../models/TenantProfile");

const createProfile = async (req, res) => {
    try {
        const existingProfile = await TenantProfile.findOne({
            user: req.user.userId
        });

        if (existingProfile) {
            return res.status(409).json({
                message: "Tenant profile already exists"
            });
        }

        const profile = await TenantProfile.create({
            user: req.user.userId,
            ...req.body
        });

        return res.status(201).json({
            message: "Tenant profile created successfully",
            profile
        });
    } catch (error) {
        console.error("Create profile error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await TenantProfile.findOne({
            user: req.user.userId
        });

        if (!profile) {
            return res.status(404).json({
                message: "Tenant profile not found"
            });
        }

        return res.status(200).json({
            profile
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const profile = await TenantProfile.findOneAndUpdate(
            {
                user: req.user.userId
            },
            {
                $set: req.body
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!profile) {
            return res.status(404).json({
                message: "Tenant profile not found"
            });
        }

        return res.status(200).json({
            message: "Tenant profile updated successfully",
            profile
        });
    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    createProfile,
    getProfile,
    updateProfile
};