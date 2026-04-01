const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        console.log("AUTH HEADER:", req.headers.authorization);

        const authHeader = req.headers.authorization;

        // 🔐 CEK HEADER
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Token tidak ada",
            });
        }

        // 🔐 FORMAT: Bearer TOKEN
        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                success: false,
                message: "Format token salah (Bearer token)",
            });
        }

        const token = parts[1];

        // 🔐 WAJIB ADA SECRET
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET belum diset di .env");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED USER:", decoded);
        // ✅ SIMPAN USER
        req.user = decoded;

        next();

    } catch (err) {
        console.error("🔥 AUTH ERROR:", err.message);

        return res.status(401).json({
            success: false,
            message: "Token tidak valid / expired",
        });
    }
};