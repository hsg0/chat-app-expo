import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PlusTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#111827",
        tabBarInactiveTintColor: "#9CA3AF",
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          href: "/(tabs)/(plus)/(tabs)/(home)/home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(cart)"
        options={{
          title: "Cart",
          href: "/(tabs)/(plus)/(tabs)/(cart)/cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(add)"
        options={{
          title: "Add",
          href: "/(tabs)/(plus)/(tabs)/(add)/add",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(favorites)"
        options={{
          title: "Favorites",
          href: "/(tabs)/(plus)/(tabs)/(favorites)/favorites",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
          href: "/(tabs)/(plus)/(tabs)/(profile)/profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
