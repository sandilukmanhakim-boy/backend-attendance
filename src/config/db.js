const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "hrsandi",
  host: process.env.DB_HOST || "postgres",
  database: process.env.DB_NAME || "hrdb",
  password: process.env.DB_PASS || "hrshahreen",
  port: process.env.DB_PORT || 5432,
});

/* =========================
   CONNECT LOG
========================= */
pool.on("connect", () => {
  console.log("✅ PostgreSQL Connected");
});

pool.on("error", (err) => {
  console.error("❌ PostgreSQL Error:", err.message);
});

/* =========================
   WAIT FOR DB (ANTI 500)
========================= */
const waitForDB = async () => {
  let connected = false;

  while (!connected) {
    try {
      await pool.query("SELECT 1");
      connected = true;
      console.log("🔥 Database READY");
    } catch (err) {
      console.log("⏳ Waiting for database...");
      await new Promise(res => setTimeout(res, 2000));
    }
  }
};

/* =========================
   INIT TABLE (AUTO CREATE)
========================= */
const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS attendance (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                latitude DOUBLE PRECISION,
                longitude DOUBLE PRECISION,
                photo TEXT,
                check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                check_out TIMESTAMP
            );
        `);

    console.log("✅ Table attendance ready");
  } catch (err) {
    console.error("❌ INIT DB ERROR:", err);
  }
};

/* =========================
   INIT
========================= */
(async () => {
  await waitForDB();
  await initDB();
})();

module.exports = pool;