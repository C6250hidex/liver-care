const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

router.use(authMiddleware, adminMiddleware); // Apply to all routes in this file

router.get("/stats", adminController.getGlobalStats);
router.get("/summary", adminController.getAdminDashboard);
router.get("/users", adminController.getAllUsers);
router.patch("/verify-user/:id", adminController.toggleVerification);
router.patch("/user/:id/lockdown", adminController.toggleUserAccount);
router.patch("/blog/:id/moderate", adminController.moderateBlog);

module.exports = router;
