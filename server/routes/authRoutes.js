const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
} = require("../controllers/authController");

// Routes
router.get("/verify/:token", verifyEmail);
router.post("/register", register);
router.post("/login", login);

module.exports = router;
