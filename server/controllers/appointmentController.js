const db = require("../config/db");

// ─── Helpers ──────────────────────────────────────────────────────────────────

const safeInt = (val, fallback = 0, min = 0, max = Infinity) =>
  Math.min(Math.max(parseInt(val, 10) || fallback, min), max);

/** Basic date string guard — prevents garbage from reaching the DB */
const isValidDate = (str) => str && /^\d{4}-\d{2}-\d{2}$/.test(str);

/** Basic HH:MM guard */
const isValidTime = (str) => str && /^\d{2}:\d{2}$/.test(str);

// ─── 1. Get All Verified Doctors (admin / general use) ────────────────────────

exports.getAllDoctors = async (req, res) => {
  try {
    const [doctors] = await db.execute(`
      SELECT u.id, u.fullname,
             d.specialization, d.experience_years, d.consultation_fee
      FROM users u
      JOIN doctors_profiles d ON u.id = d.user_id
      WHERE u.role = 'doctor' AND u.is_verified = 1
      ORDER BY u.fullname ASC
    `);
    return res.json(doctors);
  } catch (error) {
    console.error("Get All Doctors Error:", error);
    return res.status(500).json({ message: "Error fetching doctors." });
  }
};

// ─── 2. Get Available Doctors (patient-facing browse) ────────────────────────

exports.getAvailableDoctors = async (req, res) => {
  try {
    const [doctors] = await db.execute(`
      SELECT
        u.id          AS doctor_user_id,
        u.fullname,
        d.specialization,
        d.experience_years,
        d.consultation_fee,
        d.bio,
        d.availability_json
      FROM users u
      JOIN doctors_profiles d ON u.id = d.user_id
      WHERE u.role = 'doctor' AND u.is_verified = 1
      ORDER BY d.experience_years DESC
    `);
    return res.json(doctors);
  } catch (error) {
    console.error("Fetch Doctors Error:", error);
    return res.status(500).json({ message: "Failed to retrieve doctor list." });
  }
};

// ─── 3. Get Booked Slots for a Doctor on a Date ───────────────────────────────

/**
 * GET /patient/booked-slots?doctor_id=&date=YYYY-MM-DD
 * Returns the HH:MM times already booked so the frontend can grey them out.
 */
exports.getBookedSlots = async (req, res) => {
  try {
    const { doctor_id, date } = req.query;

    if (!doctor_id || !date) {
      return res
        .status(400)
        .json({ message: "doctor_id and date are required." });
    }
    if (!isValidDate(date)) {
      return res
        .status(400)
        .json({ message: "date must be in YYYY-MM-DD format." });
    }

    const [rows] = await db.execute(
      `SELECT TIME_FORMAT(appointment_date, '%H:%i') AS time
       FROM appointments
       WHERE doctor_id = ?
         AND DATE(appointment_date) = ?
         AND status NOT IN ('cancelled')`,
      [doctor_id, date],
    );

    return res.json({ booked_times: rows.map((r) => r.time) });
  } catch (error) {
    console.error("Booked Slots Error:", error);
    return res.status(500).json({ message: "Failed to fetch booked slots." });
  }
};

// ─── 4. Legacy bookAppointment (kept for backwards compatibility) ─────────────

exports.bookAppointment = async (req, res) => {
  try {
    const { doctor_id, appointment_date, reason, assessment_id } = req.body;
    const patient_id = req.userId;

    if (!doctor_id || !appointment_date) {
      return res
        .status(400)
        .json({ message: "doctor_id and appointment_date are required." });
    }

    // Double-booking guard
    const [existing] = await db.execute(
      `SELECT id FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'`,
      [doctor_id, appointment_date],
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: "This time slot is already taken." });
    }

    await db.execute(
      `INSERT INTO appointments
         (patient_id, doctor_id, appointment_date, reason_for_visit, ai_assessment_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        patient_id,
        doctor_id,
        appointment_date,
        reason || null,
        assessment_id || null,
      ],
    );

    return res
      .status(201)
      .json({ message: "Appointment request sent successfully!" });
  } catch (error) {
    console.error("Book Appointment Error:", error);
    return res.status(500).json({ message: "Booking failed." });
  }
};

// ─── 5. Create Appointment (date + time split — used by BookingModal) ─────────

exports.createAppointment = async (req, res) => {
  try {
    const { doctor_id, date, time, reason, assessment_id } = req.body;
    const patient_id = req.userId;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!doctor_id)
      return res
        .status(400)
        .json({ message: "doctor_id is required.", field: "doctor_id" });
    if (!isValidDate(date))
      return res
        .status(400)
        .json({ message: "A valid date is required.", field: "date" });
    if (!isValidTime(time))
      return res
        .status(400)
        .json({ message: "A valid time slot is required.", field: "time" });

    // Past-date guard
    const appointmentDateTime = new Date(`${date}T${time}:00`);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({
        message: "Appointment date must be in the future.",
        field: "date",
      });
    }

    const formattedDateTime = `${date} ${time}:00`;

    // ── Double-booking guard ──────────────────────────────────────────────────
    const [existing] = await db.execute(
      `SELECT id FROM appointments
       WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'`,
      [doctor_id, formattedDateTime],
    );
    if (existing.length > 0) {
      return res.status(409).json({
        message: "This time slot is already booked. Please choose another.",
      });
    }

    // ── Verify doctor exists ──────────────────────────────────────────────────
    const [doctorCheck] = await db.execute(
      "SELECT id FROM users WHERE id = ? AND role = 'doctor' AND is_verified = 1",
      [doctor_id],
    );
    if (doctorCheck.length === 0) {
      return res
        .status(404)
        .json({ message: "Doctor not found or unavailable." });
    }

    // ── Insert ────────────────────────────────────────────────────────────────
    const [result] = await db.execute(
      `INSERT INTO appointments
         (patient_id, doctor_id, appointment_date, reason_for_visit, ai_assessment_id)
       VALUES (?, ?, ?, ?, ?)`,
      [
        patient_id,
        doctor_id,
        formattedDateTime,
        reason || null,
        assessment_id || null,
      ],
    );

    return res.status(201).json({
      message: "Appointment requested successfully!",
      appointmentId: result.insertId,
    });
  } catch (error) {
    console.error("Create Appointment Error:", error);
    return res.status(500).json({ message: "Failed to create appointment." });
  }
};

// ─── 6. Get Patient's Own Appointments ───────────────────────────────────────

exports.getPatientAppointments = async (req, res) => {
  try {
    const userId = req.userId;
    const status = req.query.status; // optional filter: pending|confirmed|completed|cancelled

    const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

    let query = `
      SELECT
        a.id,
        a.appointment_date,
        a.status,
        a.reason_for_visit,
        a.created_at,
        u.fullname          AS doctor_name,
        dp.specialization   AS doctor_specialization,
        dp.consultation_fee
      FROM appointments a
      JOIN users u           ON a.doctor_id  = u.id
      LEFT JOIN doctors_profiles dp ON dp.user_id = u.id
      WHERE a.patient_id = ?
    `;
    const params = [userId];

    if (status && VALID_STATUSES.includes(status)) {
      query += " AND a.status = ?";
      params.push(status);
    }

    query += " ORDER BY a.appointment_date DESC";

    const [rows] = await db.execute(query, params);
    return res.json(rows);
  } catch (error) {
    console.error("Get Patient Appointments Error:", error);
    return res.status(500).json({ message: "Failed to fetch appointments." });
  }
};

// ─── 7. Cancel Appointment ────────────────────────────────────────────────────

/**
 * PATCH /patient/appointments/:id/cancel
 * Patient can only cancel their own pending/confirmed appointments.
 */
exports.cancelAppointment = async (req, res) => {
  try {
    const userId = req.userId;
    const appointmentId = parseInt(req.params.id, 10);

    if (!appointmentId || isNaN(appointmentId)) {
      return res
        .status(400)
        .json({ message: "Valid appointment ID is required." });
    }

    // Verify ownership and cancellable status
    const [rows] = await db.execute(
      `SELECT id, status FROM appointments WHERE id = ? AND patient_id = ?`,
      [appointmentId, userId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Appointment not found." });
    }
    if (!["pending", "confirmed"].includes(rows[0].status)) {
      return res.status(400).json({
        message: `Cannot cancel an appointment with status '${rows[0].status}'.`,
      });
    }

    await db.execute(
      "UPDATE appointments SET status = 'cancelled' WHERE id = ?",
      [appointmentId],
    );

    return res.json({ message: "Appointment cancelled successfully." });
  } catch (error) {
    console.error("Cancel Appointment Error:", error);
    return res.status(500).json({ message: "Failed to cancel appointment." });
  }
};

exports.getPatientAppointments = async (req, res) => {
  try {
    const userId = req.userId;
    // JOIN with doctor_notes to get diagnosis and advice if session is complete
    const [rows] = await db.execute(
      `
      SELECT 
        a.*, 
        u.fullname AS doctor_name, 
        dp.specialization,
        dn.diagnosis, 
        dn.clinical_advice, 
        dn.prescribed_meds
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      LEFT JOIN doctors_profiles dp ON u.id = dp.user_id
      LEFT JOIN doctor_notes dn ON a.id = dn.appointment_id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC
    `,
      [userId],
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching appointments" });
  }
};
