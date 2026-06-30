import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import Avatar from "./avatar";
import { getToken } from "../api/authStorage";
import { uploadMediaToImageKit } from "../api/imageKitUploadApi";

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
    online: true,
  },
  {
    id: "3",
    name: "Maya",
    image: null,
    online: false,
  },
  {
    id: "4",
    name: "Sam",
    image: null,
    online: true,
  },
  {
    id: "5",
    name: "Chris",
    image: null,
    online: false,
  },
];

const StoriesBar = () => {
  const [uploading, setUploading] = useState(false);
  const [userStories, setUserStories] = useState([]);

  async function pickAndUpload() {
    try {
      setUploading(true);

      const token = await getToken();

      if (!token) {
        Alert.alert("Login needed", "Please log in before uploading a story.");
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

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
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const selectedImage = result.assets[0];

      const uploadedMedia = await uploadMediaToImageKit({
        token,
        uri: selectedImage.uri,
        kind: "image",
        folder: "/chatapp/stories",
      });

      const newStory = {
        id: uploadedMedia.fileId || Date.now().toString(),
        name: "You",
        image: uploadedMedia.url,
        isCurrentUser: true,
        media: uploadedMedia,
      };

      setUserStories((currentStories) => [newStory, ...currentStories]);

      console.log("Story uploaded:", uploadedMedia.url);
    } catch (error) {
      console.log("Story upload error:", error);

      const message =
        error.response?.data?.message || error.message || "Story upload failed.";

      Alert.alert("Upload error", message);
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
              {item.isCurrentUser && !item.image ? (
                <View style={styles.addStoryCircle}>
                  <Text style={styles.addStoryText}>+</Text>
                </View>
              ) : (
                <Avatar
                  name={item.name}
                  size={58}
                  online={item.online}
                  src={item.image}
                />
              )}
            </View>

            <Text numberOfLines={1} style={styles.storyName}>
              {item.isCurrentUser && !item.image
                ? uploading
                  ? "Uploading"
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

  addStoryCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },

  addStoryText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    marginTop: -2,
  },

  storyName: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
});