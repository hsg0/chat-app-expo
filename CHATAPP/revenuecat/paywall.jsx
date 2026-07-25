// WHAT:
// Opens the RevenueCat paywall configured in the dashboard.
//
// RETURNS:
// true when a purchase or restoration gives the customer access.
// false when the paywall is cancelled, unavailable, or fails.

import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

import { configureRevenueCat } from "./revenuecat";

export async function presentRevenueCatPaywall() {
  try {
    const revenueCatIsConfigured = configureRevenueCat();

    if (!revenueCatIsConfigured) {
      return false;
    }

    const paywallResult = await RevenueCatUI.presentPaywall();

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;

      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.CANCELLED:
      case PAYWALL_RESULT.ERROR:
      default:
        return false;
    }
  } catch (error) {
    console.error("Unable to present RevenueCat paywall:", error);

    return false;
  }
}
