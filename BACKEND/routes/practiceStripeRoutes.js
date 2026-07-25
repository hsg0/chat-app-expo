// BACKEND/routes/practiceStripeRoutes.js
// Defines HTTP routes for the Stripe practice integration.
//
// Routes should remain small.
// They connect a URL and HTTP method to a controller function.
// Stripe business logic belongs in practiceStripeController.js.

import express from "express";

import {
  testPracticeStripeConnection,
} from "../controllers/practiceStripeController.js";

const router = express.Router();

// GET /api/practice/stripe/connection-test
router.get("/connection-test", testPracticeStripeConnection);

export default router;