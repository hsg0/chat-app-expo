// BACKEND/routes/authRouter.js

import express from "express";

import {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../controllers/authController.js";

import { protectUser } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

/*
  Base route in server.js:

  app.use("/api/auth", authRouter);

  Final routes become:

  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/logout
  GET  /api/auth/me
*/

// public routes
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

// protected routes
authRouter.post("/logout", protectUser, logoutUser);
authRouter.get("/me", protectUser, getCurrentUser);

// quick test route
authRouter.get("/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Auth router is working.",
  });
});

export default authRouter;