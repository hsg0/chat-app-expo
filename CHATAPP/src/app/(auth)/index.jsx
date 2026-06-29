import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import chatapp from "../../../assets/images/chatapp.png";
import { Button } from "expo-router/build/react-navigation";

const logo = chatapp;

const AuthIndex = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  const [mode, setMode] = useState("login"); // login or register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    console.log("Auth index component mounted");
  }, []);

  const clearError = () => {
    setError(null);
  };

  const clearForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setVerificationCode("");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    clearError();
    clearForm();
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        setError("Please enter your email.");
        return;
      }

      if (!password) {
        setError("Please enter your password.");
        return;
      }

      console.log("Logging in user:", {
        email: cleanEmail,
        password,
      });

      // Later this will call your backend:
      // POST http://localhost:5020/api/auth/login

      // Example future payload:
      // const response = await fetch(`${API_URL}/api/auth/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: cleanEmail,
      //     password,
      //   }),
      // });

      router.replace("/(tabs)");
    } catch (error) {
      console.log("Login error:", error);
      setError("Something went wrong while logging in.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError(null);

      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanName) {
        setError("Please enter your name.");
        return;
      }

      if (!cleanEmail) {
        setError("Please enter your email.");
        return;
      }

      if (!password) {
        setError("Please enter your password.");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      console.log("Registering user:", {
        name: cleanName,
        email: cleanEmail,
        password,
      });

      // Later this will call your backend:
      // POST http://localhost:5020/api/auth/register

      // Example future payload:
      // const response = await fetch(`${API_URL}/api/auth/register`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     name: cleanName,
      //     email: cleanEmail,
      //     password,
      //   }),
      // });

      router.replace("/(tabs)");
    } catch (error) {
      console.log("Register error:", error);
      setError("Something went wrong while creating your account.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "login") {
      handleLogin();
      return;
    }

    handleRegister();
  };

  const buttonTitle = loading
    ? "Please wait..."
    : mode === "login"
      ? "Login"
      : "Create Account";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Box */}
          <View style={styles.logoBox}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.title}>Login or Register</Text>

          <Text style={styles.subtitle}>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </Text>

          <Text style={styles.subtitle}>
            {mode === "login"
              ? "Please enter your credentials to login."
              : "Please fill in the details to create an account."}
          </Text>

          {/* Form Box */}
          <View style={styles.formBox}>
            {mode === "register" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    clearError();
                  }}
                  placeholder="Enter your name"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError();
                }}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError();
                }}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                secureTextEntry={true}
                autoCapitalize="none"
              />
            </View>

            {mode === "register" && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    clearError();
                  }}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
              </View>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
            >
              <Text style={styles.submitButtonText}>{buttonTitle}</Text>
            </Pressable>
          </View>

          {/* Switch Login/Register */}
          <View style={styles.switchBox}>
            {mode === "register" && (
              <Text style={styles.subtitle}>
                Already have an account?{" "}
                <Button className="bg-green-600 rounded-lg pt-2">
                <Text
                  style={styles.switchText}
                  onPress={() => switchMode("login")}
                >
                  Login
                </Text>
                </Button>
              </Text>
            )}

            {mode === "login" && (
              <Text style={styles.subtitle}>
                {"Don't have an account? "}
                <Button className="bg-green-600 rounded-lg pt-2">
                <Text
                  style={styles.switchText}
                  onPress={() => switchMode("register")}
                >
                  Register
                </Text>
                </Button>
              </Text>
            )}
          </View>
          <Button className="bg-green-600 rounded-lg pt-2">
          <Text
            style={styles.switchText}
            onPress={() => router.push("/(auth)/resetpassword")}
          >
            Forgot Password?
          </Text>
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthIndex;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF6FF",
  },

  keyboardView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,

    borderWidth: 2,
    borderColor: "#16A34A",
  },

  logoBox: {
    width: 150,
    height: 150,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    backgroundColor: "#FFFFFF",
  },

  logo: {
    width: 120,
    height: 120,
  },

  title: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
    color: "#000000",
  },

  subtitle: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 16,
    color: "#6B7280",
  },

  formBox: {
    width: "100%",
    maxWidth: 420,
    marginTop: 24,
  },

  inputGroup: {
    marginBottom: 14,
  },

  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  input: {
    width: "100%",
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#111827",
  },

  errorText: {
    marginTop: 4,
    marginBottom: 12,
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  submitButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  submitButtonDisabled: {
    opacity: 0.6,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  switchBox: {
    marginTop: 16,
  },

  switchText: {
    color: "#16A34A",
    fontWeight: "800",
  },
});