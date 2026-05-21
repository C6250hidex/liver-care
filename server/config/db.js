const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

// Validate required environment variables
const requiredEnv = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
const missingEnv = requiredEnv.filter((v) => !process.env[v]);
if (missingEnv.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnv.join(", ")}`,
  );
  process.exit(1);
}

// Create a connection pool with optimized settings for Aiven
// Build SSL config if a CA is provided (either as a file path or base64 string)
let sslOption = undefined;
if (process.env.DB_CA_PATH) {
  try {
    const ca = fs.readFileSync(process.env.DB_CA_PATH, "utf8");
    sslOption = {
      ca,
      rejectUnauthorized: process.env.NODE_ENV === "production",
    };
    console.log("✅ Loaded DB CA from path");
  } catch (err) {
    console.warn("⚠️  Could not read DB_CA_PATH:", err.message);
  }
} else if (process.env.DB_CA_BASE64) {
  try {
    const ca = Buffer.from(process.env.DB_CA_BASE64, "base64").toString("utf8");
    sslOption = {
      ca,
      rejectUnauthorized: process.env.NODE_ENV === "production",
    };
    console.log("✅ Loaded DB CA from base64 env");
  } catch (err) {
    console.warn("⚠️  Could not decode DB_CA_BASE64:", err.message);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10"),
  queueLimit: 0,
  enableKeepAlive: true,

  // ⏱️ Timeouts
  connectTimeout: 10000, // 10 seconds to connect

  // 🔒 SSL Configuration for Aiven (use sslOption if available, otherwise use boolean flag)
  ssl:
    sslOption !== undefined
      ? sslOption
      : process.env.DB_SSL !== "false"
        ? { rejectUnauthorized: process.env.NODE_ENV === "production" }
        : false,

  // 📋 Connection Settings
  charset: "utf8mb4",
  timezone: "Z",
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ Database Pool Error:", err.code, err.message);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Database connection was closed.");
  }
  if (err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
    console.error("Fatal error encountered during query.");
  }
  if (err.code === "PROTOCOL_ENQUEUE_AFTER_QUIT") {
    console.error("Connection was terminated.");
  }
});

pool.on("connection", (connection) => {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `✅ New database connection established (ID: ${connection.threadId})`,
    );
  }
});

// Export the promise-based pool so we can use async/await
const db = pool.promise();

// Test connection with retry logic
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await db.getConnection();
      await connection.ping();
      connection.release();
      console.log("✅ Database connection successful");
      return true;
    } catch (err) {
      console.warn(
        `⚠️  Database connection attempt ${i + 1}/${retries} failed: ${err.message}`,
      );
      if (i < retries - 1) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
        console.log(`   Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.error(
    "❌ Failed to connect to database after " + retries + " attempts",
  );
  return false;
}

// Test connection on startup (non-blocking)
testConnection(3).then((success) => {
  if (!success && process.env.NODE_ENV === "production") {
    console.error(
      "⚠️  WARNING: Database may not be accessible. Continuing anyway...",
    );
  }
});

module.exports = db;
