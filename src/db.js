const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER || "hrsandi",
    host: process.env.DB_HOST || "hr_postgres",
    database: process.env.DB_NAME || "hrdb",
    password: process.env.DB_PASSWORD || "123456",
    port: process.env.DB_PORT || 5432,
});

// 🔥 FUNCTION CONNECT + RETRY
const connectDB = async () => {
    let retries = 5;

    while (retries) {
        try {
            await pool.query("SELECT 1");
            console.log("✅ PostgreSQL Connected");
            break;
        } catch (err) {
            console.log(`⏳ Tunggu DB... (${retries})`);
            retries--;
            await new Promise(res => setTimeout(res, 3000));
        }
    }

    if (!retries) {
        console.error("❌ DB Gagal connect setelah retry");
        process.exit(1); // 🔥 penting: stop container kalau DB gagal
    }
};

// 🔥 PANGGIL SAAT START
connectDB();

// OPTIONAL: DEBUG ERROR GLOBAL DB
pool.on("error", (err) => {
    console.error("🔥 PostgreSQL Pool Error:", err);
});

module.exports = pool;