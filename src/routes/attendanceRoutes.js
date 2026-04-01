const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// 🔐 AUTH MIDDLEWARE
const authMiddleware = require("../middleware/authMiddleware");

// 🎮 CONTROLLER
const attendanceController = require("../controllers/attendanceController");


// 📁 PASTIKAN FOLDER UPLOAD ADA
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 📦 STORAGE CONFIG
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || ".png";
        cb(null, Date.now() + ext);
    },
});

// 🛡️ FILTER FILE (OPTIONAL BIAR LEBIH AMAN)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("File harus berupa gambar"), false);
    }
};

// 🚀 MULTER INIT
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // max 2MB
    },
});


// ==========================
// 🚀 ROUTES
// ==========================

// ✅ CHECK-IN (PROTECTED)
router.post(
    "/checkin",
    authMiddleware,              // 🔥 WAJIB ADA
    upload.single("photo"),     // 🔥 upload file
    attendanceController.checkIn
);


// (Optional nanti kamu bisa tambah)
// router.post("/checkout", authMiddleware, upload.single("photo"), attendanceController.checkOut);

module.exports = router;