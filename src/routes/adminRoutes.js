const router = require("express").Router();

const controller = require("../controllers/adminController");
const { verifyToken } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔥 EMPLOYEE
router.post("/employees", verifyToken, role("admin"), controller.createEmployees);
router.get("/employees", verifyToken, role("admin"), controller.getEmployees);
router.put("/employees/:id", verifyToken, role("admin"), controller.updateEmployees);
router.delete("/employees/:id", verifyToken, role("admin"), controller.deleteEmployees);

// 🔥 OFFICE
router.post("/office", verifyToken, role("admin"), controller.setOffices); // ✅ FIX
router.get("/office", verifyToken, role("admin"), controller.getOffices); // ✅ FIX

// 🔥 ATTENDANCE
router.get("/attendance", verifyToken, role("admin", "hr"), controller.getAttendances); // ✅ FIX

module.exports = router;