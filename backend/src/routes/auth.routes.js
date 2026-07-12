const express = require("express");
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.getMe);

module.exports = router;
