import { Stack } from "expo-router";

export default function PlusAddLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add" />
    </Stack>
  );
}
