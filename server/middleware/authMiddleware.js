const jwt = require("jsonwebtoken");
require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("❌ CRITICAL: JWT_SECRET is not set in environment variables");
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    console.warn("[AUTH] Token verification failed:", err.message);
    return res
      .status(401)
      .json({ message: "Token is not valid or has expired" });
  }
};

const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    const role = req.user?.role || req.userRole;

    if (!role || !allowedRoles.includes(role)) {
      return res
        .status(403)
        .json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };

module.exports = { authMiddleware, requireRole };
