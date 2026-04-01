const pool = require("../db");

exports.getOffices = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM offices");

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (err) {
        console.error("🔥 OFFICE ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};