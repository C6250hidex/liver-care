const db = require("../config/db");
const logActivity = require("../utils/logger");

/**
 * GET /api/admin/stats
 * Global overview of the platform
 */
exports.getGlobalStats = async (req, res) => {
  try {
    const [[counts]] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'patient') as total_patients,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') as total_doctors,
        (SELECT COUNT(*) FROM appointments) as total_appointments,
        (SELECT COUNT(*) FROM ai_results) as total_assessments
    `);

    const [riskTrends] = await db.execute(`
      SELECT warning_level, COUNT(*) as count 
      FROM ai_results 
      GROUP BY warning_level
    `);

    res.json({ counts, riskTrends });
  } catch (error) {
    res.status(500).json({ message: "Error fetching system stats" });
  }
};

/**
 * GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.execute(
      "SELECT id, fullname, email, role, is_verified, is_active, created_at FROM users ORDER BY created_at DESC",
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
};

/**
 * PATCH /api/admin/verify-doctor/:id
 */
exports.toggleVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // true or false

    await db.execute("UPDATE users SET is_verified = ? WHERE id = ?", [
      status ? 1 : 0,
      id,
    ]);
    res.json({ message: "User verification status updated" });
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    // 1. Parallel Stats
    const [[counts]] = await db.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM ai_results) as total_assessments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pending_appointments,
        (SELECT SUM(consultation_fee) FROM doctors_profiles JOIN appointments ON doctors_profiles.user_id = appointments.doctor_id WHERE status = 'completed') as platform_revenue
    `);

    // 2. Risk Distribution (For Charts)
    const [distribution] = await db.execute(
      "SELECT warning_level, COUNT(*) as count FROM ai_results GROUP BY warning_level",
    );

    // 3. Recent Activity Stream (The "Live" Feed)
    const [activities] = await db.execute(`
      SELECT l.*, u.fullname, u.role 
      FROM activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC LIMIT 15
    `);

    res.json({ counts, distribution, activities });
  } catch (error) {
    res.status(500).json({ message: "Admin portal sync error" });
  }
};

/**
 * PATCH /api/admin/user/:id/lockdown
 */
exports.toggleUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await db.execute("UPDATE users SET is_active = ? WHERE id = ?", [
      is_active,
      id,
    ]);

    // Log the lockdown activity
    const action = is_active ? "unlocked" : "locked";
    await logActivity(
      req.userId,
      "profile_update",
      `Admin ${action} account for user ID: ${id}`,
      is_active ? "info" : "warning",
    );

    res.json({ message: `Account successfully ${action}` });
  } catch (error) {
    res.status(500).json({ message: "Lockdown operation failed" });
  }
};

/**
 * PATCH /api/admin/blog/:id/moderate
 */
exports.moderateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'published' or 'rejected'

    await db.execute("UPDATE blogs SET status = ? WHERE id = ?", [status, id]);
    res.json({ message: `Blog post has been ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Moderation failed" });
  }
};
