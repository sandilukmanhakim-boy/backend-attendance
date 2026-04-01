const { Pool } = require("pg");

/* =======================
   CREATE POOL
======================= */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,

    // 🔥 OPTIMASI CONNECTION
    max: 10, // max koneksi
    idleTimeoutMillis: 30000, // idle timeout
    connectionTimeoutMillis: 10000, // timeout koneksi
});

/* =======================
   TEST CONNECTION
======================= */
const connectDB = async () => {
    try {
        const client = await pool.connect();
        await client.query("SELECT NOW()");
        client.release();

        console.log("✅ PostgreSQL Connected (Railway Ready)");
    } catch (err) {
        console.error("❌ DB Connection Error:", err.message);

        // ⚠️ JANGAN langsung exit (biar Railway retry)
        setTimeout(connectDB, 5000);
    }
};

/* =======================
   AUTO CONNECT
======================= */
connectDB();

/* =======================
   GLOBAL POOL ERROR
======================= */
pool.on("error", (err) => {
    console.error("🔥 PostgreSQL Pool Error:", err.message);
});

/* =======================
   SAFE QUERY WRAPPER (OPTIONAL 🔥)
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
   EXPORT
======================= */
module.exports = {
    pool,
    query, // pakai ini biar aman
};