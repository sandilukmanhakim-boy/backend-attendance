const { pool } = require("../config/db");
const bcrypt = require("bcryptjs");

// ==============================
// 🔥 CREATE EMPLOYEE
// ==============================
const createEmployees = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ✅ FIX ROLE (NO ERROR LAGI)
        const userRole = req.body.role?.toLowerCase() || "employee";

        // VALIDASI
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Semua field wajib diisi",
            });
        }

        // VALIDASI ROLE
        const allowedRoles = ["admin", "hr", "employee"];
        if (!allowedRoles.includes(userRole)) {
            return res.status(400).json({
                success: false,
                message: "Role tidak valid",
            });
        }

        // HASH PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        // INSERT
        const result = await pool.query(
            `INSERT INTO employees (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
            [name, email, hashedPassword, userRole]
        );

        return res.json({
            success: true,
            message: "Employee berhasil dibuat",
            data: result.rows[0],
        });

    } catch (err) {
        console.error("CREATE EMPLOYEE ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// 📋 GET ALL EMPLOYEE
// ==============================
const getEmployees = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role, created_at
       FROM employees
       ORDER BY id DESC`
        );

        return res.json({
            success: true,
            data: result.rows,
        });

    } catch (err) {
        console.error("GET EMPLOYEES ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// ✏️ UPDATE EMPLOYEE
// ==============================
const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;

        const userRole = req.body.role?.toLowerCase();

        // VALIDASI ROLE
        if (userRole) {
            const allowedRoles = ["admin", "hr", "employee"];
            if (!allowedRoles.includes(userRole)) {
                return res.status(400).json({
                    success: false,
                    message: "Role tidak valid",
                });
            }
        }

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const result = await pool.query(
            `UPDATE employees
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           password = COALESCE($3, password),
           role = COALESCE($4, role)
       WHERE id = $5
       RETURNING id, name, email, role`,
            [name, email, hashedPassword, userRole, id]
        );

        return res.json({
            success: true,
            message: "Employee berhasil diupdate",
            data: result.rows[0],
        });

    } catch (err) {
        console.error("UPDATE EMPLOYEE ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// ❌ DELETE EMPLOYEE
// ==============================
const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(`DELETE FROM employees WHERE id = $1`, [id]);

        return res.json({
            success: true,
            message: "Employee berhasil dihapus",
        });

    } catch (err) {
        console.error("DELETE EMPLOYEE ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// 🏢 OFFICE
// ==============================
const setOffice = async (req, res) => {
    try {
        const { latitude, longitude, radius } = req.body;

        await pool.query(`DELETE FROM offices`);

        const result = await pool.query(
            `INSERT INTO offices (latitude, longitude, radius)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [latitude, longitude, radius]
        );

        return res.json({
            success: true,
            message: "Office berhasil diset",
            data: result.rows[0],
        });

    } catch (err) {
        console.error("SET OFFICE ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const getOffice = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM offices LIMIT 1`);

        return res.json({
            success: true,
            data: result.rows[0] || null,
        });

    } catch (err) {
        console.error("GET OFFICE ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// 📊 GET ATTENDANCE (ADMIN/HR)
// ==============================
const getAttendance = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, e.name, e.email
       FROM attendances a
       JOIN employees e ON a.employee_id = e.id
       ORDER BY a.created_at DESC`
        );

        return res.json({
            success: true,
            data: result.rows,
        });

    } catch (err) {
        console.error("GET ATTENDANCE ERROR:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = {
    createEmployees,
    getEmployees,
    updateEmployees,
    deleteEmployees,
    setOffices,
    getOffices,
    getAttendance,
};