import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>settings</Text>

      {/* TEMP: Stripe practice entry point — remove after payment testing */}
      <Pressable
        onPress={() => router.push("/stripe-practice")}
        style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 12,
          backgroundColor: "#111111",
          alignSelf: "stretch",
          marginHorizontal: 24,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontWeight: "700",
            textAlign: "center",
          }}
        >
          Open Stripe Practice
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
});
