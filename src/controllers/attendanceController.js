const db = require("../config/db");

// ==========================
// 📏 HITUNG JARAK (HAVERSINE)
// ==========================
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // meter
    const toRad = (x) => (x * Math.PI) / 180;

    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ==========================
// 🧠 VALIDASI ANGKA
// ==========================
function isValidNumber(val) {
    return !isNaN(val) && isFinite(val);
}

// ==========================
// ✅ CHECK-IN
// ==========================
exports.checkIn = async (req, res) => {
    try {
        const employee_id = req.user?.id;

        // 🔐 VALIDASI USER
        if (!employee_id) {
            return res.status(401).json({
                success: false,
                message: "User tidak valid",
            });
        }

        let { latitude, longitude } = req.body;

        // 🔄 CONVERT STRING → NUMBER
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

        // 🔐 VALIDASI INPUT
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Foto wajib upload",
            });
        }

        if (!isValidNumber(latitude) || !isValidNumber(longitude)) {
            return res.status(400).json({
                success: false,
                message: "Latitude & longitude tidak valid",
            });
        }

        // 🏢 AMBIL DATA OFFICE
        const officeRes = await db.query(`SELECT * FROM office LIMIT 1`);

        if (officeRes.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Data kantor belum ada",
            });
        }

        const office = officeRes.rows[0];

        // 📏 HITUNG JARAK
        const distance = getDistance(
            latitude,
            longitude,
            office.latitude,
            office.longitude
        );

        // 📍 VALIDASI RADIUS
        if (distance > office.radius) {
            return res.status(400).json({
                success: false,
                message: `Diluar jangkauan (${Math.round(distance)} meter)`,
            });
        }

        // 🔍 CEK SUDAH CHECK-IN
        const existing = await db.query(
            `SELECT id FROM attendance
       WHERE employee_id = $1
       AND DATE(checkin_time) = CURRENT_DATE
       AND checkout_time IS NULL`,
            [employee_id]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Sudah check-in hari ini",
            });
        }

        // 💾 INSERT DATA
        await db.query(
            `INSERT INTO attendance
      (employee_id, latitude, longitude, photo, checkin_time)
      VALUES ($1, $2, $3, $4, NOW())`,
            [
                employee_id,
                latitude,
                longitude,
                req.file.path,
            ]
        );

        return res.json({
            success: true,
            message: "Check-in berhasil",
        });

    } catch (err) {
        console.error("🔥 CHECKIN ERROR:", err.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ==========================
// 🔥 CHECK-OUT
// ==========================
exports.checkOut = async (req, res) => {
    try {
        const employee_id = req.user?.id;

        // 🔐 VALIDASI USER
        if (!employee_id) {
            return res.status(401).json({
                success: false,
                message: "User tidak valid",
            });
        }

        // 🔍 CEK DATA HARI INI
        const result = await db.query(
            `SELECT id FROM attendance
       WHERE employee_id = $1
       AND DATE(checkin_time) = CURRENT_DATE
       AND checkout_time IS NULL
       LIMIT 1`,
            [employee_id]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Belum check-in / sudah checkout",
            });
        }

        const attendanceId = result.rows[0].id;

        // 💾 UPDATE CHECKOUT
        await db.query(
            `UPDATE attendance
       SET checkout_time = NOW()
       WHERE id = $1`,
            [attendanceId]
        );

        return res.json({
            success: true,
            message: "Check-out berhasil",
        });

    } catch (err) {
        console.error("🔥 CHECKOUT ERROR:", err.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};