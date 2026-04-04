const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    try {
        const header = req.headers.authorization;

        if (!header) {
            return res.status(401).json({
                success: false,
                message: "Token tidak ada",
            });
        }

        const token = header.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Token tidak valid",
        });
    }
};