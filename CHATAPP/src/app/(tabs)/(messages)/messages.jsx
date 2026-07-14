import React, { useEffect, useState } from "react";
import {
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

import StoriesBar from "../../../components/storiesBar.jsx";

const mockConversations = [
  {
    id: "1",
    name: "Sunny",
    lastMessage: "Let’s build the chat screen next.",
    time: "9:45 PM",
    unreadCount: 2,
  },
  {
    id: "2",
    name: "Alex",
    lastMessage: "Video calling UI is ready.",
    time: "8:30 PM",
    unreadCount: 0,
  },
  {
    id: "3",
    name: "Support",
    lastMessage: "Your account setup looks good.",
    time: "Yesterday",
    unreadCount: 1,
  },
];

function MessagesScreen() {
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchConversations = async () => {
    try {
      setLoading(true);

      // Later this will call your backend with axios:
      // const response = await apiClient.get("/api/conversations");
      // setConversations(response.data.conversations);

      setConversations(mockConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const openConversation = (conversationId) => {
    router.push(`/chat/${conversationId}`);
  };

  const filteredConversations = conversations.filter((conversation) => {
    const cleanSearch = search.trim().toLowerCase();

    if (!cleanSearch) {
      return true;
    }

    return conversation.name.toLowerCase().includes(cleanSearch);
  });

  useEffect(() => {
    fetchConversations();
  }, []);

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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Messages</Text>

              <Text style={styles.subtitle}>
                {loading
                  ? "Loading conversations..."
                  : `You have ${conversations.length} conversations.`}
              </Text>
            </View>
          </View>

          {/* Search bar */}
          <View style={styles.searchBox}>
            <Text style={styles.searchLabel}>Search conversations</Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Type to search..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Stories */}
          <View style={styles.storiesSection}>
            <Text style={styles.sectionTitle}>Stories</Text>
            <StoriesBar />
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Conversations list */}
          <View style={styles.conversationsSection}>
            <Text style={styles.sectionTitle}>Recent Chats</Text>

            {filteredConversations.map((conversation) => (
              <Pressable
                key={conversation.id}
                style={styles.conversationCard}
                onPress={() => openConversation(conversation.id)}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {conversation.name.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.conversationMiddle}>
                  <View style={styles.conversationTopRow}>
                    <Text style={styles.conversationName}>
                      {conversation.name}
                    </Text>

                    <Text style={styles.conversationTime}>
                      {conversation.time}
                    </Text>
                  </View>

                  <Text numberOfLines={1} style={styles.lastMessage}>
                    {conversation.lastMessage}
                  </Text>
                </View>

                {conversation.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>
                      {conversation.unreadCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}

            {!loading && filteredConversations.length === 0 && (
              <Text style={styles.emptyText}>No conversations found.</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default MessagesScreen;

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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#6B7280",
  },

  searchBox: {
    marginTop: 4,
    marginBottom: 20,
  },

  searchLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  searchInput: {
    height: 50,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    color: "#111827",
  },

  storiesSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#D1D5DB",
    marginBottom: 20,
  },

  conversationsSection: {
    paddingBottom: 24,
  },

  conversationCard: {
    minHeight: 78,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  conversationMiddle: {
    flex: 1,
  },

  conversationTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  conversationName: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
  },

  conversationTime: {
    fontSize: 12,
    color: "#6B7280",
  },

  lastMessage: {
    fontSize: 14,
    color: "#6B7280",
  },

  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    paddingHorizontal: 6,
  },

  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 15,
    marginTop: 20,
  },
});