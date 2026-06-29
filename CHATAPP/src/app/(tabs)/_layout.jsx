import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import PrivateBrandBar from "../../components/privateBrandBar";

export default function TabsLayout() {
  return (
    <>
      <PrivateBrandBar />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#111827",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            height: 120,
            paddingTop: 10,
            paddingBottom: 20,
            backgroundColor: "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: "#E5E7EB",
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "700",
          },
        }}
      >
        {/* Visible bottom tabs */}

        <Tabs.Screen
          name="uplink"
          options={{
            title: "Uplink",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="radio-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="calls"
          options={{
            title: "Calls",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="call-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="plus"
          options={{
            title: "Plus",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="add-circle-outline"
                size={size + 6}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="index"
          options={{
            title: "Messages",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Hidden drawer/private pages */}

        <Tabs.Screen
          name="profile"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="terms"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="privacy"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="agreements"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="help"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="logout"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </>
  );
}