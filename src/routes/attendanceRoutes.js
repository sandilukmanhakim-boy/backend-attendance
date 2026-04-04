const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const attendanceController = require("../controllers/attendanceController");

// CHECK-IN
router.post(
    "/checkin",
    verifyToken,
    allowRoles("employee", "hr", "admin"),
    attendanceController.checkIn
);

// HISTORY USER
router.get(
    "/history",
    verifyToken,
    allowRoles("employee", "hr", "admin"),
    attendanceController.getMyAttendance
);

module.exports = router;