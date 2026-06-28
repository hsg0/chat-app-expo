import React from "react";
import {
  Text,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

export default function Index() {
  function handleAuthPress() {
    router.push("/(auth)");
  }

  return (
    <View style={styles.container}>
      <SafeAreaView className="flex-1 w-full">
        <KeyboardAvoidingView style={styles.content}>
          <Text className="text-3xl font-black text-black">
            Welcome to the app!
          </Text>

          <Pressable
            className="mt-6 rounded-2xl bg-blue-500 px-6 py-4"
            onPress={() => {
              console.log("routing to authentication screen");
              handleAuthPress();
            }}
          >
            <Text className="font-bold text-white">
              Press me to continue
            </Text>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
});