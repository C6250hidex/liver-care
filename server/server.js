const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const aiRoutes = require("./routes/aiRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const blogRoutes = require("./routes/blogRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" })); // Parse JSON bodies

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/admin", adminRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Liver Care API is running...");
});

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Test DB Connection Route
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT 1 + 1 AS result");
    res.json({ message: "Database Connected!", result: rows });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Database connection failed", error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", {
    timestamp: new Date().toISOString(),
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    status: err.status || 500,
  });
});

// Ensure the doctor_notes table exists before accepting traffic.
db.execute(
  `CREATE TABLE IF NOT EXISTS doctor_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  note_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
)`,
)
  .then(async () => {
    console.log("doctor_notes table exists or was created.");

    // Ensure the table has columns created by other migrations/code.
    // Add any missing columns to keep schema compatible with both older and newer versions.
    const ensureColumn = async (colName, definition) => {
      try {
        const [rows] = await db.execute(
          `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'doctor_notes' AND COLUMN_NAME = ?`,
          [process.env.DB_NAME, colName],
        );
        if (rows[0].cnt === 0) {
          await db.execute(
            `ALTER TABLE doctor_notes ADD COLUMN ${colName} ${definition}`,
          );
          console.log(`Added missing column ${colName} to doctor_notes`);
        }
      } catch (err) {
        console.error(
          `Failed to ensure column ${colName}:`,
          err.message || err,
        );
      }
    };

    await ensureColumn("appointment_id", "INT NULL");
    await ensureColumn("note_text", "TEXT NULL");
    await ensureColumn("diagnosis", "VARCHAR(255) NULL");
    await ensureColumn("clinical_advice", "TEXT NULL");
    await ensureColumn("prescribed_meds", "TEXT NULL");
  })
  .catch((err) => console.error("Failed to create doctor_notes table:", err));

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ Database: ${process.env.DB_HOST}`);
  console.log(
    `✅ Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Gracefully shutting down...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
