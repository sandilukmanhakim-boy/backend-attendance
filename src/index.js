require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// ✅ pastikan folder uploads ada
if (!fs.existsSync("uploads")) {
   fs.mkdirSync("uploads", { recursive: true });
}

const app = express();

/* =======================
   MIDDLEWARE
======================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   STATIC FILE
======================= */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =======================
   ROUTES
======================= */
const officeRoutes = require("./routes/officeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/offices", officeRoutes);
app.use("/api/v1/attendance", attendanceRoutes);

/* =======================
   TEST
======================= */
app.get("/", (req, res) => {
   res.send("🚀 API Running...");
});

app.get("/health", (req, res) => {
   res.json({
      success: true,
      message: "Server sehat 💚",
   });
});

/* =======================
   404
======================= */
app.use((req, res) => {
   res.status(404).json({
      success: false,
      message: "Endpoint tidak ditemukan ❌",
   });
});

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
   console.error("🔥 ERROR GLOBAL:", err);

   res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error ❌",
   });
});

/* =======================
   START
======================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
   console.log(`🔥 Server running on http://localhost:${PORT}`);
});