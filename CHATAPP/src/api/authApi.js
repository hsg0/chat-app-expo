// CHATAPP/src/api/authApi.js

import apiClient from "./apiClient";

export async function registerUserApi({ name, email, password }) {
  const response = await apiClient.post("/api/auth/register", {
    name,
    email,
    password,
  });

  return response.data;
}

export async function loginUserApi({ email, password }) {
  const response = await apiClient.post("/api/auth/login", {
    email,
    password,
  });

  return response.data;
}

export async function getCurrentUserApi(token) {
  const response = await apiClient.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}