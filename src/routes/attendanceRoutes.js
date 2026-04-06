const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
// ❌ sementara NONAKTIFKAN limiter biar aman dulu
// const { attendanceLimiter } = require("../middleware/rateLimiter");

const attendanceController = require("../controllers/attendanceController");

// ==============================
// CHECK-IN (dengan foto)
// ==============================
router.post(
    "/checkin",
    verifyToken,
    allowRoles("employee", "admin", "hr"),
    upload.single("photo"),
    attendanceController.checkIn
);

// ==============================
// CHECK-OUT
// ==============================
router.post(
    "/checkout",
    verifyToken,
    allowRoles("employee", "admin", "hr"),
    attendanceController.checkOut
);

// ==============================
// HISTORY
// ==============================
router.get(
    "/history",
    verifyToken,
    allowRoles("employee", "admin", "hr"),
    attendanceController.getMyAttendance
);

module.exports = router;