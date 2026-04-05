const { pool } = require("../config/db");

/* =========================
   CREATE EMPLOYEE
========================= */
exports.createEmployee = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const result = await pool.query(
            `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
            [name, email, password, role || "employee"]
        );

        res.json({
            success: true,
            message: "Employee berhasil dibuat",
            data: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};


/* =========================
   GET ALL EMPLOYEES
========================= */
exports.getEmployees = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role FROM users ORDER BY id DESC`
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (err) {
        next(err);
    }
};


/* =========================
   UPDATE EMPLOYEE
========================= */
exports.updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, role } = req.body;

        const result = await pool.query(
            `UPDATE users
       SET name=$1, email=$2, role=$3
       WHERE id=$4
       RETURNING id, name, email, role`,
            [name, email, role, id]
        );

        res.json({
            success: true,
            message: "Employee berhasil diupdate",
            data: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};


/* =========================
   DELETE EMPLOYEE
========================= */
exports.deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        await pool.query(`DELETE FROM users WHERE id=$1`, [id]);

        res.json({
            success: true,
            message: "Employee berhasil dihapus",
        });
    } catch (err) {
        next(err);
    }
};


/* =========================
   SET OFFICE LOCATION
========================= */
exports.setOffice = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.body;

        // hapus dulu (biar cuma 1 office)
        await pool.query("DELETE FROM offices");

        const result = await pool.query(
            `INSERT INTO offices (latitude, longitude)
       VALUES ($1, $2)
       RETURNING *`,
            [latitude, longitude]
        );

        res.json({
            success: true,
            message: "Lokasi kantor berhasil diset",
            data: result.rows[0],
        });
    } catch (err) {
        next(err);
    }
};


/* =========================
   GET OFFICE
========================= */
exports.getOffice = async (req, res, next) => {
    try {
        const result = await pool.query("SELECT * FROM offices LIMIT 1");

        res.json({
            success: true,
            data: result.rows[0] || null,
        });
    } catch (err) {
        next(err);
    }
};


/* =========================
   GET ALL ATTENDANCE
========================= */
exports.getAttendance = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT * FROM attendances ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: result.rows,
        });
    } catch (err) {
        next(err);
    }
};