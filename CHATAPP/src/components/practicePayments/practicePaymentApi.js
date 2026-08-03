// CHATAPP/src/components/practicePayments/practicePaymentApi.js
//
// WHAT:
// Sends authenticated payment requests to the practice backend.
//
// WHY:
// Payment screens should not contain networking details.
//
// IMPORTANT:
// The token comes from SecureStore via getToken() / authStorage.
// The frontend sends only the product code.
// Amount and currency are controlled by the backend.

const backendUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  process.env.EXPO_PUBLIC_API_URL;

if (!backendUrl) {
  throw new Error(
    "EXPO_PUBLIC_BACKEND_URL (or EXPO_PUBLIC_API_URL) is missing from the Expo .env file."
  );
}

function buildApiErrorMessage(responseBody, fallbackMessage) {
  if (
    responseBody &&
    typeof responseBody.message === "string" &&
    responseBody.message.trim()
  ) {
    return responseBody.message;
  }

  return fallbackMessage;
}

export async function createPracticePaymentIntent({
  token,
  idempotencyKey,
}) {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  if (!idempotencyKey) {
    throw new Error("Payment idempotency key is missing.");
  }

  const response = await fetch(
    `${backendUrl}/api/practice/payments/create-intent`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Idempotency-Key": idempotencyKey,
      },

      body: JSON.stringify({
        productCode: "practice_premium_access",
      }),
    }
  );

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(
      buildApiErrorMessage(responseBody, "Could not create the payment.")
    );
  }

  if (!responseBody.paymentIntentClientSecret) {
    throw new Error(
      "The backend did not return a PaymentIntent client secret."
    );
  }

  return responseBody;
}

export async function getPracticePaymentStatus({ token, paymentId }) {
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  if (!paymentId) {
    throw new Error("Payment ID is missing.");
  }

  const response = await fetch(
    `${backendUrl}/api/practice/payments/${paymentId}/status`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(
      buildApiErrorMessage(
        responseBody,
        "Could not load the payment status."
      )
    );
  }

  return responseBody;
}
