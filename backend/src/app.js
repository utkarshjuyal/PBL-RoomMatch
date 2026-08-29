const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();


// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());

app.use(express.json());


// ==============================
// ROUTES
// ==============================

app.use("/api/auth", authRoutes);


// ==============================
// TEST ROUTE
// ==============================

app.get("/", (req, res) => {
    res.json({
        message: "RoomMatch API is running"
    });
});


module.exports = app;