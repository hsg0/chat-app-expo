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

const mockStories = [
  {
    id: "story-1",
    name: "You",
  },
  {
    id: "story-2",
    name: "Alex",
  },
  {
    id: "story-3",
    name: "Maya",
  },
  {
    id: "story-4",
    name: "Sam",
  },
];

const MessagesIndex = () => {
  const router = useRouter();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [search, setSearch] = useState("");

  const fetchConversations = async () => {
    try {
      setLoading(true);

      // Later this will call your backend:
      // const response = await axios.get(`${API_URL}/api/conversations`);
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

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.storiesRow}
            >
              {mockStories.map((story) => {
                const isSelected = selectedStory === story.id;

                return (
                  <Pressable
                    key={story.id}
                    style={styles.storyItem}
                    onPress={() => setSelectedStory(story.id)}
                  >
                    <View
                      style={[
                        styles.storyCircle,
                        isSelected && styles.storyCircleSelected,
                      ]}
                    >
                      <Text style={styles.storyInitial}>
                        {story.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <Text numberOfLines={1} style={styles.storyName}>
                      {story.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
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
};

export default MessagesIndex;

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

  storiesRow: {
    paddingRight: 20,
  },

  storyItem: {
    width: 74,
    alignItems: "center",
    marginRight: 12,
  },

  storyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "#208AEF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  storyCircleSelected: {
    borderColor: "#16A34A",
  },

  storyInitial: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },

  storyName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
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