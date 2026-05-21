const express = require("express");
const router = express.Router();
const doctorController = require("../controllers/doctorController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

// Protect all doctor routes and enforce doctor role
router.use(authMiddleware, requireRole("doctor"));

router.get("/dashboard", doctorController.getDoctorDashboard);
router.patch("/appointment/:id", doctorController.updateAppointmentStatus);
router.get("/summary", doctorController.getDoctorSummary);
router.get("/patient/:id/records", doctorController.getPatientClinicalRecords);
router.post("/patient/:id/notes", doctorController.createPatientNote);
router.get("/my-patients", doctorController.getMyPatients);
router.get("/profile", doctorController.getProfile);
router.patch("/profile", doctorController.updateProfile);
router.post("/blogs", require("../controllers/blogController").createBlog);
router.post(
  "/appointment/:appointmentId/complete",
  authMiddleware,
  doctorController.completeAppointmentWithNote,
);

module.exports = router;
