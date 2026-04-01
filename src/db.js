const { Pool } = require("pg");

/* =======================
   VALIDASI ENV
======================= */
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL belum diset!");
}

/* =======================
   CREATE POOL (RAILWAY READY)
======================= */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // 🔥 WAJIB UNTUK RAILWAY
    ssl: {
        rejectUnauthorized: false,
    },

    // 🔥 OPTIMASI
    max: 10, // max koneksi
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

/* =======================
   RETRY CONNECTION (SMART)
======================= */
let retryCount = 0;

const connectDB = async () => {
    try {
        const client = await pool.connect();
        await client.query("SELECT NOW()");
        client.release();

        console.log("✅ PostgreSQL Connected 🚀");
        retryCount = 0;

    } catch (err) {
        retryCount++;

        console.error(
            `❌ DB Connection Failed (retry ${retryCount}):`,
            err.message
        );

        // ⏳ Retry tiap 5 detik
        setTimeout(connectDB, 5000);
    }
};

/* =======================
   AUTO CONNECT
======================= */
connectDB();

/* =======================
   GLOBAL ERROR HANDLER
======================= */
pool.on("error", (err) => {
    console.error("🔥 PostgreSQL Pool Error:", err.message);
});

/* =======================
   SAFE QUERY WRAPPER
======================= */
const query = async (text, params) => {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (err) {
        console.error("🔥 Query Error:", err.message);
        throw err;
    }
};

/* =======================
   HEALTH CHECK (OPSIONAL 🔥)
======================= */
const healthCheck = async () => {
    try {
        await pool.query("SELECT 1");
        return true;
    } catch {
        return false;
    }
};

/* =======================
   EXPORT
======================= */
module.exports = {
    pool,
    query,
    healthCheck,
};