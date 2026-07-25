// CHATAPP/src/app/.../PlusCartScreen.jsx
//
// WHAT:
// Displays the frontend chat interface for the fictional medication agent.
//
// WHY:
// Lets the Expo app send natural-language requests to the backend
// LangChain + LangGraph workflow.
//
// HOW:
// 1. User enters a message.
// 2. Expo sends it to the Express backend.
// 3. Express runs the LangGraph medication agent.
// 4. The agent may search MongoDB through LangChain tools.
// 5. The final grounded response is displayed in the chat.
//
// IMPORTANT:
// This screen uses fictional medication records only.
// It must never present the results as real medical advice.

import React, { useRef, useState } from "react";

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

const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL;

const STARTING_MESSAGES = [
  {
    id: "welcome-message",
    role: "assistant",
    text:
      "Welcome to the fictional medication catalogue assistant.\n\n" +
      "You can ask me to search, filter, inspect, or compare the 100 fictional products stored in MongoDB.",
  },
];

const QUICK_PROMPTS = [
  "Find a non-drowsy allergy product under $20.",
  "Show cold products requiring pharmacist review.",
  "Find available products for travel nausea.",
  "Tell me about PRAC-0005.",
];

export default function PlusCartScreen() {
  const scrollViewRef = useRef(null);

  const [messages, setMessages] =
    useState(STARTING_MESSAGES);

  const [messageInput, setMessageInput] =
    useState("");

  const [isSendingMessage, setIsSendingMessage] =
    useState(false);

  function scrollToLatestMessage() {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }

  function createMessage(role, text) {
    return {
      id:
        `${role}-${Date.now()}-` +
        Math.random().toString(36).slice(2),
      role,
      text,
    };
  }

  async function sendMessage(messageText) {
    const cleanedMessage =
      typeof messageText === "string"
        ? messageText.trim()
        : "";

    if (!cleanedMessage || isSendingMessage) {
      return;
    }

    const userMessage = createMessage(
      "user",
      cleanedMessage
    );

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setMessageInput("");
    setIsSendingMessage(true);
    scrollToLatestMessage();

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/practice-medications/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: cleanedMessage,
          }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData?.message ||
            "The medication assistant request failed."
        );
      }

      const assistantText =
        typeof responseData?.response === "string"
          ? responseData.response.trim()
          : "";

      if (!assistantText) {
        throw new Error(
          "The medication assistant returned an empty response."
        );
      }

      const assistantMessage = createMessage(
        "assistant",
        assistantText
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "Practice medication chat request failed:",
        error
      );

      const errorMessage = createMessage(
        "error",
        error.message ||
          "The medication assistant could not be reached."
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        errorMessage,
      ]);
    } finally {
      setIsSendingMessage(false);
      scrollToLatestMessage();
    }
  }

  function handleSendMessage() {
    sendMessage(messageInput);
  }

  function handleQuickPrompt(prompt) {
    sendMessage(prompt);
  }

  function handleResetConversation() {
    if (isSendingMessage) {
      return;
    }

    setMessages(STARTING_MESSAGES);
    setMessageInput("");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
      keyboardVerticalOffset={
        Platform.OS === "ios" ? 90 : 0
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>
            Medication Agent
          </Text>

          <Text style={styles.subtitle}>
            LangChain + LangGraph + MongoDB
          </Text>
        </View>

        <Pressable
          onPress={handleResetConversation}
          disabled={isSendingMessage}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.buttonPressed,
            isSendingMessage &&
              styles.disabledButton,
          ]}
        >
          <Text style={styles.resetButtonText}>
            Reset
          </Text>
        </Pressable>
      </View>

      <View style={styles.practiceNotice}>
        <Text style={styles.practiceNoticeText}>
          Fictional software-development data only.
          Not medical guidance.
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={
          styles.messagesContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={
          scrollToLatestMessage
        }
      >
        {messages.map((message) => {
          const isUser =
            message.role === "user";

          const isError =
            message.role === "error";

          return (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                isUser
                  ? styles.userMessageRow
                  : styles.assistantMessageRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isUser &&
                    styles.userMessageBubble,
                  !isUser &&
                    !isError &&
                    styles.assistantMessageBubble,
                  isError &&
                    styles.errorMessageBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageRole,
                    isUser &&
                      styles.userMessageText,
                    isError &&
                      styles.errorMessageText,
                  ]}
                >
                  {isUser
                    ? "You"
                    : isError
                      ? "Connection error"
                      : "Practice Agent"}
                </Text>

                <Text
                  style={[
                    styles.messageText,
                    isUser &&
                      styles.userMessageText,
                    isError &&
                      styles.errorMessageText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          );
        })}

        {isSendingMessage ? (
          <View
            style={[
              styles.messageRow,
              styles.assistantMessageRow,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                styles.assistantMessageBubble,
                styles.loadingBubble,
              ]}
            >
              <ActivityIndicator size="small" />

              <Text style={styles.loadingText}>
                LangGraph is working...
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {messages.length === 1 ? (
        <View style={styles.quickPromptsContainer}>
          <Text style={styles.quickPromptsTitle}>
            Try a request
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={
              styles.quickPromptsContent
            }
          >
            {QUICK_PROMPTS.map((prompt) => (
              <Pressable
                key={prompt}
                onPress={() =>
                  handleQuickPrompt(prompt)
                }
                disabled={isSendingMessage}
                style={({ pressed }) => [
                  styles.quickPromptButton,
                  pressed &&
                    styles.buttonPressed,
                ]}
              >
                <Text
                  style={
                    styles.quickPromptButtonText
                  }
                >
                  {prompt}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.inputArea}>
        <TextInput
          value={messageInput}
          onChangeText={setMessageInput}
          placeholder="Ask about the fictional catalogue..."
          placeholderTextColor="#9CA3AF"
          multiline
          maxLength={2000}
          editable={!isSendingMessage}
          style={styles.messageInput}
          onSubmitEditing={handleSendMessage}
          blurOnSubmit={false}
        />

        <Pressable
          onPress={handleSendMessage}
          disabled={
            isSendingMessage ||
            !messageInput.trim()
          }
          style={({ pressed }) => [
            styles.sendButton,
            pressed && styles.buttonPressed,
            (isSendingMessage ||
              !messageInput.trim()) &&
              styles.disabledButton,
          ]}
        >
          {isSendingMessage ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.sendButtonText}>
              Send
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },

  resetButton: {
    minWidth: 68,
    height: 38,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },

  resetButtonText: {
    color: "#111827",
    fontWeight: "700",
  },

  practiceNotice: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: "#FEF3C7",
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
  },

  practiceNoticeText: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  messagesContainer: {
    flex: 1,
  },

  messagesContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 24,
  },

  messageRow: {
    width: "100%",
    marginBottom: 12,
  },

  userMessageRow: {
    alignItems: "flex-end",
  },

  assistantMessageRow: {
    alignItems: "flex-start",
  },

  messageBubble: {
    maxWidth: "88%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  userMessageBubble: {
    backgroundColor: "#111827",
    borderBottomRightRadius: 4,
  },

  assistantMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderBottomLeftRadius: 4,
  },

  errorMessageBubble: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderBottomLeftRadius: 4,
  },

  messageRole: {
    marginBottom: 4,
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  messageText: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 22,
  },

  userMessageText: {
    color: "#FFFFFF",
  },

  errorMessageText: {
    color: "#991B1B",
  },

  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  loadingText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "600",
  },

  quickPromptsContainer: {
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },

  quickPromptsTitle: {
    marginBottom: 8,
    paddingHorizontal: 16,
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  quickPromptsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },

  quickPromptButton: {
    maxWidth: 240,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  quickPromptButtonText: {
    color: "#374151",
    fontSize: 13,
    fontWeight: "600",
  },

  inputArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom:
      Platform.OS === "ios" ? 20 : 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },

  messageInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#F9FAFB",
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
  },

  sendButton: {
    minWidth: 68,
    height: 46,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#111827",
  },

  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.45,
  },

  buttonPressed: {
    opacity: 0.75,
  },
});