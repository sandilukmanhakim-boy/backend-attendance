const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL belum diset!");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on("connect", () => {
    console.log("✅ DB Connected");
});

pool.on("error", (err) => {
    console.error("🔥 DB Error:", err.message);
});

const query = (text, params) => pool.query(text, params);

module.exports = { query, pool };