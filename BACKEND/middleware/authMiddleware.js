// BACKEND/middleware/authMiddleware.js

export function protectUser(req, res, next) {
  // Temporary placeholder.
  // Later this will verify JWT token.
  req.user = {
    id: "temporary-user-id",
    role: "user",
  };

  next();
}