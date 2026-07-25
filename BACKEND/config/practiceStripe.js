// BACKEND/config/practiceStripe.js
// Creates and exports one reusable Stripe client for practice payments.
//
// WHY:
// Every controller should use the same configured Stripe client instead of
// creating a new Stripe instance for every request.
//
// IMPORTANT:
// STRIPE_SECRET_KEY must contain a sandbox key beginning with "sk_test_".
// Never place the Stripe secret key in the Expo frontend or commit it to Git.

import "dotenv/config";

import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "STRIPE_SECRET_KEY is missing. Add the Stripe sandbox secret key to the backend .env file.",
  );
}

if (!stripeSecretKey.startsWith("sk_test_")) {
  throw new Error(
    "Practice Stripe must use a sandbox secret key beginning with sk_test_.",
  );
}

const practiceStripe = new Stripe(stripeSecretKey);

export default practiceStripe;