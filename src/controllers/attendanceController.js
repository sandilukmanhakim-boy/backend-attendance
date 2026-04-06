const { pool } = require("../config/db");

// ==============================
// FUNCTION HITUNG JARAK (Haversine)
// ==============================
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// ==============================
// CHECK-IN
// ==============================
const checkIn = async (req, res) => {
    try {
        const employee_id = req.user?.id;
        const latitude = parseFloat(req.body?.latitude);
        const longitude = parseFloat(req.body?.longitude);

        if (!employee_id) {
            return res.status(401).json({ success: false, message: "User tidak valid" });
        }

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({ success: false, message: "Koordinat tidak valid" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Foto wajib diupload" });
        }

        // 🔥 ambil office
        const officeResult = await pool.query(`SELECT * FROM offices LIMIT 1`);
        if (officeResult.rows.length === 0) {
            return res.status(500).json({ success: false, message: "Office belum diset" });
        }

        const office = officeResult.rows[0];

        const distance = getDistance(
            latitude,
            longitude,
            parseFloat(office.latitude),
            parseFloat(office.longitude)
        );

        const status = distance <= 500 ? "inside" : "outside";

        // ❌ kalau di luar radius
        if (status === "outside") {
            return res.status(403).json({
                success: false,
                message: "Diluar radius kantor",
                distance
            });
        }

        // 🔥 cek sudah check-in hari ini
        const today = await pool.query(
            `SELECT id FROM attendances
             WHERE employee_id = $1
             AND DATE(created_at) = CURRENT_DATE`,
            [employee_id]
        );

        if (today.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Sudah check-in hari ini"
            });
        }

        // 🔥 insert
        const result = await pool.query(
            `INSERT INTO attendances
            (employee_id, latitude, longitude, distance, status, photo, check_in_time)
            VALUES ($1,$2,$3,$4,$5,$6,NOW())
            RETURNING *`,
            [employee_id, latitude, longitude, distance, status, req.file.filename]
        );

        res.json({
            success: true,
            message: "Check-in berhasil",
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ==============================
// CHECK-OUT
// ==============================
const checkOut = async (req, res) => {
    try {
        const employee_id = req.user?.id;

        const today = await pool.query(
            `SELECT * FROM attendances
             WHERE employee_id = $1
             AND DATE(created_at) = CURRENT_DATE`,
            [employee_id]
        );

        if (today.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Belum check-in"
            });
        }

        const attendance = today.rows[0];

        if (attendance.check_out_time) {
            return res.status(400).json({
                success: false,
                message: "Sudah check-out"
            });
        }

        const result = await pool.query(
            `UPDATE attendances
             SET check_out_time = NOW()
             WHERE id = $1
             RETURNING *`,
            [attendance.id]
        );

        res.json({
            success: true,
            message: "Check-out berhasil",
            data: result.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ==============================
// GET MY ATTENDANCE
// ==============================
const getMyAttendance = async (req, res) => {
    try {
        const employee_id = req.user?.id;

        const result = await pool.query(
            `SELECT * FROM attendances
             WHERE employee_id = $1
             ORDER BY created_at DESC`,
            [employee_id]
        );

        res.json({
            success: true,
            data: result.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getMyAttendance,
};