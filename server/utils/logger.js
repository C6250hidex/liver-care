const db = require("../config/db");

const logActivity = async (userId, type, desc, severity = "info") => {
  try {
    await db.execute(
      "INSERT INTO activity_logs (user_id, action_type, description, severity) VALUES (?, ?, ?, ?)",
      [userId, type, desc, severity],
    );
  } catch (err) {
    console.error("Logger Error:", err);
  }
};

module.exports = logActivity;
