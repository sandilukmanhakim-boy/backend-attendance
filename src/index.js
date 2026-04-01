require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// 🔥 INIT APP
const app = express();

/* =======================
   TRUST PROXY (Railway)
======================= */
app.set("trust proxy", 1);

/* =======================
   ENSURE UPLOAD FOLDER
======================= */
const uploadDir = path.join(__dirname, "uploads");

try {
   if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("📁 Folder uploads dibuat");
   }
} catch (err) {
   console.error("❌ Gagal membuat folder uploads:", err);
}

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
   origin: "*", // bisa dikunci nanti ke domain app kamu
   methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =======================
   STATIC FILE
======================= */
app.use("/uploads", express.static(uploadDir));

/* =======================
   IMPORT ROUTES
======================= */
let officeRoutes, attendanceRoutes, authRoutes;

try {
   officeRoutes = require("./routes/officeRoutes");
   attendanceRoutes = require("./routes/attendanceRoutes");
   authRoutes = require("./routes/authRoutes");
} catch (err) {
   console.error("❌ Error load routes:", err);
   process.exit(1);
}

/* =======================
   ROUTES
======================= */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/offices", officeRoutes);
app.use("/api/v1/attendance", attendanceRoutes);

/* =======================
   HEALTH CHECK (WAJIB)
======================= */
app.get("/", (req, res) => {
   res.status(200).send("🚀 API Attendance Running (Railway)");
});

app.get("/health", (req, res) => {
   res.status(200).json({
      success: true,
      message: "Server sehat 💚",
      uptime: process.uptime(),
      timestamp: new Date(),
   });
});

/* =======================
   404 HANDLER
======================= */
app.use((req, res) => {
   res.status(404).json({
      success: false,
      message: "Endpoint tidak ditemukan ❌",
      path: req.originalUrl,
   });
});

/* =======================
   GLOBAL ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
   console.error("🔥 ERROR GLOBAL:", err);

   res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error ❌",
   });
});

/* =======================
   HANDLE CRASH (IMPORTANT)
======================= */
process.on("unhandledRejection", (err) => {
   console.error("🔥 Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
   console.error("🔥 Uncaught Exception:", err);
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
   console.log(`🚀 Server running on port ${PORT}`);
});