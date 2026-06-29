import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const storyData = [
  {
    id: "1",
    name: "You",
    image: null,
    isCurrentUser: true,
  },
  {
    id: "2",
    name: "Alex",
    image: null,
  },
  {
    id: "3",
    name: "Maya",
    image: null,
  },
  {
    id: "4",
    name: "Sam",
    image: null,
  },
  {
    id: "5",
    name: "Chris",
    image: null,
  },
];

const StoriesBar = () => {
  const [uploading, setUploading] = useState(false);
  const [userStories, setUserStories] = useState([]);

  async function pickAndUpload() {
    try {
      setUploading(true);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Permission to access your photo library is required."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const selectedImage = result.assets[0];

      const newStory = {
        id: Date.now().toString(),
        name: "You",
        image: { uri: selectedImage.uri },
        isCurrentUser: true,
      };

      setUserStories((currentStories) => [newStory, ...currentStories]);

      console.log("Selected story image:", selectedImage.uri);

      // Later this is where we upload to backend/ImageKit/S3:
      // const formData = new FormData();
      // formData.append("story", {
      //   uri: selectedImage.uri,
      //   name: "story.jpg",
      //   type: "image/jpeg",
      // });
      // await fetch(`${API_URL}/api/stories`, {
      //   method: "POST",
      //   body: formData,
      // });
    } catch (error) {
      console.log("Story picker error:", error);
      Alert.alert("Error", "Something went wrong while choosing your story.");
    } finally {
      setUploading(false);
    }
  }

  function handleStoryPress(story) {
    if (story.isCurrentUser) {
      pickAndUpload();
      return;
    }

    console.log("Open story:", story.id);
  }

  const stories = [...userStories, ...storyData];

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.storyItem}
            onPress={() => handleStoryPress(item)}
            disabled={uploading}
          >
            <View style={styles.storyRing}>
              {item.image ? (
                <Image
                  source={item.image}
                  style={styles.storyImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderAvatar}>
                  <Text style={styles.avatarText}>
                    {item.isCurrentUser ? "+" : item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            <Text numberOfLines={1} style={styles.storyName}>
              {item.isCurrentUser && !item.image
                ? uploading
                  ? "Loading"
                  : "Add"
                : item.name}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default StoriesBar;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 12,
    backgroundColor: "#EAF6FF",
  },

  listContent: {
    paddingHorizontal: 14,
  },

  storyItem: {
    width: 74,
    alignItems: "center",
    marginRight: 12,
  },

  storyRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 3,
    borderColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  storyImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },

  placeholderAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  storyName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
});