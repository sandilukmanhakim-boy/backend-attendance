const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { generateToken } = require("../utils/jwt");

// ===============================
// 🔐 LOGIN
// ===============================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const role = req.body.role?.toLowerCase();
        // VALIDASI
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email dan password wajib diisi",
            });
        }

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

        return res.json({
            success: true,
            message: "Login berhasil",
            data: {
                token,
                user: {
                    id: user.rows[0].id,
                    email: user.rows[0].email,
                    role: user.rows[0].role,
                },
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
};

// ===============================
// 📝 REGISTER
// ===============================
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // VALIDASI
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Semua field wajib diisi",
            });
        }

        // CEK EMAIL
        const existing = await db.query(
            "SELECT * FROM employees WHERE email=$1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email sudah terdaftar",
            });
        }

        // HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        // INSERT USER
        const result = await db.query(
            `INSERT INTO employees (name, email, password, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role`,
            [name, email, hashedPassword, "employee"]
        );

        return res.status(201).json({
            success: true,
            message: "Register berhasil",
            data: result.rows[0],
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message,
        });
    }
};