import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { socket } from "../../socketsSetup/socket";
import { getToken } from "../../api/authStorage";

export default function ChatIdScreen() {
  const { id } = useLocalSearchParams();
  const conversationId = Array.isArray(id) ? id[0] : id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    let isMounted = true;

    const handleConnect = () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-room", conversationId);
    };

    const handleReceiveMessage = (newMessage) => {
      console.log("Message received on app:", newMessage);

      if (newMessage?.conversationId !== conversationId) {
        return;
      }

      setMessages((oldMessages) => [...oldMessages, newMessage]);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
    };

    const connectSocket = async () => {
      const token = await getToken();

      if (!isMounted || !token) {
        console.log("No auth token for socket connection.");
        return;
      }

      socket.auth = { token };

      socket.off("connect", handleConnect);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("disconnect", handleDisconnect);

      socket.on("connect", handleConnect);
      socket.on("receive-message", handleReceiveMessage);
      socket.on("disconnect", handleDisconnect);

      if (socket.connected) {
        socket.emit("join-room", conversationId);
        return;
      }

      socket.connect();
    };

    connectSocket();

    return () => {
      isMounted = false;
      socket.emit("leave-room", conversationId);
      socket.off("connect", handleConnect);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("disconnect", handleDisconnect);
    };
  }, [conversationId]);

  const sendMessage = () => {
    const cleanMessage = message.trim();

    if (!cleanMessage || !conversationId) {
      return;
    }

    const newMessage = {
      text: cleanMessage,
      senderId: "me",
      conversationId,
      createdAt: new Date().toISOString(),
    };

    // Show my own message instantly
    setMessages((oldMessages) => [...oldMessages, newMessage]);

    // Send message to backend socket
    socket.emit("send-message", newMessage);

    setMessage("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Chat Screen</Text>
          <Text style={styles.subtitle}>Chat ID: {conversationId}</Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            const isMe = item.senderId === "me";

            return (
              <View
                style={[
                  styles.messageBubble,
                  isMe ? styles.myMessage : styles.otherMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.text}</Text>

                <Text style={styles.messageMeta}>
                  {isMe ? "Me" : item.senderId}
                </Text>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
          />

          <Pressable style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF6FF",
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#6B7280",
  },

  messageList: {
    padding: 16,
    flexGrow: 1,
  },

  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCFCE7",
  },

  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },

  messageText: {
    fontSize: 16,
    color: "#111827",
  },

  messageMeta: {
    marginTop: 5,
    fontSize: 11,
    color: "#6B7280",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
  },

  input: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#111827",
  },

  sendButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});