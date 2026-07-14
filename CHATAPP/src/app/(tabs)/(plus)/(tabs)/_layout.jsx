import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { useSelector } from "react-redux";

import InnerNavBar from "../../../../components/innerNavBar";
import { selectCartCount } from "../../../../reduxSetup/slice/cartSlice";

export default function PlusTabsLayout() {
  const navigation = useNavigation();
  const router = useRouter();
  const cartCount = useSelector(selectCartCount);

  function handleOpenMenu() {
    if (typeof navigation.openDrawer === "function") {
      navigation.openDrawer();
    }
  }

  function handleOpenCart() {
    router.push("/(tabs)/(plus)/(tabs)/(cart)/cart");
  }

  return (
    <View style={styles.container}>
      <InnerNavBar
        cartCount={cartCount}
        onPressMenu={handleOpenMenu}
        onPressCart={handleOpenCart}
      />

      <View style={styles.tabsWrap}>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7FA",
  },
  tabsWrap: {
    flex: 1,
  },
});
