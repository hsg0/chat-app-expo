// CHATAPP/src/api/profileApi.js

import apiClient from "./apiClient";

export async function updateProfileApi({
  token,
  name,
  handle,
  bio,
  avatar,
}) {
  const response = await apiClient.put(
    "/api/auth/profile",
    {
      name,
      handle,
      bio,
      avatar,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}