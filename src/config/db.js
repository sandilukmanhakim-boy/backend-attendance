const { Pool } = require("pg");

let pool;

const isRailway = !!process.env.DATABASE_URL;

if (isRailway) {
    console.log("🌐 Using Railway PostgreSQL");

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });

} else {
    console.log("💻 Using Local PostgreSQL (Docker)");

    const requiredEnv = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "DB_PORT"];

    requiredEnv.forEach((key) => {
        if (!process.env[key]) {
            console.error(`❌ ENV ${key} belum diset`);
            process.exit(1);
        }
    });

    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT),
        ssl: false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });
}

pool.on("error", (err) => {
    console.error("🔥 DB Error:", err.message);
    process.exit(1);
});

const query = (text, params) => pool.query(text, params);

const connectDB = async () => {
    try {
        const client = await pool.connect();
        client.release();
        console.log("🚀 Database connected");
    } catch (err) {
        console.error("❌ Failed to connect DB:", err.message);
        process.exit(1);
    }
};

module.exports = { query, pool, connectDB };