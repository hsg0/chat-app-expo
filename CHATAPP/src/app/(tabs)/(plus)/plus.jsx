import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function PlusEntryScreen() {
  const router = useRouter();

  function openPlusSubTabs() {
    router.push("/(tabs)/(plus)/(tabs)/(home)/home");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Plus Section</Text>
        <Text style={styles.subtitle}>
          Open your secondary tabs: home, cart, add, favorites, and profile.
        </Text>

        <Pressable style={styles.button} onPress={openPlusSubTabs}>
          <Text style={styles.buttonText}>Open Plus Tabs</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF6FF",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    marginBottom: 28,
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    maxWidth: 360,
  },
  button: {
    minHeight: 62,
    width: "100%",
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
