const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// 🔐 MIDDLEWARE AUTH
const authMiddleware = require("../middleware/authMiddleware");

// 🎮 CONTROLLER
const attendanceController = require("../controllers/attendanceController");


// ==========================
// 📁 SETUP UPLOAD FOLDER
// ==========================
const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// ==========================
// 📦 MULTER CONFIG
// ==========================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname) || ".png";
        cb(null, Date.now() + ext);
    },
});

// 🛡️ VALIDASI FILE (HANYA GAMBAR)
const fileFilter = (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("File harus berupa gambar"), false);
    }
    cb(null, true);
};

// 🚀 INIT MULTER
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // max 2MB
    },
});


// ==========================
// 🛡️ HANDLE ERROR MULTER
// ==========================
const uploadMiddleware = (req, res, next) => {
    const singleUpload = upload.single("photo");

    singleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: "File terlalu besar (max 2MB)",
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message,
            });
        }
        next();
    });
};


// ==========================
// 🚀 ROUTES
// ==========================

// ✅ TEST API (BROWSER)
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "API attendance aktif 🚀",
    });
});

// ✅ HEALTH CHECK (OPTIONAL)
router.get("/health", (req, res) => {
    res.json({
        status: "OK",
        service: "attendance",
    });
});


// ==========================
// 🔐 PROTECTED ROUTES
// ==========================

// ✅ CHECK-IN
router.post(
    "/checkin",
    authMiddleware,
    uploadMiddleware,
    attendanceController.checkIn
);

// 🔥 CHECK-OUT
router.post(
    "/checkout",
    authMiddleware,
    attendanceController.checkOut
);


// ==========================
// ❌ HANDLE ROUTE TIDAK ADA
// ==========================
router.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "Endpoint tidak ditemukan",
    });
});


// ==========================
// 📦 EXPORT
// ==========================
module.exports = router;