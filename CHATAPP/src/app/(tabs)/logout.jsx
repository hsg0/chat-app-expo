import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import apiClient from "../../api/apiClient";
import { getToken, removeToken } from "../../api/authStorage";

const Logout = () => {
  const router = useRouter();

  const [message, setMessage] = useState("Logging out...");

  useEffect(() => {
    handleLogout();
  }, []);

  async function handleLogout() {
    try {
      const token = await getToken();

      if (token) {
        await apiClient.post(
          "/api/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      await removeToken();

      setMessage("Logged out.");

      router.replace("/(auth)");
    } catch (error) {
      console.log("Logout error:", error);

      // Even if backend logout fails, remove local token.
      await removeToken();

      setMessage("Logged out locally.");

      router.replace("/(auth)");
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#111827" />

      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

export default Logout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF6FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  text: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
});