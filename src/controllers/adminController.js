const db = require("../config/db");
const { getDistanceInMeters } = require("../utils/distance");

/* =========================
   CHECK-IN ATTENDANCE
========================= */
exports.checkIn = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { latitude, longitude } = req.body;

        // VALIDASI INPUT
        if (!latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: "Latitude & Longitude wajib diisi",
            });
        }

        // AMBIL DATA KANTOR
        const officeResult = await db.query(
            "SELECT * FROM offices LIMIT 1"
        );

        if (officeResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Lokasi kantor belum diset",
            });
        }

        const office = officeResult.rows[0];

        if (!office.latitude || !office.longitude) {
            return res.status(400).json({
                success: false,
                message: "Koordinat kantor tidak valid",
            });
        }

        // HITUNG JARAK
        const distance = getDistanceInMeters(
            latitude,
            longitude,
            office.latitude,
            office.longitude
        );

        const isInside = distance <= 500;
        const status = isInside ? "inside" : "outside";

        // SIMPAN ATTENDANCE
        const result = await db.query(
            `INSERT INTO attendances 
            (user_id, latitude, longitude, status, distance)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [userId, latitude, longitude, status, distance]
        );

        res.json({
            success: true,
            message: isInside
                ? "Berada dalam radius kantor"
                : "Di luar radius kantor",
            data: {
                attendance: result.rows[0],
                distance: Math.round(distance),
                status,
            },
        });

    } catch (err) {
        next(err);
    }
};


/* =========================
   GET HISTORY ATTENDANCE
========================= */
exports.getMyAttendance = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT * FROM attendances
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            data: result.rows,
        });

    } catch (err) {
        next(err);
    }
};