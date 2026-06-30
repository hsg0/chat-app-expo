// BACKEND/middleware/authMiddleware.js

import jwt from "jsonwebtoken";

export function protectUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No authorization header provided.",
      });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format. Use Bearer token.",
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided.",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is missing on the server.",
      });
    }

    const decoded = jwt.verify(token, jwtSecret);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      handle: decoded.handle,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Not authorized. Token is invalid or expired.",
    });
  }
}