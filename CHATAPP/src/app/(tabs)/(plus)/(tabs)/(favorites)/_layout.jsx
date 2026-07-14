import { Stack } from "expo-router";

export default function PlusFavoritesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="favorites" />
    </Stack>
  );
}
