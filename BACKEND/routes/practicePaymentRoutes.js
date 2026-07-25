// BACKEND/routes/practicePaymentRoutes.js
//
// WHAT:
// Defines authenticated payment routes for the practice Stripe integration.
//
// WHY:
// Routes should contain only URL definitions, middleware, and controller
// assignments. Payment business logic belongs in the controller.
//
// IMPORTANT:
// Every user payment route must be protected.
// The controller must use req.user.id and never req.body.userId.

import express from "express";

import {
  createPracticePaymentIntent,
  getPracticePaymentStatus,
} from "../controllers/practicePaymentController.js";

import {
  protectUser,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/practice/payments/create-intent
router.post(
  "/create-intent",
  protectUser,
  createPracticePaymentIntent
);

// GET /api/practice/payments/:paymentId/status
router.get(
  "/:paymentId/status",
  protectUser,
  getPracticePaymentStatus
);

export default router;