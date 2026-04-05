const { Pool } = require("pg");

let pool;

const isRailway = !!process.env.DATABASE_URL;

if (isRailway) {
    console.log("🌐 Using Railway PostgreSQL");

    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });
} else {
    console.log("💻 Using Local PostgreSQL (Docker)");

    // ❗ VALIDASI ENV (biar nggak undefined diam-diam)
    const requiredEnv = [
        "DB_USER",
        "DB_HOST",
        "DB_NAME",
        "DB_PASSWORD",
        "DB_PORT",
    ];

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
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });
}

// 🔥 koneksi event
pool.on("connect", () => {
    console.log("✅ DB Connected");
});

pool.on("error", (err) => {
    console.error("🔥 DB Error:", err.message);
    process.exit(1); // force crash biar keliatan di docker log
});

// 🔥 helper query
const query = async (text, params) => {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (err) {
        console.error("❌ Query Error:", err.message);
        throw err;
    }
};

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("🚀 Database ready");
        client.release();
    } catch (err) {
        console.error("❌ Failed to connect DB:", err.message);
        process.exit(1);
    }
};

module.exports = {
    query,
    pool,
    connectDB,
};