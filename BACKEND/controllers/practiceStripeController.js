// BACKEND/controllers/practiceStripeController.js
// Contains controller functions for the Stripe practice integration.
//
// This first controller only verifies that:
// 1. The backend loaded the Stripe sandbox secret key.
// 2. The backend can communicate with Stripe.
// 3. The expected practice product exists.
//
// It does not create a payment or modify Stripe data.

import practiceStripe from "../config/practiceStripe.js";

const PRACTICE_PRODUCT_NAME = "Practice Premium Access";

// GET /api/practice/stripe/connection-test
export async function testPracticeStripeConnection(req, res) {
  try {
    const products = await practiceStripe.products.list({
      active: true,
      limit: 100,
    });

    const practiceProduct = products.data.find(
      (product) => product.name === PRACTICE_PRODUCT_NAME,
    );

    return res.status(200).json({
      success: true,
      message: "Stripe sandbox connection successful.",
      practiceProductFound: Boolean(practiceProduct),
      practiceProduct: practiceProduct
        ? {
            stripeProductId: practiceProduct.id,
            name: practiceProduct.name,
            description: practiceProduct.description,
            active: practiceProduct.active,
          }
        : null,
    });
  } catch (error) {
    console.error(
      "[PRACTICE STRIPE] Connection test failed:",
      error?.message || error,
    );

    return res.status(500).json({
      success: false,
      message: "Could not connect to the Stripe sandbox.",
    });
  }
}