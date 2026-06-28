// BACKEND/controllers/authController.js

export async function registerUser(req, res) {
  res.status(200).json({
    success: true,
    message: "Register controller working.",
  });
}

export async function loginUser(req, res) {
  res.status(200).json({
    success: true,
    message: "Login controller working.",
  });
}

export async function getCurrentUser(req, res) {
  res.status(200).json({
    success: true,
    message: "Current user controller working.",
    user: req.user || null,
  });
}

export async function logoutUser(req, res) {
  res.status(200).json({
    success: true,
    message: "Logout controller working.",
  });
}