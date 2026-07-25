import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { askPubMedRag } from "../../../api/pubmedRagApi";

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function SearchScreen() {
  const listRef = useRef(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask a biomedical question and I will retrieve PubMed abstracts, then answer with citations.",
      sources: [],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});

  const scrollToEnd = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd?.({ animated: true });
    });
  };

  const toggleSources = (messageId) => {
    setExpandedSources((current) => ({
      ...current,
      [messageId]: !current[messageId],
    }));
  };

  const openSource = async (url) => {
    if (!url) {
      return;
    }

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Open PubMed URL error:", error);
    }
  };

  const sendMessage = async () => {
    const cleanMessage = input.trim();

    if (!cleanMessage || isLoading) {
      return;
    }

    const userMessage = {
      id: createMessageId(),
      role: "user",
      content: cleanMessage,
      sources: [],
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    scrollToEnd();

    const history = nextMessages
      .filter((item) => item.id !== "welcome")
      .slice(0, -1)
      .map((item) => ({
        role: item.role,
        content: item.content,
      }));

    try {
      const response = await askPubMedRag({
        message: cleanMessage,
        history,
      });

      const assistantMessage = {
        id: createMessageId(),
        role: "assistant",
        content:
          response.answer ||
          "No answer was returned. Try another question.",
        sources: Array.isArray(response.sources) ? response.sources : [],
      };

      setMessages((current) => [...current, assistantMessage]);

      if (assistantMessage.sources.length > 0) {
        setExpandedSources((current) => ({
          ...current,
          [assistantMessage.id]: true,
        }));
      }
    } catch (error) {
      console.error("PubMed RAG error:", error);

      const errorMessage = {
        id: createMessageId(),
        role: "assistant",
        content:
          error.response?.data?.message ||
          error.message ||
          "Unable to reach PubMed RAG. Check auth, backend, and OPENAI_API_KEY.",
        sources: [],
        isError: true,
      };

      setMessages((current) => [...current, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToEnd();
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    const hasSources = !isUser && item.sources?.length > 0;
    const sourcesOpen = !!expandedSources[item.id];

    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          item.isError && styles.errorBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.content}</Text>

        {hasSources && (
          <View style={styles.sourcesWrap}>
            <Pressable
              style={styles.sourcesToggle}
              onPress={() => toggleSources(item.id)}
            >
              <Text style={styles.sourcesToggleText}>
                Sources ({item.sources.length})
              </Text>
              <Ionicons
                name={sourcesOpen ? "chevron-up" : "chevron-down"}
                size={16}
                color="#111827"
              />
            </Pressable>

            {sourcesOpen &&
              item.sources.map((source) => {
                const pubmedId = source.pubmedId || source.pmid;
                const year = source.publicationYear || source.year;
                const authors = Array.isArray(source.authors)
                  ? source.authors.slice(0, 3).join(", ")
                  : "";

                return (
                  <Pressable
                    key={pubmedId}
                    style={styles.sourceCard}
                    onPress={() => openSource(source.url)}
                  >
                    <Text style={styles.sourcePmid}>PMID {pubmedId}</Text>
                    <Text style={styles.sourceTitle}>{source.title}</Text>
                    {!!authors && (
                      <Text style={styles.sourceMeta}>{authors}</Text>
                    )}
                    <Text style={styles.sourceMeta}>
                      {[source.journal, year].filter(Boolean).join(" · ")}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>PubMed RAG</Text>
          <Text style={styles.subtitle}>
            Live PubMed abstracts + OpenAI. Not medical advice — verify with a
            clinician.
          </Text>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToEnd}
        />

        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#111827" />
            <Text style={styles.loadingText}>
              Searching PubMed and drafting an answer…
            </Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about a condition, drug, or study…"
            placeholderTextColor="#9CA3AF"
            multiline
            editable={!isLoading}
          />

          <Pressable
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
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
    paddingTop: 12,
    paddingBottom: 14,
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
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: "92%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#DCFCE7",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  errorBubble: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#111827",
  },
  sourcesWrap: {
    marginTop: 10,
    gap: 8,
  },
  sourcesToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sourcesToggleText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111827",
  },
  sourceCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#F9FAFB",
  },
  sourcePmid: {
    fontSize: 12,
    fontWeight: "800",
    color: "#2563EB",
    marginBottom: 4,
  },
  sourceTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  sourceMeta: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#6B7280",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#D1D5DB",
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#111827",
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
});
