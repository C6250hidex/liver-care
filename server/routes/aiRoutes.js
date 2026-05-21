const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const { authMiddleware } = require("../middleware/authMiddleware");

// 1. Run new analysis
router.post("/analyze", authMiddleware, aiController.analyzeSymptoms);

// 2. Get history of all assessments
router.get("/history", authMiddleware, aiController.getAssessmentHistory);

// 3. Get a specific assessment by ID
router.get("/report/:id", authMiddleware, aiController.getAssessmentById);

module.exports = router;
