import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";

import { addItem } from "../../../../../reduxSetup/slice/cartSlice";

const categories = [
  { label: "All", icon: "grid-outline" },
  { label: "Men", icon: "man-outline" },
  { label: "Women", icon: "woman-outline" },
  { label: "Kids", icon: "happy-outline" },
  { label: "Shoes", icon: "footsteps-outline" },
  { label: "Bag", icon: "briefcase-outline" },
];

const featuredProducts = [
  { id: "p-001", name: "Oversized Tee", price: "$39" },
  { id: "p-002", name: "Street Joggers", price: "$59" },
  { id: "p-003", name: "Runner Shoes", price: "$89" },
];

export default function PlusHomeScreen() {
  const dispatch = useDispatch();

  function handleAddToCart(product) {
    dispatch(addItem(product));
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={{ uri: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80" }}
          style={styles.banner}
          imageStyle={styles.bannerImage}
        >
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>50% Off</Text>
            <Text style={styles.bannerSubTitle}>On everything today</Text>
            <Pressable
              style={styles.bannerButton}
              onPress={() =>
                handleAddToCart({
                  id: `promo-${Date.now()}`,
                  name: "Promo Bundle",
                  price: "$49",
                })
              }
            >
              <Text style={styles.bannerButtonText}>Get Now</Text>
            </Pressable>
          </View>
        </ImageBackground>

        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>

        <View style={styles.categoriesRow}>
          {categories.map((item) => (
            <View key={item.label} style={styles.categoryItem}>
              <View style={styles.categoryIconCircle}>
                <Ionicons name={item.icon} size={20} color="#111827" />
              </View>
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.productsHeaderRow}>
          <Text style={styles.productsTitle}>Popular Picks</Text>
        </View>

        <View style={styles.productsGrid}>
          {featuredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImagePlaceholder}>
                <Ionicons name="shirt-outline" size={20} color="#6B7280" />
              </View>

              <Text style={styles.productName}>{product.name}</Text>

              <View style={styles.productFooterRow}>
                <Text style={styles.productPrice}>{product.price}</Text>
                <Pressable
                  style={styles.addButton}
                  onPress={() => handleAddToCart(product)}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7FA",
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 28,
  },
  banner: {
    width: "100%",
    height: 150,
    justifyContent: "flex-end",
  },
  bannerImage: {
    borderRadius: 16,
  },
  bannerOverlay: {
    backgroundColor: "rgba(0,0,0,0.32)",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
  },
  bannerSubTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 1,
    marginBottom: 8,
    fontWeight: "500",
  },
  bannerButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 13,
    minHeight: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerButtonText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "700",
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    marginBottom: 18,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 20,
    borderRadius: 4,
    backgroundColor: "#111827",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  categoryItem: {
    alignItems: "center",
    width: 52,
  },
  categoryIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  productsHeaderRow: {
    marginTop: 22,
    marginBottom: 10,
  },
  productsTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },
  productsGrid: {
    gap: 10,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
  },
  productImagePlaceholder: {
    height: 100,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },
  productFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
});
