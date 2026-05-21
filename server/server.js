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
const fs = require("fs");
const path = require("path");

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

const clientDistPath = path.join(__dirname, "../client/dist");
const isProdWithClient =
  process.env.NODE_ENV === "production" && fs.existsSync(clientDistPath);

if (isProdWithClient) {
  app.use(express.static(clientDistPath));
}

// Test Route
app.get("/", (req, res) => {
  if (isProdWithClient) {
    return res.sendFile(path.join(clientDistPath, "index.html"));
  }

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

// DB Diagnostic Endpoint - returns existing tables and missing expected tables
app.get("/api/db/diagnose", async (req, res) => {
  try {
    const expectedTables = [
      "users",
      "doctors_profiles",
      "ai_results",
      "appointments",
      "health_logs",
      "doctor_notes",
      "blogs",
      "blog_subscribers",
    ];

    const [rows] = await db.execute("SHOW TABLES");
    const tables = rows.map((r) => Object.values(r)[0]);
    const missing = expectedTables.filter((t) => !tables.includes(t));

    res.json({ tables, missing });
  } catch (err) {
    console.error("DB Diagnose Error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to diagnose DB", error: err.message });
  }
});

// Apply full schema from SQL file (guarded by ENABLE_SCHEMA_APPLY=true)
app.post("/api/db/apply-schema", async (req, res) => {
  if (process.env.ENABLE_SCHEMA_APPLY !== "true") {
    return res
      .status(403)
      .json({ message: "Schema apply is disabled on this server." });
  }

  const sqlFile = path.join(__dirname, "..", "LIVER-_CARE.session.sql");
  try {
    const sql = fs.readFileSync(sqlFile, "utf8");
    // Split statements on semicolon followed by newline to avoid splitting inside routines
    const statements = sql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    const results = [];
    for (const stmt of statements) {
      try {
        await db.execute(stmt);
        results.push({ statement: stmt.slice(0, 80), status: "ok" });
      } catch (err) {
        results.push({
          statement: stmt.slice(0, 80),
          status: "error",
          error: err.message,
        });
      }
    }

    res.json({ message: "Schema apply completed", results });
  } catch (err) {
    console.error("Apply Schema Error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to apply schema", error: err.message });
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

// Initialize database tables asynchronously (non-blocking startup)
async function initializeDatabaseSchema() {
  try {
    const [userTable] = await db.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
      [process.env.DB_NAME],
    );

    if (!userTable.length) {
      console.warn(
        "⚠️  Database schema is incomplete: 'users' table is missing.",
      );
      console.warn(
        "   Skipping doctor_notes bootstrap. Use /api/db/diagnose and /api/db/apply-schema to initialize the full schema.",
      );
      return;
    }

    await db.execute(
      `CREATE TABLE IF NOT EXISTS doctor_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        note_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
    );
    console.log("✅ doctor_notes table verified/created");

    // Ensure table has all required columns
    const ensureColumn = async (colName, definition) => {
      try {
        const [rows] = await db.execute(
          `SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'doctor_notes' AND COLUMN_NAME = ?`,
          [process.env.DB_NAME, colName],
        );
        if (rows[0].cnt === 0) {
          await db.execute(
            `ALTER TABLE doctor_notes ADD COLUMN ${colName} ${definition}`,
          );
          console.log(`  → Added missing column: ${colName}`);
        }
      } catch (err) {
        console.warn(
          `  ⚠️  Could not ensure column ${colName}: ${err.message}`,
        );
      }
    };

    await ensureColumn("appointment_id", "INT NULL");
    await ensureColumn("diagnosis", "VARCHAR(255) NULL");
    await ensureColumn("clinical_advice", "TEXT NULL");
    await ensureColumn("prescribed_meds", "TEXT NULL");
  } catch (err) {
    console.error(
      "⚠️  Database schema initialization failed (will retry on next query):",
      err.message,
    );
  }
}

// Client fallback for production SPA routes
if (isProdWithClient) {
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Start server first, then initialize database schema in background
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`✅ Database: ${process.env.DB_HOST}`);
  console.log(
    `✅ Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
  );

  // Initialize database schema in background (non-blocking)
  initializeDatabaseSchema()
    .then(() => console.log("✅ Database schema initialization complete"))
    .catch((err) =>
      console.warn(
        "⚠️  Background schema initialization encountered an error:",
        err.message,
      ),
    );
});
// server started and background DB init kicked off

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Gracefully shutting down...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
