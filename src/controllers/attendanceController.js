const pool = require("../db");

/* =========================
   RESPONSE HELPER
========================= */
const success = (res, message, data = null) =>
    res.status(200).json({ success: true, message, data });

const error = (res, message, code = 400) =>
    res.status(code).json({ success: false, message });

/* =========================
   SHIFT CONFIG
   < 05:00 = HARI SEBELUMNYA
========================= */
const SHIFT_CUTOFF_HOUR = 5;

/* =========================
   ADJUST TANGGAL (SHIFT LOGIC)
========================= */
const adjustDateByShift = (date) => {
    const d = new Date(date);

    if (isNaN(d)) return null;

    if (d.getHours() < SHIFT_CUTOFF_HOUR) {
        d.setDate(d.getDate() - 1);
    }

    return d;
};

/* =========================
   FORMAT JAM (HH:mm)
========================= */
const formatTime = (date) => {
    if (!date) return null;

    const d = new Date(date);
    if (isNaN(d)) return null;

    return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/* =========================
   FORMAT DURASI (HH:mm)
   SUPPORT LINTAS HARI
========================= */
const formatDuration = (start, end) => {
    if (!start || !end) return null;

    const s = new Date(start);
    const e = new Date(end);

    if (isNaN(s) || isNaN(e)) return null;

    let diffMs = e - s;

    // 🔥 HANDLE SHIFT MALAM
    if (diffMs < 0) {
        diffMs += 24 * 60 * 60 * 1000;
    }

    const totalMinutes = Math.floor(diffMs / (1000 * 60));

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
};

/* =========================
   NAMA HARI (SUDAH SHIFT)
========================= */
const getDayName = (date) => {
    if (!date) return null;

    const d = adjustDateByShift(date);
    if (!d) return null;

    const days = [
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
    ];

    return days[d.getDay()];
};

/* =========================
   CEK HARI INI (SUDAH SHIFT)
========================= */
const isToday = (date) => {
    if (!date) return false;

    const d = adjustDateByShift(date);
    const today = adjustDateByShift(new Date());

    return d.toDateString() === today.toDateString();
};

/* =========================
   VALIDASI ANGKA
========================= */
const isValidNumber = (val) => !isNaN(parseFloat(val));

/* =========================
   HAVERSINE (JARAK GPS)
========================= */
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;

    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;

    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/* =========================
   CARI KANTOR TERDEKAT
========================= */
const findNearestOffice = async (lat, lng) => {
    const result = await pool.query("SELECT * FROM offices");

    let nearest = null;
    let minDistance = Infinity;

    for (let office of result.rows) {
        const dist = getDistance(
            lat,
            lng,
            parseFloat(office.latitude),
            parseFloat(office.longitude)
        );

        if (dist < minDistance) {
            minDistance = dist;
            nearest = office;
        }
    }

    return { office: nearest, distance: minDistance };
};

/* =========================
   CONFIG
========================= */
const MAX_RADIUS = 300;
const GPS_TOLERANCE = 50;

/* =========================
   GET ATTENDANCE
========================= */
exports.getAttendance = async (req, res) => {
    try {
        const user_id = req.user?.id;

        if (!user_id) {
            return error(res, "Unauthorized", 401);
        }

        const result = await pool.query(
            `SELECT * FROM attendance
             WHERE employee_id = $1
             ORDER BY checkin_time DESC`,
            [user_id]
        );

        const data = result.rows.map((item) => ({
            id: item.id,
            employee_id: item.employee_id,

            day: getDayName(item.checkin_time),
            is_today: isToday(item.checkin_time),

            check_in: formatTime(item.checkin_time),
            check_out: formatTime(item.checkout_time),

            work_duration: formatDuration(
                item.checkin_time,
                item.checkout_time
            ),

            latitude: item.latitude,
            longitude: item.longitude,

            photo_url: item.photo
                ? `${process.env.BASE_URL || "http://localhost:3000"}/${item.photo}`
                : null,

            created_at: item.created_at,
        }));

        return success(res, "Data attendance", data);
    } catch (err) {
        console.error("🔥 GET ATTENDANCE ERROR:", err);
        return error(res, "Internal Server Error", 500);
    }
};

/* =========================
   CHECK-IN
========================= */
exports.checkIn = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const { latitude, longitude } = req.body;

        if (!user_id) return error(res, "Unauthorized", 401);

        if (!latitude || !longitude)
            return error(res, "Latitude & Longitude wajib");

        if (!isValidNumber(latitude) || !isValidNumber(longitude))
            return error(res, "Format GPS tidak valid");

        if (!req.file)
            return error(res, "Foto wajib diupload");

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        const { office, distance } = await findNearestOffice(lat, lng);

        if (!office)
            return error(res, "Kantor tidak ditemukan");

        if (distance > MAX_RADIUS + GPS_TOLERANCE) {
            return error(
                res,
                `Diluar jangkauan (${Math.round(distance)} meter)`
            );
        }

        const already = await pool.query(
            `SELECT id FROM attendance
             WHERE employee_id = $1
             AND DATE(checkin_time) = CURRENT_DATE
             AND checkout_time IS NULL`,
            [user_id]
        );

        if (already.rows.length > 0)
            return error(res, "Sudah check-in hari ini");

        const photo = req.file.path.replace(/\\/g, "/");

        const result = await pool.query(
            `INSERT INTO attendance
             (employee_id, latitude, longitude, photo, checkin_time)
             VALUES ($1, $2, $3, $4, NOW())
             RETURNING *`,
            [user_id, lat, lng, photo]
        );

        return success(res, "Check-in berhasil", result.rows[0]);
    } catch (err) {
        console.error("🔥 CHECK-IN ERROR:", err);
        return error(res, "Internal Server Error", 500);
    }
};

/* =========================
   CHECK-OUT
========================= */
exports.checkOut = async (req, res) => {
    try {
        const user_id = req.user?.id;

        if (!user_id) return error(res, "Unauthorized", 401);

        if (!req.file)
            return error(res, "Foto wajib diupload");

        const find = await pool.query(
            `SELECT id FROM attendance
             WHERE employee_id = $1
             AND checkout_time IS NULL
             ORDER BY checkin_time DESC
             LIMIT 1`,
            [user_id]
        );

        if (find.rows.length === 0)
            return error(res, "Belum check-in");

        await pool.query(
            `UPDATE attendance
             SET checkout_time = NOW()
             WHERE id = $1`,
            [find.rows[0].id]
        );

        return success(res, "Check-out berhasil");
    } catch (err) {
        console.error("🔥 CHECK-OUT ERROR:", err);
        return error(res, "Internal Server Error", 500);
    }
};