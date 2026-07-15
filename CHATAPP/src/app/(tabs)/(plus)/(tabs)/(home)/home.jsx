//
// WHAT:
// Displays Health Canada non-prescription products in the practice store.
//
// WHY:
// Replaces the temporary clothing products with real OTC catalog data.
//
// HOW:
// Loads products from the backend when the screen opens and displays the
// brand name, ingredient, dosage form, DIN, and manufacturer.
//
// IMPORTANT:
// Health Canada does not provide price or inventory information.
// Cart purchasing will be connected later after prices are added.
//

import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getOtcProducts } from "../../../../../api/otcApi";

const otcCategories = [
  { label: "All", icon: "grid-outline" },
  { label: "Pain", icon: "medical-outline" },
  { label: "Cold", icon: "thermometer-outline" },
  { label: "Allergy", icon: "flower-outline" },
  { label: "Digestive", icon: "restaurant-outline" },
  { label: "First Aid", icon: "bandage-outline" },
];

export default function PlusHomeScreen() {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);
  const [loadingErrorMessage, setLoadingErrorMessage] = useState("");

  async function loadOtcProducts({ isRefresh = false } = {}) {
    try {
      setLoadingErrorMessage("");

      if (isRefresh) {
        setIsRefreshingProducts(true);
      } else {
        setIsLoadingProducts(true);
      }

      const responseData = await getOtcProducts(1, 20);

      setProducts(responseData.products || []);
    } catch (error) {
      console.error("Load OTC products error:", error);

      setLoadingErrorMessage(
        error.response?.data?.message ||
          "Unable to load OTC products. Check the backend and ngrok."
      );
    } finally {
      setIsLoadingProducts(false);
      setIsRefreshingProducts(false);
    }
  }

  useEffect(() => {
    loadOtcProducts();
  }, []);

  function getMainIngredient(product) {
    const firstIngredient = product.activeIngredients?.[0];

    if (!firstIngredient) {
      return "Ingredient not listed";
    }

    const ingredientStrength = [
      firstIngredient.strength,
      firstIngredient.strengthUnit,
    ]
      .filter(Boolean)
      .join(" ");

    if (!ingredientStrength) {
      return firstIngredient.ingredientName;
    }

    return `${firstIngredient.ingredientName} ${ingredientStrength}`;
  }

  function getDosageForm(product) {
    return product.dosageForms?.[0] || "Form not listed";
  }

  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshingProducts}
            onRefresh={() => loadOtcProducts({ isRefresh: true })}
          />
        }
      >
        <View style={styles.banner}>
          <View style={styles.bannerIconCircle}>
            <Ionicons name="medkit-outline" size={30} color="#FFFFFF" />
          </View>

          <View style={styles.bannerTextBox}>
            <Text style={styles.bannerTitle}>OTC Catalog</Text>

            <Text style={styles.bannerSubTitle}>
              Marketed Canadian non-prescription products
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {otcCategories.map((category) => (
            <Pressable key={category.label} style={styles.categoryItem}>
              <View style={styles.categoryIconCircle}>
                <Ionicons name={category.icon} size={20} color="#111827" />
              </View>

              <Text style={styles.categoryLabel}>{category.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.productsHeaderRow}>
          <View>
            <Text style={styles.productsTitle}>OTC Products</Text>

            <Text style={styles.productsSubtitle}>{products.length} products loaded</Text>
          </View>

          <Pressable
            style={styles.refreshButton}
            onPress={() => loadOtcProducts({ isRefresh: true })}
          >
            <Ionicons name="refresh-outline" size={20} color="#111827" />
          </Pressable>
        </View>

        {isLoadingProducts ? (
          <View style={styles.centerMessageBox}>
            <ActivityIndicator size="large" color="#111827" />

            <Text style={styles.loadingText}>Loading OTC products...</Text>
          </View>
        ) : null}

        {!isLoadingProducts && loadingErrorMessage ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={28} color="#B91C1C" />

            <Text style={styles.errorText}>{loadingErrorMessage}</Text>

            <Pressable style={styles.retryButton} onPress={() => loadOtcProducts()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoadingProducts && !loadingErrorMessage && products.length === 0 ? (
          <View style={styles.centerMessageBox}>
            <Ionicons name="file-tray-outline" size={34} color="#6B7280" />

            <Text style={styles.emptyText}>No OTC products were found.</Text>
          </View>
        ) : null}

        {!isLoadingProducts && !loadingErrorMessage ? (
          <View style={styles.productsGrid}>
            {products.map((product) => (
              <View key={product._id || product.drugCode} style={styles.productCard}>
                <View style={styles.productTopRow}>
                  <View style={styles.productIconBox}>
                    <Ionicons name="medical-outline" size={24} color="#111827" />
                  </View>

                  <View style={styles.productTitleBox}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.brandName}
                    </Text>

                    <Text style={styles.productDin}>DIN: {product.din}</Text>
                  </View>
                </View>

                <View style={styles.productInformationBox}>
                  <View style={styles.informationRow}>
                    <Text style={styles.informationLabel}>Ingredient</Text>

                    <Text style={styles.informationValue}>{getMainIngredient(product)}</Text>
                  </View>

                  <View style={styles.informationRow}>
                    <Text style={styles.informationLabel}>Form</Text>

                    <Text style={styles.informationValue}>{getDosageForm(product)}</Text>
                  </View>

                  <View style={styles.informationRow}>
                    <Text style={styles.informationLabel}>Manufacturer</Text>

                    <Text style={styles.informationValue} numberOfLines={2}>
                      {product.manufacturerName || "Manufacturer not listed"}
                    </Text>
                  </View>
                </View>

                <View style={styles.productFooterRow}>
                  <View style={styles.catalogBadge}>
                    <Text style={styles.catalogBadgeText}>Health Canada</Text>
                  </View>

                  <Text style={styles.catalogOnlyText}>Catalog only</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}
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
    paddingTop: 12,
    paddingBottom: 40,
  },

  banner: {
    minHeight: 130,
    borderRadius: 18,
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  bannerIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  bannerTextBox: {
    flex: 1,
  },

  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "900",
  },

  bannerSubTitle: {
    color: "#D1D5DB",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },

  categoriesRow: {
    gap: 12,
    paddingRight: 14,
    paddingBottom: 6,
  },

  categoryItem: {
    alignItems: "center",
    width: 62,
  },

  categoryIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 6,
  },

  categoryLabel: {
    fontSize: 11,
    color: "#4B5563",
    fontWeight: "700",
    textAlign: "center",
  },

  productsHeaderRow: {
    marginTop: 22,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  productsTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },

  productsSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  centerMessageBox: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  loadingText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },

  errorBox: {
    minHeight: 180,
    borderRadius: 14,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },

  errorText: {
    color: "#991B1B",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    minHeight: 38,
    borderRadius: 19,
    backgroundColor: "#111827",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 14,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  productsGrid: {
    gap: 12,
  },

  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
  },

  productTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  productIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  productTitleBox: {
    flex: 1,
  },

  productName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 21,
  },

  productDin: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 3,
  },

  productInformationBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 8,
  },

  informationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  informationLabel: {
    width: 90,
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "700",
  },

  informationValue: {
    flex: 1,
    fontSize: 12,
    color: "#111827",
    fontWeight: "600",
  },

  productFooterRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  catalogBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
  },

  catalogBadgeText: {
    color: "#047857",
    fontSize: 11,
    fontWeight: "800",
  },

  catalogOnlyText: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
  },
});
