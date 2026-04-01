const db = require("../config/db");

/* ==========================
   📏 HAVERSINE
========================== */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
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

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ==========================
   🧠 VALIDASI
========================== */
function isValidNumber(val) {
    return typeof val === "number" && !isNaN(val);
}

/* ==========================
   📍 CHECK-IN
========================== */
exports.checkIn = async (req, res) => {
    const client = await db.pool.connect();

    try {
        const employee_id = req.user?.id;

        if (!employee_id) {
            return res.status(401).json({
                success: false,
                message: "User tidak valid",
            });
        }

        let { latitude, longitude } = req.body;
        latitude = parseFloat(latitude);
        longitude = parseFloat(longitude);

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

        await client.query("BEGIN");

        // 🏢 OFFICE
        const officeRes = await client.query(`SELECT * FROM office LIMIT 1`);
        if (officeRes.rows.length === 0) {
            throw new Error("Data kantor belum ada");
        }

        const office = officeRes.rows[0];

        const distance = getDistance(
            latitude,
            longitude,
            parseFloat(office.latitude),
            parseFloat(office.longitude)
        );

        if (distance > parseFloat(office.radius)) {
            throw new Error(`Diluar jangkauan (${Math.round(distance)} meter)`);
        }

        // 🔥 FIX TIMEZONE BENAR
        const existing = await client.query(
            `SELECT id FROM attendance
       WHERE employee_id = $1
       AND DATE(checkin_time AT TIME ZONE 'Asia/Jakarta') =
           DATE(NOW() AT TIME ZONE 'Asia/Jakarta')
       AND checkout_time IS NULL
       FOR UPDATE`,
            [employee_id]
        );

        if (existing.rows.length > 0) {
            throw new Error("Sudah check-in hari ini");
        }

        await client.query(
            `INSERT INTO attendance
       (employee_id, latitude, longitude, photo, checkin_time)
       VALUES ($1, $2, $3, $4, NOW())`,
            [employee_id, latitude, longitude, req.file.filename]
        );

        await client.query("COMMIT");

        return res.json({
            success: true,
            message: "Check-in berhasil",
        });

    } catch (err) {
        await client.query("ROLLBACK");

        console.error("🔥 CHECKIN ERROR:", err.message);

        return res.status(400).json({
            success: false,
            message: err.message,
        });

    } finally {
        client.release();
    }
};

/* ==========================
   🔥 CHECK-OUT
========================== */
exports.checkOut = async (req, res) => {
    try {
        const employee_id = req.user?.id;

        if (!employee_id) {
            return res.status(401).json({
                success: false,
                message: "User tidak valid",
            });
        }

        const result = await db.query(
            `SELECT id FROM attendance
       WHERE employee_id = $1
       AND DATE(checkin_time AT TIME ZONE 'Asia/Jakarta') =
           DATE(NOW() AT TIME ZONE 'Asia/Jakarta')
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

        await db.query(
            `UPDATE attendance
       SET checkout_time = NOW()
       WHERE id = $1`,
            [result.rows[0].id]
        );

        return res.json({
            success: true,
            message: "Check-out berhasil",
        });

    } catch (err) {
        console.error("🔥 CHECKOUT ERROR:", err.message);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};