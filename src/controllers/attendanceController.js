const { pool } = require("../config/db");

// ==============================
// FUNCTION HITUNG JARAK (Haversine)
// ==============================
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; // meter
    const toRad = (value) => (value * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

// ==============================
// CHECK-IN
// ==============================
const checkIn = async (req, res) => {
    try {
        const userId = req.user?.id;
        const latitude = parseFloat(req.body?.latitude);
        const longitude = parseFloat(req.body?.longitude);

        // VALIDASI USER
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User tidak valid",
            });
        }

        // VALIDASI KOORDINAT
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                success: false,
                message: "Latitude & Longitude tidak valid",
            });
        }

        // VALIDASI FOTO
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Foto wajib diupload",
            });
        }

        // AMBIL DATA OFFICE
        const officeResult = await pool.query(
            `SELECT * FROM office LIMIT 1`
        );

        if (officeResult.rows.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Data office tidak ditemukan",
            });
        }

        const office = officeResult.rows[0];

        const officeLat = parseFloat(office.latitude);
        const officeLon = parseFloat(office.longitude);

        // HITUNG JARAK
        const distance = getDistance(
            latitude,
            longitude,
            officeLat,
            officeLon
        );

        // ==============================
        // 🔍 DEBUG LOG
        // ==============================
        console.log("========== DEBUG CHECK-IN ==========");
        console.log("USER ID:", userId);
        console.log("USER LAT:", latitude);
        console.log("USER LON:", longitude);
        console.log("OFFICE LAT:", officeLat);
        console.log("OFFICE LON:", officeLon);
        console.log("DISTANCE:", distance);
        console.log("RADIUS:", office.radius);
        console.log("====================================");

        // VALIDASI RADIUS
        if (distance > office.radius) {
            return res.status(403).json({
                success: false,
                message: "Diluar area kantor",
            });
        }

        // CEK SUDAH CHECK-IN
        const today = await pool.query(
            `SELECT id FROM attendance
             WHERE user_id = $1 
             AND DATE(created_at) = CURRENT_DATE
             LIMIT 1`,
            [userId]
        );

        if (today.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Kamu sudah check-in hari ini",
            });
        }

        // INSERT DATA
        const result = await pool.query(
            `INSERT INTO attendance
            (user_id, latitude, longitude, photo, checkin_time)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING *`,
            [userId, latitude, longitude, req.file.filename]
        );

        return res.json({
            success: true,
            message: "Check-in berhasil",
            data: result.rows[0],
        });

    } catch (err) {
        console.error("Check-in error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// CHECK-OUT
// ==============================
const checkOut = async (req, res) => {
    try {
        const userId = req.user?.id;

        const today = await pool.query(
            `SELECT * FROM attendance 
             WHERE user_id = $1 
             AND DATE(created_at) = CURRENT_DATE
             LIMIT 1`,
            [userId]
        );

        if (today.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Belum check-in",
            });
        }

        const attendance = today.rows[0];

        if (attendance.check_out_time) {
            return res.status(400).json({
                success: false,
                message: "Sudah check-out",
            });
        }

        const result = await pool.query(
            `UPDATE attendance 
             SET check_out_time = NOW()
             WHERE id = $1
             RETURNING *`,
            [attendance.id]
        );

        return res.json({
            success: true,
            message: "Check-out berhasil",
            data: result.rows[0],
        });

    } catch (err) {
        console.error("Check-out error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// ==============================
// GET MY ATTENDANCE
// ==============================
const getMyAttendance = async (req, res) => {
    try {
        const userId = req.user?.id;

        const result = await pool.query(
            `SELECT * FROM attendance
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        return res.json({
            success: true,
            data: result.rows,
        });

    } catch (err) {
        console.error("Get attendance error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

module.exports = {
    checkIn,
    checkOut,
    getMyAttendance,
};