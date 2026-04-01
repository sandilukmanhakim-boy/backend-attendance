const express = require("express");
const router = express.Router();

const officeController = require("../controllers/officeController");

/* =========================
   GET ALL OFFICES
========================= */
router.get("/", officeController.getOffices);

module.exports = router;