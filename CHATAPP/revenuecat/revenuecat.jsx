import { useEffect } from "react";
import { NativeModules, Platform } from "react-native";
import PurchasesModule, { LOG_LEVEL } from "react-native-purchases";

const Purchases = PurchasesModule?.default ?? PurchasesModule;

let isRevenueCatConfigured = false;

export function configureRevenueCat() {
  if (isRevenueCatConfigured) {
    return true;
  }

  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return false;
  }

  if (!Purchases || typeof Purchases.configure !== "function") {
    console.error(
      "RevenueCat configuration failed: Purchases module is unavailable. Rebuild the native app after installing react-native-purchases."
    );
    return false;
  }

  if (!NativeModules.RNPurchases) {
    console.error(
      "RevenueCat configuration failed: native module RNPurchases was not found. Run a fresh native rebuild (npx expo run:android / npx expo run:ios)."
    );
    return false;
  }

  const revenueCatApiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;

  if (!revenueCatApiKey) {
    console.error(
      "RevenueCat configuration failed: EXPO_PUBLIC_REVENUECAT_API_KEY is missing."
    );
    return false;
  }

  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    } else {
      Purchases.setLogLevel(LOG_LEVEL.ERROR);
    }

    Purchases.configure({
      apiKey: revenueCatApiKey,
    });

    isRevenueCatConfigured = true;
    console.log("RevenueCat configured successfully.");
    return true;
  } catch (error) {
    console.error("RevenueCat configuration failed:", error);
    return false;
  }
}

export default function RevenueCatProvider({ children }) {
  useEffect(() => {
    configureRevenueCat();
  }, []);

  return children;
}
