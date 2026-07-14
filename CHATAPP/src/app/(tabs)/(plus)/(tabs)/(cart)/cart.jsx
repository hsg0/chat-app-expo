import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";

import {
  addItem,
  clearCart,
  removeItem,
  selectCartItems,
} from "../../../../../reduxSetup/slice/cartSlice";

export default function PlusCartScreen() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);

  function handleAddItem() {
    const id = Date.now().toString();
    dispatch(
      addItem({
        id,
        name: `Item ${items.length + 1}`,
      })
    );
  }

  function handleRemoveLast() {
    const lastItem = items[items.length - 1];
    if (!lastItem) return;
    dispatch(removeItem(lastItem.id));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cart ({items.length})</Text>

      <View style={styles.actionsRow}>
        <Pressable onPress={handleAddItem} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Add Item</Text>
        </Pressable>

        <Pressable
          onPress={handleRemoveLast}
          style={styles.secondaryButton}
          disabled={items.length === 0}
        >
          <Text style={styles.secondaryButtonText}>Remove Last</Text>
        </Pressable>

        <Pressable
          onPress={() => dispatch(clearCart())}
          style={styles.dangerButton}
          disabled={items.length === 0}
        >
          <Text style={styles.dangerButtonText}>Clear</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No items in cart yet.</Text>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "700",
  },
  dangerButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  dangerButtonText: {
    color: "#991B1B",
    fontWeight: "700",
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 15,
    marginTop: 12,
  },
  itemRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  itemText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
});
