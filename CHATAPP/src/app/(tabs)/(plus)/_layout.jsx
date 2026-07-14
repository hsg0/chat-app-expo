import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";

export default function PlusLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerType: "front",
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Shop",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="storefront-outline" size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name="plus"
        options={{
          title: "Plus Entry",
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer>
  );
}
