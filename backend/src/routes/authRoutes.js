const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();


// ==============================
// PUBLIC
// ==============================

router.post("/register", register);

router.post("/login", login);


// ==============================
// AUTHENTICATED
// ==============================

router.get("/me", protect, (req, res) => {
    res.json({
        message: "Authenticated user",
        user: req.user
    });
});


// ==============================
// TENANT ONLY
// ==============================

router.get(
    "/tenant-test",
    protect,
    authorize("tenant"),
    (req, res) => {
        res.json({
            message: "Welcome Tenant!"
        });
    }
);


// ==============================
// LANDLORD ONLY
// ==============================

router.get(
    "/landlord-test",
    protect,
    authorize("landlord"),
    (req, res) => {
        res.json({
            message: "Welcome Landlord!"
        });
    }
);


module.exports = router;