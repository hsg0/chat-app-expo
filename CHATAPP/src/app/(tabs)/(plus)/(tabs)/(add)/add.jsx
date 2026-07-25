import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { getToken } from "../../../../../api/authStorage";
import { socket } from "../../../../../socketsSetup/socket";

const QUICK_ROOMS = [
  { id: "plus-general", label: "Plus General" },
  { id: "plus-support", label: "Plus Support" },
  { id: "plus-otc", label: "OTC Help" },
];

export default function PlusAddScreen() {
  const router = useRouter();

  const [roomId, setRoomId] = useState("plus-general");
  const [connectionStatus, setConnectionStatus] = useState(
    socket.connected ? "connected" : "disconnected"
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOpeningChat, setIsOpeningChat] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const handleConnect = () => {
      if (!isMounted) {
        return;
      }

      setConnectionStatus("connected");
      setIsConnecting(false);
      setStatusMessage("Socket connected. Pick a room to chat.");
    };

    const handleDisconnect = () => {
      if (!isMounted) {
        return;
      }

      setConnectionStatus("disconnected");
      setIsConnecting(false);
      setStatusMessage("Socket disconnected.");
    };

    const handleConnectError = (error) => {
      if (!isMounted) {
        return;
      }

      setConnectionStatus("error");
      setIsConnecting(false);
      setStatusMessage(error?.message || "Unable to connect to chat socket.");
    };

    const connectSocket = async () => {
      const token = await getToken();

      if (!isMounted) {
        return;
      }

      if (!token) {
        setConnectionStatus("error");
        setStatusMessage("Sign in to use live chat.");
        return;
      }

      setIsConnecting(true);
      setConnectionStatus("connecting");
      setStatusMessage("Connecting to chat...");

      socket.auth = { token };

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);

      if (socket.connected) {
        handleConnect();
        return;
      }

      socket.connect();
    };

    connectSocket();

    return () => {
      isMounted = false;
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  const openChatRoom = async (selectedRoomId) => {
    const cleanRoomId = String(selectedRoomId || "").trim();

    if (!cleanRoomId) {
      setStatusMessage("Enter a room name to start chatting.");
      return;
    }

    if (!socket.connected) {
      setStatusMessage("Wait for the socket to connect, then try again.");
      return;
    }

    try {
      setIsOpeningChat(true);
      socket.emit("join-room", cleanRoomId);
      router.push(`/chat/${encodeURIComponent(cleanRoomId)}`);
    } finally {
      setIsOpeningChat(false);
    }
  };

  const isReady = connectionStatus === "connected";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Live Chat</Text>
          <Text style={styles.subtitle}>
            Start a socket room from Plus and message in real time.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                connectionStatus === "connected" && styles.statusDotOnline,
                connectionStatus === "connecting" && styles.statusDotConnecting,
                connectionStatus === "error" && styles.statusDotError,
              ]}
            />
            <Text style={styles.statusLabel}>
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                  ? "Connecting"
                  : connectionStatus === "error"
                    ? "Unavailable"
                    : "Disconnected"}
            </Text>
            {isConnecting && (
              <ActivityIndicator size="small" color="#111827" />
            )}
          </View>
          {!!statusMessage && (
            <Text style={styles.statusMessage}>{statusMessage}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick rooms</Text>
          <View style={styles.quickRoomList}>
            {QUICK_ROOMS.map((room) => (
              <Pressable
                key={room.id}
                style={[
                  styles.quickRoomButton,
                  roomId === room.id && styles.quickRoomButtonActive,
                  (!isReady || isOpeningChat) && styles.buttonDisabled,
                ]}
                disabled={!isReady || isOpeningChat}
                onPress={() => {
                  setRoomId(room.id);
                  openChatRoom(room.id);
                }}
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={18}
                  color={roomId === room.id ? "#FFFFFF" : "#111827"}
                />
                <Text
                  style={[
                    styles.quickRoomText,
                    roomId === room.id && styles.quickRoomTextActive,
                  ]}
                >
                  {room.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom room</Text>
          <TextInput
            style={styles.input}
            value={roomId}
            onChangeText={setRoomId}
            placeholder="e.g. plus-general"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            style={[
              styles.primaryButton,
              (!isReady || isOpeningChat) && styles.buttonDisabled,
            ]}
            disabled={!isReady || isOpeningChat}
            onPress={() => openChatRoom(roomId)}
          >
            {isOpeningChat ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Open chat</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#9CA3AF",
  },
  statusDotOnline: {
    backgroundColor: "#16A34A",
  },
  statusDotConnecting: {
    backgroundColor: "#F59E0B",
  },
  statusDotError: {
    backgroundColor: "#DC2626",
  },
  statusLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  statusMessage: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  quickRoomList: {
    gap: 10,
  },
  quickRoomButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickRoomButtonActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  quickRoomText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  quickRoomTextActive: {
    color: "#FFFFFF",
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#111827",
    marginBottom: 12,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
