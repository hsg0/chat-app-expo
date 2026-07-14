import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function CallsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>calls</Text>
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
