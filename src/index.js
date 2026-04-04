const app = require("./app");
const { pool } = require("./config/db");

const PORT = process.env.PORT || 3000;

pool.connect()
   .then(() => {
      console.log("🚀 DB Ready");

      app.listen(PORT, () => {
         console.log(`🚀 Server running on ${PORT}`);
      });
   })
   .catch((err) => {
      console.error("❌ DB gagal:", err.message);
   });