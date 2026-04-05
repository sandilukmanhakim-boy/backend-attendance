const allowRoles = (...roles) => {
    return (req, res, next) => {
        try {
            // ==============================
            // 🔍 DEBUG LOG
            // ==============================
            console.log("========== DEBUG ROLE ==========");
            console.log("REQ.USER:", req.user);
            console.log("REQ.USER.ID:", req.user?.id);
            console.log("REQ.USER.ROLE:", req.user?.role);
            console.log("ALLOWED ROLES:", roles);
            console.log("================================");

            // ==============================
            // VALIDASI USER
            // ==============================
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User tidak ditemukan (token tidak valid)",
                });
            }

            // ==============================
            // VALIDASI ROLE
            // ==============================
            if (!req.user.role) {
                return res.status(403).json({
                    success: false,
                    message: "Role user tidak ditemukan",
                });
            }

            // ==============================
            // CEK ROLE SESUAI ATAU TIDAK
            // ==============================
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Akses ditolak",
                });
            }

            // ==============================
            // LOLOS
            // ==============================
            next();

        } catch (err) {
            console.error("Role middleware error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error (role middleware)",
            });
        }
    };
};

module.exports = allowRoles;