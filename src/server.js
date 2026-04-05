require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 3000;

/* =======================
   START SERVER
======================= */
const startServer = async () => {
    try {
        await connectDB(); // ⬅️ tunggu database siap
        console.log("PostgreSQL Connected 🚀");

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to connect DB:", error);
        process.exit(1);
    }
};

startServer();