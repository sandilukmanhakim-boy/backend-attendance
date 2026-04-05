const router = require("express").Router();

const controller = require("../controllers/adminController");
const { verifyToken } = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔥 EMPLOYEE
router.post("/employee", verifyToken, role("admin"), controller.createEmployee);
router.get("/employee", verifyToken, role("admin"), controller.getEmployees);
router.put("/employee/:id", verifyToken, role("admin"), controller.updateEmployee);
router.delete("/employee/:id", verifyToken, role("admin"), controller.deleteEmployee);

// 🔥 OFFICE
router.post("/office", verifyToken, role("admin"), controller.setOffice);
router.get("/office", verifyToken, role("admin"), controller.getOffice);

// 🔥 ATTENDANCE
router.get("/attendance", verifyToken, role("admin", "hr"), controller.getAttendance);

module.exports = router;