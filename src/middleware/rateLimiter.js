const rateLimit = require("express-rate-limit");

/**
 * ==============================
 * GLOBAL OPTIONS (optional reuse)
 * ==============================
 */
const baseConfig = {
    standardHeaders: true,
    legacyHeaders: false,
};

/**
 * ==============================
 * LOGIN LIMITER (ANTI BRUTE FORCE)
 * ==============================
 */
const loginLimiter = rateLimit({
    ...baseConfig,
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 5,
    message: {
        success: false,
        message: "Terlalu banyak percobaan login, coba lagi nanti",
    },
});

/**
 * ==============================
 * ATTENDANCE LIMITER (CHECKIN/OUT)
 * ==============================
 */
const attendanceLimiter = rateLimit({
    ...baseConfig,
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 10,
    message: {
        success: false,
        message: "Terlalu banyak request attendance",
    },
});

/**
 * ==============================
 * GLOBAL API LIMITER (OPTIONAL)
 * ==============================
 */
const apiLimiter = rateLimit({
    ...baseConfig,
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Terlalu banyak request API",
    },
});

/**
 * ==============================
 * EXPORT
 * ==============================
 */
module.exports = {
    loginLimiter,
    attendanceLimiter,
    apiLimiter,
};