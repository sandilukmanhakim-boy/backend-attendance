const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        const header = req.headers.authorization;

        // ==============================
        // VALIDASI HEADER
        // ==============================
        if (!header || !header.startsWith("Bearer ")) {
            console.log("❌ TOKEN TIDAK ADA / FORMAT SALAH");
            return res.status(401).json({
                success: false,
                message: "Token tidak ada",
            });
        }

        // ==============================
        // AMBIL TOKEN
        // ==============================
        const token = header.split(" ")[1];

        // ==============================
        // VERIFY TOKEN
        // ==============================
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            clockTolerance: 60, // toleransi 60 detik
        });

        // ==============================
        // VALIDASI PAYLOAD
        // ==============================
        if (!decoded || !decoded.id) {
            console.log("❌ TOKEN TIDAK PUNYA DATA USER");
            return res.status(401).json({
                success: false,
                message: "Token tidak valid",
            });
        }

        // ==============================
        // SET USER KE REQUEST
        // ==============================
        req.user = {
            id: decoded.id,
            role: decoded.role, // 🔥 penting untuk allowRoles
        };

        // ==============================
        // 🔍 DEBUG LOG
        // ==============================
        console.log("========== DEBUG TOKEN ==========");
        console.log("TOKEN:", token);
        console.log("DECODED:", decoded);
        console.log("USER ID:", req.user.id);
        console.log("USER ROLE:", req.user.role);
        console.log("=================================");

        next();

    } catch (err) {
        console.error("❌ VERIFY TOKEN ERROR:", err.message);

        // HANDLE EXPIRED TOKEN
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired, silakan login ulang",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Token tidak valid / expired",
        });
    }
};

module.exports = { verifyToken };