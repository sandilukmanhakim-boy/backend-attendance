const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    logger.error(err.message);

    // Multer error
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File terlalu besar (max 2MB)",
        });
    }

    return res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

module.exports = errorHandler;