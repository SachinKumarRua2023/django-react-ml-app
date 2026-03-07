// mobile/app/_layout.tsx
// Root entry — DO NOT add NavigationContainer here, AppNavigator has it

import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import AppNavigator from "../src/navigation/AppNavigator";
import { useAuthStore } from "../src/store/authStore";
import { LoadingScreen } from "../src/components/ui/LoadingScreen";
import { COLORS } from "../src/constants/theme";

export default function RootLayout() {
  const { loadUser, isLoading } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="light" backgroundColor={COLORS.background} />
      <AppNavigator />
    </View>
  );
}