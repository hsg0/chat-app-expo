import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const PALETTE = ["#4652B0", "#933880", "#3946A4", "#6750A4", "#7965AF"];

export default function Avatar({
  name = "User",
  size = 44,
  online = false,
  src = null,
}) {
  const safeName = name || "User";

  const colorIndex = safeName.charCodeAt(0) % PALETTE.length;
  const backgroundColor = PALETTE[colorIndex];

  const initials = safeName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.avatarWrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
      ]}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          style={[
            styles.avatarImage,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          resizeMode="cover"
        />
      ) : (
        <Text
          style={[
            styles.initials,
            {
              fontSize: size * 0.38,
            },
          ]}
        >
          {initials}
        </Text>
      )}

      {online && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: size * 0.125,
              right: size * 0.02,
              bottom: size * 0.02,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "visible",
  },

  avatarImage: {
    backgroundColor: "#E5E7EB",
  },

  initials: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  onlineDot: {
    position: "absolute",
    backgroundColor: "#16A34A",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});