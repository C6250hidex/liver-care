const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/notificationService");

/**
 * 1. Register User
 */
exports.register = async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;
    const allowedRoles = ["patient", "doctor"];
    const normalizedEmail = email?.trim().toLowerCase();
    const userRole = allowedRoles.includes(role) ? role : "patient";
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationToken = crypto.randomBytes(32).toString("hex");

    if (!fullname || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const [existing] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail],
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.execute(
      "INSERT INTO users (fullname, email, password, role, verification_token) VALUES (?, ?, ?, ?, ?)",
      [
        fullname.trim(),
        normalizedEmail,
        hashedPassword,
        userRole,
        verificationToken,
      ],
    );

    const emailEnabled = Boolean(
      process.env.BREVO_API_KEY && process.env.SENDER_EMAIL,
    );
    if (!emailEnabled) {
      await db.execute(
        "UPDATE users SET is_verified = 1, verification_token = NULL WHERE email = ?",
        [normalizedEmail],
      );
    }

    const verifyURL = `${clientUrl.replace(/\/+$/, "")}/#/verify-email/${verificationToken}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #0284C7; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">LiverCare AI</h1>
          </div>
          <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
              <h2>Confirm Your Email</h2>
              <p>Hello ${fullname.trim()},</p>
              <p>Please verify your account by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verifyURL}" style="background-color: #0284C7; color: white; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: bold;">Verify My Account</a>
              </div>
          </div>
      </div>`;

    let emailSent = true;
    if (emailEnabled) {
      try {
        await sendEmail(
          normalizedEmail,
          "Verify your LiverCare Account",
          emailHtml,
        );
      } catch (err) {
        console.warn("Email delivery warning:", err.message);
        emailSent = false;
      }
    } else {
      emailSent = false;
      console.warn(
        "Email verification disabled: BREVO_API_KEY or SENDER_EMAIL not configured.",
      );
    }

    const message = emailSent
      ? "Verification email sent!"
      : "Account created. Verification email could not be delivered.";

    const responsePayload = { message };
    if (!emailSent && process.env.NODE_ENV !== "production") {
      responsePayload.verificationLink = verifyURL;
    }

    return res.status(201).json(responsePayload);
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/**
 * 2. Login User
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const [users] = await db.execute("SELECT * FROM users WHERE email = ?", [
      normalizedEmail,
    ]);
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Verification Check
    if (!user.is_verified) {
      return res
        .status(403)
        .json({ message: "Please verify your email address first." });
    }
    if (!user.is_active) {
      return res
        .status(403)
        .json({ message: "This account has been locked. Contact support." });
    }

    // Password Check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

/**
 * 3. Verify Email
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res
        .status(400)
        .json({ message: "Verification token is required" });
    }

    const [users] = await db.execute(
      "SELECT id, is_verified FROM users WHERE verification_token = ?",
      [token],
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "Invalid or expired verification link" });
    }

    const user = users[0];

    if (user.is_verified) {
      return res
        .status(200)
        .json({ message: "Email already verified. You can log in." });
    }

    await db.execute(
      "UPDATE users SET is_verified = 1, verification_token = NULL WHERE id = ?",
      [user.id],
    );

    res
      .status(200)
      .json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(500).json({ message: "Server error during email verification" });
  }
};
