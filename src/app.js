const express = require("express");
const app = express();

const helmet = require("helmet");

const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const requestLogger = require("./middleware/requestLogger");

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
// 🚀 ROUTES
// =======================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// =======================
// ❌ 404
// =======================
app.use(notFound);

// =======================
// 🔥 ERROR HANDLER
// =======================
app.use(errorHandler);

module.exports = app;