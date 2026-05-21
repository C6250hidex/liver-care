const db = require("../config/db");

exports.getDoctorDashboard = async (req, res) => {
  try {
    const doctorId = req.userId;

    // 1. Get Summary Stats
    const [stats] = await db.execute(
      `
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_count,
        COUNT(DISTINCT patient_id) as total_patients
      FROM appointments 
      WHERE doctor_id = ?`,
      [doctorId],
    );

    // 2. Get Upcoming Appointments with Patient & AI Details
    const [appointments] = await db.execute(
      `
      SELECT 
        a.id,
        a.patient_id,
        a.appointment_date,
        a.status,
        a.reason_for_visit,
        a.ai_assessment_id,
        u.fullname as patient_name,
        u.email as patient_email,
        ai.risk_score,
        ai.warning_level
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      LEFT JOIN ai_results ai ON a.ai_assessment_id = ai.id
      WHERE a.doctor_id = ? AND a.status != 'cancelled'
      ORDER BY a.appointment_date ASC`,
      [doctorId],
    );

    res.json({
      stats: stats[0],
      appointments: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching doctor dashboard" });
  }
};

// Update Appointment Status (Confirm/Complete)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doctorId = req.userId;
    const ALLOWED_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        message:
          "Invalid status value. Allowed values are pending, confirmed, completed, cancelled.",
      });
    }

    const [existing] = await db.execute(
      "SELECT id FROM appointments WHERE id = ? AND doctor_id = ?",
      [id, doctorId],
    );

    if (existing.length === 0) {
      return res
        .status(404)
        .json({ message: "Appointment not found or not assigned to you." });
    }

    await db.execute("UPDATE appointments SET status = ? WHERE id = ?", [
      status,
      id,
    ]);

    res.json({ message: `Appointment marked as ${status}` });
  } catch (error) {
    console.error("Update Appointment Status Error:", error);
    res.status(500).json({ message: "Update failed" });
  }
};

exports.getDoctorSummary = async (req, res) => {
  try {
    const doctorId = req.userId; // From authMiddleware

    const [[stats]] = await db.execute(
      `
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
        COUNT(DISTINCT patient_id) as total_patients
      FROM appointments 
      WHERE doctor_id = ?`,
      [doctorId],
    );

    const [appointments] = await db.execute(
      `
      SELECT 
        a.id,
        a.patient_id,
        a.appointment_date,
        a.status,
        a.reason_for_visit,
        a.ai_assessment_id,
        u.fullname as patient_name,
        u.email as patient_email,
        ai.risk_score,
        ai.warning_level
      FROM appointments a
      JOIN users u ON a.patient_id = u.id
      LEFT JOIN ai_results ai ON a.ai_assessment_id = ai.id
      WHERE a.doctor_id = ? AND a.status != 'cancelled'
      ORDER BY a.appointment_date ASC
    `,
      [doctorId],
    );

    res.json({ stats, appointments });
  } catch (error) {
    console.error("Doctor Summary Error:", error);
    res.status(500).json({ message: "Failed to load clinical data." });
  }
};

exports.getPatientClinicalRecords = async (req, res) => {
  try {
    const { id } = req.params; // This is the patient's User ID
    const doctorId = req.userId;

    const [permission] = await db.execute(
      `SELECT id FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1`,
      [doctorId, id],
    );

    if (permission.length === 0) {
      return res.status(403).json({
        message:
          "Access denied. You can only view records for your own patients.",
      });
    }

    const [[profile]] = await db.execute(
      "SELECT id, fullname, email, created_at FROM users WHERE id = ?",
      [id],
    );

    if (!profile) {
      return res.status(404).json({ message: "Patient not found." });
    }

    const [aiHistory] = await db.execute(
      "SELECT * FROM ai_results WHERE user_id = ? ORDER BY created_at DESC",
      [id],
    );

    const [healthLogs] = await db.execute(
      "SELECT * FROM health_logs WHERE user_id = ? ORDER BY logged_at DESC",
      [id],
    );

    const [notes] = await db.execute(
      `SELECT n.id, n.note_text, n.created_at, n.doctor_id, u.fullname AS doctor_name
       FROM doctor_notes n
       JOIN users u ON n.doctor_id = u.id
       WHERE n.patient_id = ?
       ORDER BY n.created_at DESC`,
      [id],
    );

    res.json({
      profile,
      aiHistory: aiHistory.map((h) => ({
        ...h,
        recommendations: JSON.parse(h.recommendations || "[]"),
      })),
      healthLogs,
      notes,
    });
  } catch (error) {
    console.error("Patient Clinical Records Error:", error);
    res.status(500).json({ message: "Error fetching clinical records" });
  }
};

exports.createPatientNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const doctorId = req.userId;

    if (!note || typeof note !== "string" || !note.trim()) {
      return res.status(400).json({ message: "A valid note is required." });
    }

    const [permission] = await db.execute(
      `SELECT id FROM appointments WHERE doctor_id = ? AND patient_id = ? LIMIT 1`,
      [doctorId, id],
    );

    if (permission.length === 0) {
      return res.status(403).json({ message: "Access denied." });
    }

    const [result] = await db.execute(
      `INSERT INTO doctor_notes (patient_id, doctor_id, note_text) VALUES (?, ?, ?)`,
      [id, doctorId, note.trim()],
    );

    const [createdNoteRows] = await db.execute(
      `SELECT n.id, n.note_text, n.created_at, n.doctor_id, u.fullname AS doctor_name
       FROM doctor_notes n
       JOIN users u ON n.doctor_id = u.id
       WHERE n.id = ?`,
      [result.insertId],
    );

    res.status(201).json(createdNoteRows[0]);
  } catch (error) {
    console.error("Create Patient Note Error:", error);
    res.status(500).json({ message: "Failed to save note." });
  }
};

/**
 * GET /api/doctor/my-patients
 * Returns a unique list of all patients who have interacted with this doctor
 */
exports.getMyPatients = async (req, res) => {
  try {
    const doctorId = req.userId;
    const [patients] = await db.execute(
      `
      SELECT DISTINCT 
        u.id, u.fullname, u.email, u.created_at,
        MAX(a.appointment_date) as last_visit,
        COUNT(a.id) as total_appointments
      FROM users u
      JOIN appointments a ON u.id = a.patient_id
      WHERE a.doctor_id = ?
      GROUP BY u.id
      ORDER BY last_visit DESC
    `,
      [doctorId],
    );

    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patient list" });
  }
};

/**
 * GET /api/doctor/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const [profile] = await db.execute(
      "SELECT * FROM doctors_profiles WHERE user_id = ?",
      [req.userId],
    );
    res.json(profile[0] || {});
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

/**
 * PATCH /api/doctor/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { specialization, experience_years, consultation_fee, bio } =
      req.body;
    const doctorId = req.userId;

    // Check if profile exists
    const [exists] = await db.execute(
      "SELECT id FROM doctors_profiles WHERE user_id = ?",
      [doctorId],
    );

    if (exists.length > 0) {
      await db.execute(
        `UPDATE doctors_profiles 
         SET specialization = ?, experience_years = ?, consultation_fee = ?, bio = ? 
         WHERE user_id = ?`,
        [specialization, experience_years, consultation_fee, bio, doctorId],
      );
    } else {
      await db.execute(
        `INSERT INTO doctors_profiles (user_id, specialization, experience_years, consultation_fee, bio) 
         VALUES (?, ?, ?, ?, ?)`,
        [doctorId, specialization, experience_years, consultation_fee, bio],
      );
    }

    res.json({ message: "Professional profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Update failed" });
  }
};

exports.completeAppointmentWithNote = async (req, res) => {
  const connection = await db.getConnection(); // Get connection for transaction
  try {
    const { appointmentId } = req.params;
    const { diagnosis, clinical_advice, patient_id } = req.body;
    const doctorId = req.userId;

    await connection.beginTransaction();

    // 1. Update Appointment Status
    await connection.execute(
      "UPDATE appointments SET status = 'completed' WHERE id = ?",
      [appointmentId],
    );

    // 2. Save Clinical Note
    await connection.execute(
      `INSERT INTO doctor_notes (appointment_id, doctor_id, patient_id, diagnosis, clinical_advice) 
       VALUES (?, ?, ?, ?, ?)`,
      [appointmentId, doctorId, patient_id, diagnosis, clinical_advice],
    );

    await connection.commit();
    res.json({ message: "Consultation finalized and note saved." });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ message: "Failed to finalize consultation." });
  } finally {
    connection.release();
  }
};
