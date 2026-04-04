module.exports = (allowedRoles = []) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const userRole = req.user.role;

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Akses ditolak",
                });
            }

            next();
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: "Role middleware error",
            });
        }
    };
};