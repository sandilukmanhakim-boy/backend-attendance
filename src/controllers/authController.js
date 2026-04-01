const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const success = (res, message, data = null) =>
    res.status(200).json({ success: true, message, data });

const error = (res, message, code = 400) =>
    res.status(code).json({ success: false, message });

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return error(res, "Email dan password wajib diisi");
        }

        const user = await pool.query(
            "SELECT * FROM employees WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return error(res, "User tidak ditemukan", 404);
        }

        const valid = await bcrypt.compare(password, user.rows[0].password);

        if (!valid) {
            return error(res, "Password salah");
        }

        const token = jwt.sign(
            {
                id: user.rows[0].id,
                email: user.rows[0].email,
                role: user.rows[0].role,
            },
            process.env.JWT_SECRET || "secret123",
            { expiresIn: "30d" }
        );

        return success(res, "Login berhasil", {
            token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email,
                role: user.rows[0].role,
            },
        });

    } catch (err) {
        console.error("🔥 LOGIN ERROR:", err);
        return error(res, "Internal Server Error", 500);
    }
};