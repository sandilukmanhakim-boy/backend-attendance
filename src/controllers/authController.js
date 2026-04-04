const bcrypt = require("bcryptjs");
const db = require("../config/db");
const { generateToken } = require("../utils/jwt");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.query(
            "SELECT * FROM employees WHERE email=$1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User tidak ditemukan",
            });
        }

        const valid = await bcrypt.compare(password, user.rows[0].password);

        if (!valid) {
            return res.status(400).json({
                success: false,
                message: "Password salah",
            });
        }

        const token = generateToken({
            id: user.rows[0].id,
            role: user.rows[0].role,
        });

        res.json({
            success: true,
            data: {
                token,
                user: user.rows[0],
            },
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};