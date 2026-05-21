const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const { authMiddleware } = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// Public blog listing
router.get(
  "/moderation/all",
  authMiddleware,
  adminMiddleware,
  blogController.getAllModerationBlogs,
);
router.get(
  "/all-moderation",
  authMiddleware,
  adminMiddleware,
  blogController.getAllModerationBlogs,
);
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);

// Newsletter subscription
router.post("/subscribe", blogController.handleSubscription);

module.exports = router;
