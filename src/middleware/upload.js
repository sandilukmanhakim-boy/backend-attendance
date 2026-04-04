const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadPath = "uploads/";

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("File harus gambar"), false);
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 },
});