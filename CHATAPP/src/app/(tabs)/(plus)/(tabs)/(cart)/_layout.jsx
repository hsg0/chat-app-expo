import { Stack } from "expo-router";

export default function PlusCartLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="cart" />
    </Stack>
  );
}
