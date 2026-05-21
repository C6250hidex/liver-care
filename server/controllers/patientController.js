const db = require("../config/db");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely parse an integer query param with a fallback and optional clamp.
 * Always returns a plain JS Number so mysql2 prepared statements don't throw.
 */
const safeInt = (val, fallback = 0, min = 0, max = Infinity) =>
  Math.min(Math.max(parseInt(val, 10) || fallback, min), max);

/**
 * Derive a human-readable health status from the latest log row.
 * Exported so unit tests can import it independently.
 */
const deriveStatus = (log) => {
  if (!log) return "No Data";
  const fever = parseFloat(log.fever);
  if (log.jaundice || log.fatigue === "severe" || fever >= 38.5)
    return "Requires Attention";
  if (log.fatigue === "moderate" || fever >= 37.5 || log.nausea === "severe")
    return "Monitor Closely";
  return "Stable";
};

// ─── 1. Dashboard Summary ─────────────────────────────────────────────────────

/**
 * GET /patient/dashboard
 * Merges AI Analysis, Appointments, Reminders, and Health Status.
 * All sub-queries run in parallel for speed.
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorised." });
    }

    // Run all DB queries in parallel — no sequential blocking
    const [
      [aiData],
      [appointments],
      [reminders],
      [healthLogs],
      [reminderCount],
    ] = await Promise.all([
      // A. Latest AI risk score
      db.execute(
        `SELECT risk_score, warning_level, created_at
         FROM ai_results
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId],
      ),

      // B. Next upcoming appointment with doctor details
      db.execute(
        `SELECT a.id, a.appointment_date, a.status, a.reason_for_visit,
                u.fullname AS doctor_name,
                dp.specialization AS doctor_specialization
         FROM appointments a
         JOIN users u  ON a.doctor_id = u.id
         LEFT JOIN doctors_profiles dp ON dp.user_id = u.id
         WHERE a.patient_id = ?
           AND a.appointment_date >= NOW()
           AND a.status NOT IN ('cancelled')
         ORDER BY a.appointment_date ASC
         LIMIT 1`,
        [userId],
      ),

      // C. Today's reminders (all statuses so the UI can show pending vs done)
      db.execute(
        `SELECT id, message, reminder_date, status, type
         FROM reminders
         WHERE user_id = ?
           AND DATE(reminder_date) = CURDATE()
         ORDER BY reminder_date ASC`,
        [userId],
      ),

      // D. Latest health log (include nausea + abdominal_pain for richer status)
      db.execute(
        `SELECT fever, fatigue, jaundice, nausea, abdominal_pain, logged_at
         FROM health_logs
         WHERE user_id = ?
         ORDER BY logged_at DESC
         LIMIT 1`,
        [userId],
      ),

      // E. Pending reminder count for badge display
      db.execute(
        `SELECT COUNT(*) AS pending
         FROM reminders
         WHERE user_id = ?
           AND status = 'pending'
           AND reminder_date >= NOW()`,
        [userId],
      ),
    ]);

    const latestLog = healthLogs[0] || null;

    return res.json({
      latestScore: aiData[0]?.risk_score ?? 0,
      riskLevel: aiData[0]?.warning_level ?? "Not Evaluated",
      lastAssessmentAt: aiData[0]?.created_at ?? null,
      status: deriveStatus(latestLog),
      latestLog,
      nextAppointment: appointments[0] ?? null,
      reminders: reminders ?? [],
      pendingReminderCount: reminderCount[0]?.pending ?? 0,
      remindersCount: reminderCount[0]?.pending ?? 0,
    });
  } catch (error) {
    console.error("Dashboard Summary Fetch Error:", error);
    return res
      .status(500)
      .json({ message: "Error fetching dashboard summary." });
  }
};

// ─── 2. Save Daily Health Log ─────────────────────────────────────────────────

/**
 * POST /patient/health-logs
 * Validates and persists a daily symptom entry.
 * Returns the new log's ID and a derived status so the frontend can update immediately.
 */
exports.saveHealthLog = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorised." });
    }

    const { fever, fatigue, jaundice, nausea, abdominal_pain } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────

    const temp = parseFloat(fever);
    if (isNaN(temp) || temp < 34 || temp > 43) {
      return res.status(400).json({
        message: "Fever must be a valid temperature between 34 °C and 43 °C.",
        field: "fever",
      });
    }

    const VALID_SEVERITY = ["none", "mild", "moderate", "severe"];
    if (fatigue && !VALID_SEVERITY.includes(fatigue)) {
      return res.status(400).json({
        message: `Fatigue must be one of: ${VALID_SEVERITY.join(", ")}.`,
        field: "fatigue",
      });
    }
    if (nausea && !VALID_SEVERITY.includes(nausea)) {
      return res.status(400).json({
        message: `Nausea must be one of: ${VALID_SEVERITY.join(", ")}.`,
        field: "nausea",
      });
    }

    // ── Persist ───────────────────────────────────────────────────────────────

    const [result] = await db.execute(
      `INSERT INTO health_logs
         (user_id, fever, fatigue, jaundice, nausea, abdominal_pain)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        temp,
        fatigue || "none",
        jaundice ? 1 : 0,
        nausea || "none",
        abdominal_pain ? 1 : 0,
      ],
    );

    // Derive status immediately so the frontend doesn't need a second request
    const newLog = { fever: temp, fatigue, jaundice, nausea, abdominal_pain };

    return res.status(201).json({
      message: "Daily health log saved successfully!",
      logId: result.insertId,
      status: deriveStatus(newLog),
    });
  } catch (error) {
    console.error("Health Log Save Error:", error);
    return res.status(500).json({ message: "Failed to save health log." });
  }
};

// ─── 3. Get Health Logs ───────────────────────────────────────────────────────

/**
 * GET /patient/health-logs
 * Returns paginated health logs for the authenticated patient.
 * Supports ?limit=&offset= query params (safe integers, no SQL injection).
 */
exports.getHealthLogs = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorised." });
    }

    const limit = safeInt(req.query.limit, 20, 1, 100);
    const offset = safeInt(req.query.offset, 0, 0);

    // Count and fetch in parallel
    const [[countResult], [logs]] = await Promise.all([
      db.execute(
        "SELECT COUNT(*) AS total FROM health_logs WHERE user_id = ?",
        [userId],
      ),
      db.execute(
        // LIMIT/OFFSET interpolated as validated integers — safe, no injection risk
        `SELECT * FROM health_logs
         WHERE user_id = ?
         ORDER BY logged_at DESC
         LIMIT ${limit} OFFSET ${offset}`,
        [userId],
      ),
    ]);

    return res.json({
      logs,
      pagination: {
        total: countResult[0]?.total ?? 0,
        limit,
        offset,
        hasMore: offset + limit < (countResult[0]?.total ?? 0),
      },
    });
  } catch (error) {
    console.error("Health Logs Fetch Error:", error);
    return res.status(500).json({ message: "Error fetching health logs." });
  }
};

// ─── 4. Get Profile ───────────────────────────────────────────────────────────

/**
 * GET /patient/profile
 * Returns public profile fields for the authenticated user.
 * Includes is_verified from the users table (added via ALTER TABLE).
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorised." });
    }

    const [user] = await db.execute(
      `SELECT id, fullname, email, role, is_verified, created_at
       FROM users
       WHERE id = ?`,
      [userId],
    );

    if (!user[0]) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json(user[0]);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return res.status(500).json({ message: "Error fetching profile." });
  }
};

// ─── 5. Update Profile ────────────────────────────────────────────────────────

/**
 * PATCH /patient/profile
 * Allows the patient to update their display name.
 * Extend the allowed fields list as needed.
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorised." });
    }

    const { fullname } = req.body;

    if (!fullname || typeof fullname !== "string" || !fullname.trim()) {
      return res.status(400).json({
        message: "A valid fullname is required.",
        field: "fullname",
      });
    }

    await db.execute("UPDATE users SET fullname = ? WHERE id = ?", [
      fullname.trim(),
      userId,
    ]);

    return res.json({
      message: "Profile updated successfully.",
      fullname: fullname.trim(),
    });
  } catch (error) {
    console.error("Profile Update Error:", error);
    return res.status(500).json({ message: "Error updating profile." });
  }
};

// ─── 6. Change Password ───────────────────────────────────────────────────────

/**
 * PATCH /patient/profile/password
 * Verifies current password then updates to the new one.
 * Requires bcrypt — install with: npm i bcryptjs
 */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorised." });
    }

    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required." });
    }
    if (new_password.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters." });
    }

    const [rows] = await db.execute("SELECT password FROM users WHERE id = ?", [
      userId,
    ]);

    if (!rows[0]) {
      return res.status(404).json({ message: "User not found." });
    }

    const bcrypt = require("bcryptjs");
    const match = await bcrypt.compare(current_password, rows[0].password);

    if (!match) {
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await db.execute("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      userId,
    ]);

    return res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({ message: "Error changing password." });
  }
};
