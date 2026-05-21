const express = require("express");
const router = express.Router();

const patientController = require("../controllers/patientController");
const appointmentController = require("../controllers/appointmentController");
const { authMiddleware, requireRole } = require("../middleware/authMiddleware");

// Protect patient endpoints and enforce patient role
router.use(authMiddleware, requireRole("patient"));

// ─── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile", patientController.getProfile);
router.patch("/profile", patientController.updateProfile);
router.patch("/profile/password", patientController.changePassword);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/summary", authMiddleware, patientController.getDashboardSummary);

// ─── Health Logs ─────────────────────────────────────────────────────────────
router.get("/health-logs", authMiddleware, patientController.getHealthLogs);
router.post("/log", authMiddleware, patientController.saveHealthLog);

// ─── Appointments ─────────────────────────────────────────────────────────────
router.get(
  "/doctors",
  authMiddleware,
  appointmentController.getAvailableDoctors,
);
router.get(
  "/appointments",
  authMiddleware,
  appointmentController.getPatientAppointments,
);
router.patch(
  "/appointments/:id/cancel",
  authMiddleware,
  appointmentController.cancelAppointment,
);
router.get(
  "/booked-slots",
  authMiddleware,
  appointmentController.getBookedSlots,
);
router.post(
  "/book-appointment",
  authMiddleware,
  appointmentController.createAppointment,
);

module.exports = router;
