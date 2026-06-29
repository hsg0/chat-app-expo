import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import chatapp from "../../assets/images/chatapp.png";

const logo = chatapp;

export default function PrivateBrandBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const insets = useSafeAreaInsets();

  function closeMenu() {
    setMenuOpen(false);
  }

  function goToProfile() {
    closeMenu();
    router.push("/(tabs)/profile");
  }

  function goToSettings() {
    closeMenu();
    router.push("/(tabs)/settings");
  }

  function goToTerms() {
    closeMenu();
    router.push("/(tabs)/terms");
  }

  function goToPrivacy() {
    closeMenu();
    router.push("/(tabs)/privacy");
  }

  function goToAgreements() {
    closeMenu();
    router.push("/(tabs)/agreements");
  }

  function goToHelp() {
    closeMenu();
    router.push("/(tabs)/help");
  }

  function handleLogout() {
    closeMenu();
    router.push("/(tabs)/logout");
  }

  return (
    <>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.brandBar}>
          <View style={styles.leftSide}>
            <Image source={logo} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandText}>CHATAPP</Text>
          </View>

          <Pressable
            onPress={() => setMenuOpen(true)}
            style={styles.menuButton}
          >
            <Ionicons name="menu-outline" size={28} color="#111827" />
          </Pressable>
        </View>
      </SafeAreaView>

      <Modal
        visible={menuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.modalOverlay} onPress={closeMenu}>
          <Pressable
            style={[
              styles.drawer,
              {
                paddingTop: insets.top + 24,
              },
            ]}
            onPress={() => {}}
          >
            <View style={styles.drawerHeader}>
              <Image
                source={logo}
                style={styles.drawerLogo}
                resizeMode="contain"
              />

              <View>
                <Text style={styles.drawerTitle}>CHATAPP</Text>
                <Text style={styles.drawerSubtitle}>Private Menu</Text>
              </View>
            </View>

            <MenuItem
              icon="person-circle-outline"
              title="Profile"
              onPress={goToProfile}
            />

            <MenuItem
              icon="settings-outline"
              title="Settings"
              onPress={goToSettings}
            />

            <MenuItem
              icon="document-text-outline"
              title="Terms & Conditions"
              onPress={goToTerms}
            />

            <MenuItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              onPress={goToPrivacy}
            />

            <MenuItem
              icon="reader-outline"
              title="User Agreements"
              onPress={goToAgreements}
            />

            <MenuItem
              icon="help-circle-outline"
              title="Help & Support"
              onPress={goToHelp}
            />

            <View style={styles.divider} />

            <MenuItem
              icon="log-out-outline"
              title="Logout"
              danger={true}
              onPress={handleLogout}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function MenuItem({ icon, title, onPress, danger = false }) {
  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={danger ? "#DC2626" : "#111827"}
        />

        <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>
          {title}
        </Text>
      </View>

      <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FFFFFF",
  },

  brandBar: {
    width: "100%",
    minHeight: 64,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftSide: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },

  brandText: {
    marginLeft: 10,
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: 0.5,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "flex-end",
  },

  drawer: {
    width: "82%",
    maxWidth: 360,
    height: "100%",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    borderTopLeftRadius: 26,
    borderBottomLeftRadius: 26,
  },

  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  drawerLogo: {
    width: 54,
    height: 54,
    borderRadius: 16,
    marginRight: 12,
  },

  drawerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
  },

  drawerSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },

  menuItem: {
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 8,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuItemText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "800",
    color: "#111827",
  },

  menuItemTextDanger: {
    color: "#DC2626",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },
});