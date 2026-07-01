import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function ChatIndexScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Home</Text>

      <Text style={styles.text}>
        This is the /chat route. Open a chat by ID.
      </Text>

      <Pressable style={styles.button} onPress={() => router.push("/chat/1")}>
        <Text style={styles.buttonText}>Open Test Chat 1</Text>
      </Pressable>

      <Pressable style={styles.button} onPress={() => router.push("/chat/2")}>
        <Text style={styles.buttonText}>Open Test Chat 2</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#EAF6FF",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#111827",
  },

  text: {
    marginTop: 12,
    marginBottom: 24,
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },

  button: {
    width: "100%",
    maxWidth: 320,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
});