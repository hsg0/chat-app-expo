// BACKEND/routes/authRouter.js

import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getUsers,
  searchUsers,
  updateProfile,
} from "../controllers/authController.js";

import { protectUser } from "../middleware/authMiddleware.js";
import multerLoader from "../config/multer.js";

const authRouter = express.Router();

// quick test route
authRouter.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth router is working.",
  });
});

// public routes
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

// protected auth routes
authRouter.post("/logout", protectUser, logoutUser);
authRouter.get("/me", protectUser, getCurrentUser);

// protected user routes
authRouter.get("/users", protectUser, getUsers);
authRouter.get("/users/search", protectUser, searchUsers);

// protected profile route with avatar upload
authRouter.put(
  "/profile",
  protectUser,
  multerLoader.single("avatar"),
  updateProfile
);

export default authRouter;