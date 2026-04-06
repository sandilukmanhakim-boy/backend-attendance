const express = require("express");
const app = express();

const helmet = require("helmet");

// Middleware
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const requestLogger = require("./middleware/requestLogger");

// Database
const { pool } = require("./config/db");

// =======================
// 🔐 SECURITY
// =======================
app.use(helmet());

// =======================
// 📦 BODY PARSER
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// 📁 STATIC FILE
// =======================
app.use("/uploads", express.static("uploads"));

// =======================
// 📊 LOGGER
// =======================
app.use(requestLogger);

// =======================
// 🧪 TEST DB (WAJIB ADA)
// =======================
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.status(200).json({
            success: true,
            message: "Database connected!",
            time: result.rows[0],
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Database error",
            error: err.message,
        });
    }
});

// =======================
// 🚀 ROUTES
// =======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// =======================
// ❌ 404 NOT FOUND
// =======================
app.use(notFound);

// =======================
// 🔥 ERROR HANDLER
// =======================
app.use(errorHandler);

module.exports = app;