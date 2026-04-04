require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = process.env.PORT || 3000;

/* =======================
   START SERVER
======================= */
app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);

    // connect database setelah server jalan
    await connectDB();
});