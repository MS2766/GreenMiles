import { Stack } from "expo-router";
import "react-native-reanimated";
import React from "react";

const RootLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="find_or_host" options={{ headerShown: false }} />
      <Stack.Screen name="host_ride" options={{ headerShown: false }} />
      <Stack.Screen name="find_ride" options={{ headerShown: false }} />
    </Stack>
  );
};

export default RootLayout;
