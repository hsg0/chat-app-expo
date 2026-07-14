import { Stack } from "expo-router";

export default function UplinkLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="uplink" />
    </Stack>
  );
}
