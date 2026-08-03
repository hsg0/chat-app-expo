// CHATAPP/src/app/stripe-practice.jsx
//
// WHAT:
// Runs a complete Stripe PaymentSheet practice payment.
//
// WHY:
// This screen mirrors the payment flow we will later use in DrAsk.
//
// FLOW:
// 1. Request a PaymentIntent from the authenticated backend.
// 2. Initialize Stripe PaymentSheet.
// 3. Present PaymentSheet.
// 4. Ask the backend for the application's payment status.
//
// IMPORTANT:
// PaymentSheet success is useful UI feedback, but the future Stripe webhook
// will be the final authority for payment success.

import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { usePaymentSheet } from "@stripe/stripe-react-native";

import { getToken } from "../api/authStorage";
import {
  createPracticePaymentIntent,
  getPracticePaymentStatus,
} from "../components/practicePayments/practicePaymentApi";

export default function StripePracticeScreen() {
  const { initPaymentSheet, presentPaymentSheet } = usePaymentSheet();

  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState(
    "Practice Premium Access costs $10.00 CAD."
  );

  const [paymentStatus, setPaymentStatus] = useState(null);

  async function handlePracticePayment() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setPaymentStatus(null);
    setMessage("Creating secure payment...");

    try {
      const token = await getToken();

      if (!token) {
        setMessage(
          "You must be logged in before making a practice payment."
        );
        return;
      }

      const idempotencyKey = Crypto.randomUUID();

      const createResponse = await createPracticePaymentIntent({
        token,
        idempotencyKey,
      });

      const paymentId = createResponse.payment.paymentId;
      const clientSecret = createResponse.paymentIntentClientSecret;

      const initializeResult = await initPaymentSheet({
        merchantDisplayName: "Chat App Stripe Practice",

        paymentIntentClientSecret: clientSecret,

        defaultBillingDetails: {
          email: createResponse.payment.userEmail,
        },

        allowsDelayedPaymentMethods: false,

        returnURL: "chatapp://stripe-redirect",
      });

      if (initializeResult.error) {
        throw new Error(
          initializeResult.error.message ||
            "Could not initialize PaymentSheet."
        );
      }

      setMessage("Opening Stripe PaymentSheet...");

      const presentResult = await presentPaymentSheet();

      if (presentResult.error) {
        if (presentResult.error.code === "Canceled") {
          setMessage("Payment was cancelled.");
          return;
        }

        throw new Error(
          presentResult.error.message ||
            "Payment could not be completed."
        );
      }

      setMessage(
        "Stripe accepted the payment. Checking backend status..."
      );

      const statusResponse = await getPracticePaymentStatus({
        token,
        paymentId,
      });

      setPaymentStatus(statusResponse.payment.status);
      setMessage("PaymentSheet completed successfully.");
    } catch (error) {
      console.error("[STRIPE PRACTICE SCREEN]", error);

      setMessage(error?.message || "The practice payment failed.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Stripe Practice</Text>

        <Text style={styles.productName}>Practice Premium Access</Text>

        <Text style={styles.price}>$10.00 CAD</Text>

        <Text style={styles.message}>{message}</Text>

        {paymentStatus ? (
          <Text style={styles.status}>Backend status: {paymentStatus}</Text>
        ) : null}

        <Pressable
          disabled={isLoading}
          onPress={handlePracticePayment}
          style={({ pressed }) => [
            styles.payButton,
            pressed && styles.buttonPressed,
            isLoading && styles.buttonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.payButtonText}>Pay $10.00 CAD</Text>
          )}
        </Pressable>

        <Pressable
          disabled={isLoading}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#F5F5F5",
  },

  card: {
    padding: 24,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },

  productName: {
    fontSize: 20,
    fontWeight: "600",
  },

  price: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
  },

  message: {
    fontSize: 16,
    lineHeight: 22,
    marginTop: 20,
  },

  status: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
  },

  payButton: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginTop: 28,
    backgroundColor: "#111111",
  },

  payButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  backButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.5,
  },
});
