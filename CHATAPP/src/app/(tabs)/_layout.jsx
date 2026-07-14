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
          name="(uplink)"
          options={{
            title: "Uplink",
            href: "/(tabs)/(uplink)/uplink",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="radio-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="(calls)"
          options={{
            title: "Calls",
            href: "/(tabs)/(calls)/calls",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="call-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="(plus)"
          options={{
            title: "Plus",
            href: "/(tabs)/(plus)/plus",
            tabBarStyle: {
              display: "none",
            },
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
          name="(messages)"
          options={{
            title: "Messages",
            href: "/(tabs)/(messages)/messages",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="(search)"
          options={{
            title: "Search",
            href: "/(tabs)/(search)/search",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="search-outline" size={size} color={color} />
            ),
          }}
        />

        {/* Hidden drawer/private pages */}

        <Tabs.Screen
          name="index"
          options={{
            href: null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            href: null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            href: null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="terms"
          options={{
            href: null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="privacy"
          options={{
            href: null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="shield-checkmark-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="agreements"
          options={{
            href: null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="reader-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="help"
          options={{
            href: null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="help-circle-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="logout"
          options={{
            href: null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="log-out-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}