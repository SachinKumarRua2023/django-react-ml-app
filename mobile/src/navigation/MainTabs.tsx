// mobile/src/navigation/MainTabs.tsx
// Replaces: <Navbar> component + web URL routing
// Maps every route from your App.jsx to a tab or stack screen

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { COLORS, FONTS, SPACING } from "../constants/theme";

// Pages — all routes from your App.jsx
import MasterRua from "../pages/MasterRua";
import VCRoom from "../pages/VCRoom";
import MLPredictor from "../pages/MLPredictor";
import SyllabusPage from "../pages/SyllabusPage";
import TrainerDashboard from "../pages/TrainerDashboard";
import Employees from "../pages/Employees";
import MnemonicSystem from "../pages/MnemonicSystem";
import TalkWithRua from "../pages/TalkWithRua";
import Profile from "../pages/Profile";
import { useAuthStore } from "../store/authStore";

// ─── Tab param list ────────────────────────────────────────────────────────
export type MainTabParamList = {
  Home: undefined;        // → /  (MasterRua)
  LiveVoice: undefined;   // → /live-voice (VCRoom) — was your default redirect after login
  TalkRua: undefined;     // → /talk-with-rua
  More: undefined;        // → stack for ML, Syllabus, Employees, etc.
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  ML: undefined;
  Syllabus: undefined;
  Employees: undefined;
  Trainer: undefined;
  Mnemonic: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

// ─── Tab Icon Component ────────────────────────────────────────────────────
function TabIcon({ label, emoji, focused }: { label: string; emoji: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
}

// ─── More Menu Screen ──────────────────────────────────────────────────────
// Groups: /ml, /syllabus, /employees, /trainer-kpi, /mnemonic-system, /profile
function MoreMenuScreen({ navigation }: any) {
  const { logout } = useAuthStore();

  const items = [
    { label: "ML Predictor",      emoji: "🤖", screen: "ML" },
    { label: "Syllabus",          emoji: "📚", screen: "Syllabus" },
    { label: "Employees",         emoji: "👥", screen: "Employees" },
    { label: "Trainer KPI",       emoji: "📊", screen: "Trainer" },
    { label: "Mnemonic System",   emoji: "🧠", screen: "Mnemonic" },
    { label: "Profile",           emoji: "👤", screen: "Profile" },
  ];

  return (
    <View style={styles.moreContainer}>
      <Text style={styles.moreTitle}>More</Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={styles.moreItem}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Text style={styles.moreEmoji}>{item.emoji}</Text>
          <Text style={styles.moreLabel}>{item.label}</Text>
          <Text style={styles.moreArrow}>›</Text>
        </TouchableOpacity>
      ))}

      {/* Logout — replaces your Navbar logout button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── More Stack ────────────────────────────────────────────────────────────
function MoreStackNavigator() {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <MoreStack.Screen name="MoreMenu"   component={MoreMenuScreen}   options={{ title: "More" }} />
      <MoreStack.Screen name="ML"         component={MLPredictor}       options={{ title: "ML Predictor 🤖" }} />
      <MoreStack.Screen name="Syllabus"   component={SyllabusPage}      options={{ title: "Syllabus 📚" }} />
      <MoreStack.Screen name="Employees"  component={Employees}         options={{ title: "Employees 👥" }} />
      <MoreStack.Screen name="Trainer"    component={TrainerDashboard}  options={{ title: "Trainer KPI 📊" }} />
      <MoreStack.Screen name="Mnemonic"   component={MnemonicSystem}    options={{ title: "Mnemonic 🧠" }} />
      <MoreStack.Screen name="Profile"    component={Profile}           options={{ title: "Profile 👤" }} />
    </MoreStack.Navigator>
  );
}

// ─── Main Tabs ─────────────────────────────────────────────────────────────
export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="LiveVoice"  // → same as your redirect to /live-voice after login
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={MasterRua}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Home" emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="LiveVoice"
        component={VCRoom}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Live" emoji="🎙️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="TalkRua"
        component={TalkWithRua}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Rua" emoji="🤖" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="More" emoji="☰" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 65,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.sm,
  },
  tabIconFocused: {
    // optional glow effect
  },
  tabEmoji: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabLabelFocused: {
    color: COLORS.primary,
    fontWeight: "bold",
  },

  // More Menu
  moreContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 60,
    paddingHorizontal: SPACING.lg,
  },
  moreTitle: {
    fontSize: FONTS.sizes.xxl,
    color: COLORS.textPrimary,
    fontWeight: "bold",
    marginBottom: SPACING.xl,
  },
  moreItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  moreEmoji: {
    fontSize: 22,
    marginRight: SPACING.md,
  },
  moreLabel: {
    flex: 1,
    fontSize: FONTS.sizes.md,
    color: COLORS.textPrimary,
  },
  moreArrow: {
    fontSize: 22,
    color: COLORS.textMuted,
  },
  logoutBtn: {
    marginTop: SPACING.xxl,
    padding: SPACING.md,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: FONTS.sizes.md,
    fontWeight: "bold",
  },
});