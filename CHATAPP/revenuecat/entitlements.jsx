// WHAT:
// Checks whether the current RevenueCat customer has full paid access.
//
// IMPORTANT:
// This is useful for frontend display and navigation.
// The backend must still enforce protected API access.

import Purchases from "react-native-purchases";

import { configureRevenueCat } from "./revenuecat";

export const FULL_APP_ACCESS_ENTITLEMENT_ID = "full_app_access";

export async function hasActiveRevenueCatEntitlement(
  entitlementIdentifier = FULL_APP_ACCESS_ENTITLEMENT_ID
) {
  try {
    const revenueCatIsConfigured = configureRevenueCat();

    if (!revenueCatIsConfigured) {
      return false;
    }

    const customerInfo = await Purchases.getCustomerInfo();

    const activeEntitlement =
      customerInfo.entitlements.active[entitlementIdentifier];

    return Boolean(activeEntitlement);
  } catch (error) {
    console.error("Unable to check RevenueCat entitlement:", error);

    return false;
  }
}

export async function getRevenueCatAccessDetails() {
  try {
    const revenueCatIsConfigured = configureRevenueCat();

    if (!revenueCatIsConfigured) {
      return {
        hasPaidAccess: false,
        activeProductIdentifier: null,
        expirationDate: null,
      };
    }

    const customerInfo = await Purchases.getCustomerInfo();

    const activeEntitlement =
      customerInfo.entitlements.active[FULL_APP_ACCESS_ENTITLEMENT_ID];

    if (!activeEntitlement) {
      return {
        hasPaidAccess: false,
        activeProductIdentifier: null,
        expirationDate: null,
      };
    }

    return {
      hasPaidAccess: true,
      activeProductIdentifier: activeEntitlement.productIdentifier ?? null,
      expirationDate: activeEntitlement.expirationDate ?? null,
    };
  } catch (error) {
    console.error("Unable to load RevenueCat access details:", error);

    return {
      hasPaidAccess: false,
      activeProductIdentifier: null,
      expirationDate: null,
    };
  }
}
