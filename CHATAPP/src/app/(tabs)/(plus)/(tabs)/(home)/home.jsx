import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function PlusHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>plus home</Text>
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
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
});
