// mobile/src/navigation/AppNavigator.tsx

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";

// Pages
import LoginSignupLogout from "../pages/LoginSignupLogout";
import MainTabs from "./MainTabs";

// UI — FIXED PATH (no leading ../ because we're inside src/navigation/)
import { LoadingScreen } from "../components/ui/LoadingScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { token, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={LoginSignupLogout} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}