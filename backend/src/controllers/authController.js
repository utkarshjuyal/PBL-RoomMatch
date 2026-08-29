const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


// ==============================
// REGISTER
// ==============================

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check role
        if (!["tenant", "landlord"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        // Response
        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// ==============================
// LOGIN
// ==============================

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    register,
    login
};