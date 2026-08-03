// CHATAPP/src/app/_layout.jsx
//
// WHAT:
// Provides application-wide services including Redux and Stripe.
//
// WHY:
// StripeProvider initializes Stripe once for every payment screen.
//
// IMPORTANT:
// Only the Stripe publishable key belongs in the frontend.
// Never place STRIPE_SECRET_KEY or an sk_test key here.

import "../../global.css";

import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { StripeProvider } from "@stripe/stripe-react-native";

import store from "../reduxSetup/store";
import RevenueCatProvider from "../../revenuecat/revenuecat";

SplashScreen.preventAutoHideAsync();

const stripePublishableKey =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error(
    "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing from the Expo .env file."
  );
}

if (!stripePublishableKey.startsWith("pk_test_")) {
  throw new Error(
    "The practice app must use a Stripe sandbox publishable key beginning with pk_test_."
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Provider store={store}>
      <StripeProvider
        publishableKey={stripePublishableKey}
        merchantIdentifier="merchant.com.practice.chatapp"
      >
        <RevenueCatProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />

              <Stack.Screen
                name="chat"
                options={{
                  animation: "slide_from_right",
                }}
              />

              <Stack.Screen
                name="stripe-practice"
                options={{
                  animation: "slide_from_right",
                }}
              />
            </Stack>

            <StatusBar style="dark" />
          </GestureHandlerRootView>
        </RevenueCatProvider>
      </StripeProvider>
    </Provider>
  );
}
