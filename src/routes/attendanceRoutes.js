const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

// 🔥 STORAGE CONFIG
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = "uploads/";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + ".png");
    },
});

const upload = multer({ storage });

// 🔥 CONTROLLER
const attendanceController = require("../controllers/attendanceController");

// 🔥 ROUTE CHECK-IN
router.post("/checkin", upload.single("photo"), attendanceController.checkIn);

module.exports = router;