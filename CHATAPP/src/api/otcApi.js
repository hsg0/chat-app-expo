//
// WHAT:
// Connects the ChatApp frontend to the Health Canada OTC backend routes.
//
// WHY:
// Keeps all OTC network requests in one simple place.
//
// HOW:
// Uses the existing EXPO_PUBLIC_API_URL value from the frontend .env file.
//

import axios from "axios";

const backendApiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!backendApiUrl) {
  throw new Error(
    "Missing EXPO_PUBLIC_API_URL in the CHATAPP .env file."
  );
}

export async function getOtcProducts(page = 1, limit = 20) {
  const response = await axios.get(`${backendApiUrl}/api/mobile/otc/products`, {
    params: {
      page,
      limit,
    },
  });

  return response.data;
}

export async function searchOtcProducts(searchText, page = 1, limit = 20) {
  const response = await axios.get(
    `${backendApiUrl}/api/mobile/otc/products/search`,
    {
      params: {
        q: searchText,
        page,
        limit,
      },
    }
  );

  return response.data;
}

export async function getOtcProductByDin(din) {
  const response = await axios.get(
    `${backendApiUrl}/api/mobile/otc/products/${din}`
  );

  return response.data;
}
