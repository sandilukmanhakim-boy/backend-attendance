const router = require("express").Router();

const controller = require("../controllers/adminController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// 🔥 EMPLOYEE
router.post("/employee", auth, role(["admin"]), controller.createEmployee);
router.get("/employee", auth, role(["admin"]), controller.getEmployees);
router.put("/employee/:id", auth, role(["admin"]), controller.updateEmployee);
router.delete("/employee/:id", auth, role(["admin"]), controller.deleteEmployee);

// 🔥 OFFICE
router.post("/office", auth, role(["admin"]), controller.setOffice);
router.get("/office", auth, role(["admin"]), controller.getOffice);

// 🔥 ATTENDANCE
router.get("/attendance", auth, role(["admin", "hr"]), controller.getAttendance);

module.exports = router;