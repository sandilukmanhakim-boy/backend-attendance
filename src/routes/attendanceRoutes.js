const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");

/* =========================
   ATTENDANCE ROUTES
========================= */

router.get(
    "/",
    auth,
    attendanceController.getAttendance
);

router.post(
    "/check-in",
    auth,
    upload.single("photo"),
    attendanceController.checkIn
);

router.post(
    "/check-out",
    auth,
    upload.single("photo"),
    attendanceController.checkOut
);

module.exports = router;