const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} tidak ditemukan`,
    });
};

module.exports = notFound;