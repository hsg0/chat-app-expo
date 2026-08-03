// BACKEND/controllers/practicePaymentController.js
//
// WHAT:
// Handles authenticated payment operations for the Stripe practice project.
//
// WHY:
// Payment routes should not contain business logic.
// This controller validates the product, creates the MongoDB payment record,
// creates the Stripe PaymentIntent, and returns safe payment information.
//
// HOW:
// The authenticated user comes from req.user.
// The frontend sends only a product code and an idempotency key.
// The backend controls the price, currency, product name, and Stripe product.
//
// IMPORTANT:
// Never trust an amount, currency, Stripe ID, status, or user ID supplied by
// the frontend.

import crypto from "crypto";

import practiceStripe from "../config/practiceStripe.js";
import PracticePayment from "../models/practicePaymentModel.js";

const PRACTICE_PRODUCT = {
  productCode: "practice_premium_access",
  productName: "Practice Premium Access",
  amount: 1000,
  currency: "cad",
  stripeProductId: "prod_UwvyEsRql5nrYJ",
};

// Convert Stripe's PaymentIntent status into one of our permitted statuses.
function mapStripePaymentStatus(stripeStatus) {
  const allowedStatuses = new Set([
    "requires_payment_method",
    "requires_confirmation",
    "requires_action",
    "processing",
    "succeeded",
    "cancelled",
  ]);

  if (allowedStatuses.has(stripeStatus)) {
    return stripeStatus;
  }

  return "payment_intent_created";
}

// Return only information that is safe and useful to the frontend.
function buildSafePayment(payment) {
  return {
    paymentId: payment.paymentId,
    userEmail: payment.userEmail,
    productCode: payment.productCode,
    productName: payment.productName,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    webhookConfirmed: payment.webhookConfirmed,
    paidAt: payment.paidAt,
    failedAt: payment.failedAt,
    cancelledAt: payment.cancelledAt,
    refundedAt: payment.refundedAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

// POST /api/practice/payments/create-intent
export async function createPracticePaymentIntent(req, res) {
  let payment = null;

  try {
    const authenticatedUserId = req.user?.id;
    const authenticatedUserEmail = req.user?.email;

    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    if (!authenticatedUserEmail) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user email is missing.",
      });
    }

    const productCode = String(
      req.body?.productCode || ""
    )
      .trim()
      .toLowerCase();

    if (!productCode) {
      return res.status(400).json({
        success: false,
        message: "Product code is required.",
      });
    }

    if (productCode !== PRACTICE_PRODUCT.productCode) {
      return res.status(400).json({
        success: false,
        message: "The selected payment product is invalid.",
      });
    }

    const idempotencyKey = String(
      req.headers["idempotency-key"] || ""
    ).trim();

    if (!idempotencyKey) {
      return res.status(400).json({
        success: false,
        message:
          "Idempotency-Key header is required.",
      });
    }

    if (idempotencyKey.length < 16) {
      return res.status(400).json({
        success: false,
        message:
          "Idempotency-Key must be at least 16 characters.",
      });
    }

    if (idempotencyKey.length > 200) {
      return res.status(400).json({
        success: false,
        message:
          "Idempotency-Key cannot exceed 200 characters.",
      });
    }

    // If the same request is sent again, return the existing payment instead
    // of creating another MongoDB record or Stripe PaymentIntent.
    const existingPayment =
      await PracticePayment.findOne({
        idempotencyKey,
        user: authenticatedUserId,
      });

    if (existingPayment) {
      if (!existingPayment.stripePaymentIntentId) {
        return res.status(409).json({
          success: false,
          message:
            "This payment request already exists but is incomplete.",
          payment: buildSafePayment(existingPayment),
        });
      }

      const existingPaymentIntent =
        await practiceStripe.paymentIntents.retrieve(
          existingPayment.stripePaymentIntentId
        );

      return res.status(200).json({
        success: true,
        message:
          "Existing payment intent returned.",
        reusedPayment: true,
        payment: buildSafePayment(existingPayment),

        // The client secret is returned to the authenticated mobile client,
        // but it is never stored in MongoDB.
        paymentIntentClientSecret:
          existingPaymentIntent.client_secret,
      });
    }

    const paymentId = crypto.randomUUID();

    payment = await PracticePayment.create({
      paymentId,
      user: authenticatedUserId,
      userEmail: authenticatedUserEmail,
      productCode: PRACTICE_PRODUCT.productCode,
      productName: PRACTICE_PRODUCT.productName,
      amount: PRACTICE_PRODUCT.amount,
      currency: PRACTICE_PRODUCT.currency,
      stripeProductId:
        PRACTICE_PRODUCT.stripeProductId,
      idempotencyKey,
      status: "created",
    });

    const paymentIntent =
      await practiceStripe.paymentIntents.create(
        {
          amount: PRACTICE_PRODUCT.amount,
          currency: PRACTICE_PRODUCT.currency,

          // PaymentSheet can decide which payment methods are available.
          automatic_payment_methods: {
            enabled: true,
          },

          description:
            PRACTICE_PRODUCT.productName,

          receipt_email:
            authenticatedUserEmail,

          metadata: {
            paymentId,
            applicationUserId:
              authenticatedUserId,
            productCode:
              PRACTICE_PRODUCT.productCode,
            environment: "practice",
          },
        },
        {
          idempotencyKey,
        }
      );

    payment.stripePaymentIntentId =
      paymentIntent.id;

    payment.status = mapStripePaymentStatus(
      paymentIntent.status
    );

    await payment.save();

    return res.status(201).json({
      success: true,
      message:
        "Practice payment intent created successfully.",
      reusedPayment: false,
      payment: buildSafePayment(payment),
      paymentIntentClientSecret:
        paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(
      "[PRACTICE PAYMENT] Create intent failed:",
      error?.message || error
    );

    if (
      payment &&
      payment.status === "created"
    ) {
      payment.status = "failed";
      payment.failureCode =
        error?.code || "payment_intent_creation_failed";
      payment.failureMessage =
        error?.message ||
        "Stripe PaymentIntent creation failed.";
      payment.failedAt = new Date();

      try {
        await payment.save();
      } catch (saveError) {
        console.error(
          "[PRACTICE PAYMENT] Could not save failed payment:",
          saveError?.message || saveError
        );
      }
    }

    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This payment request has already been submitted.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Could not create the practice payment.",
    });
  }
}

// GET /api/practice/payments/:paymentId/status
export async function getPracticePaymentStatus(
  req,
  res
) {
  try {
    const authenticatedUserId = req.user?.id;
    const paymentId = String(
      req.params?.paymentId || ""
    ).trim();

    if (!authenticatedUserId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required.",
      });
    }

    const payment =
      await PracticePayment.findOne({
        paymentId,
        user: authenticatedUserId,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    // Refresh non-terminal status from Stripe until webhooks are wired.
    if (
      payment.stripePaymentIntentId &&
      !["succeeded", "failed", "cancelled", "refunded"].includes(
        payment.status
      )
    ) {
      try {
        const paymentIntent =
          await practiceStripe.paymentIntents.retrieve(
            payment.stripePaymentIntentId
          );

        const mappedStatus = mapStripePaymentStatus(paymentIntent.status);

        if (mappedStatus !== payment.status) {
          payment.status = mappedStatus;

          if (mappedStatus === "succeeded" && !payment.paidAt) {
            payment.paidAt = new Date();
          }

          if (mappedStatus === "cancelled" && !payment.cancelledAt) {
            payment.cancelledAt = new Date();
          }

          await payment.save();
        }
      } catch (stripeError) {
        console.error(
          "[PRACTICE PAYMENT] Could not refresh PaymentIntent status:",
          stripeError?.message || stripeError
        );
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Payment status loaded successfully.",
      payment: buildSafePayment(payment),
    });
  } catch (error) {
    console.error(
      "[PRACTICE PAYMENT] Get status failed:",
      error?.message || error
    );

    return res.status(500).json({
      success: false,
      message:
        "Could not load the payment status.",
    });
  }
}