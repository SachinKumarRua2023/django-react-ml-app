// mobile/src/pages/Profile.tsx
// Handles the logout flow that was in LoginSignupLogout.jsx when user is logged in
// Replaces: the "if (user)" branch from Login_Signup_Logout.jsx

import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useAuth } from "../hooks/useAuth";
import { RootStackParamList } from "../navigation/AppNavigator";
import { COLORS, SPACING, RADIUS, FONT } from "../constants/theme";

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function Profile() {
  const navigation = useNavigation<NavProp>();
  const { user, clearAuth, isTrainer, isPremium, displayName } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      "Leave the Cosmos?",
      "Are you sure you want to logout?",
      [
        { text: "Stay", style: "cancel" },
        {
          text: "Logout", style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await api.post("/api/logout/");
            } catch {}
            await clearAuth();
            // AppNavigator detects token = null → auto-shows Login screen
          },
        },
      ]
    );
  };

  const handleEnterVoiceRoom = () => {
    navigation.navigate("VCRoom", {});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Profile</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(displayName[0] || "?").toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{displayName}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, isTrainer ? styles.badgeTrainer : styles.badgeLearner]}>
            <Text style={styles.badgeText}>
              {isTrainer ? "🔭 Trainer" : "🌱 Seeker"}
            </Text>
          </View>
          {isPremium && (
            <View style={styles.badgePremium}>
              <Text style={styles.badgeText}>⭐ Premium</Text>
            </View>
          )}
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <InfoRow label="Email" value={user?.email || "—"} />
        <View style={styles.divider} />
        <InfoRow label="Role" value={user?.profile?.role || user?.role || "learner"} />
        <View style={styles.divider} />
        <InfoRow label="User ID" value={String(user?.id || "—")} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.voiceBtn}
          onPress={handleEnterVoiceRoom}
          activeOpacity={0.8}
        >
          <Text style={styles.voiceBtnText}>🎙️ Enter Voice Chat Room</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutBtn, loading && { opacity: 0.6 }]}
          onPress={handleLogout}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color={COLORS.rose} />
            : <Text style={styles.logoutBtnText}>← Logout</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  content:         { padding: SPACING.lg, paddingBottom: 40 },
  header:          { marginBottom: SPACING.lg },
  headerTitle:     { fontSize: FONT.size.xl, fontWeight: "700", color: COLORS.text },

  avatarSection:   { alignItems: "center", marginBottom: SPACING.xl },
  avatar:          { width: 90, height: 90, borderRadius: RADIUS.full, backgroundColor: "rgba(102,0,255,0.2)", justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: COLORS.purple, marginBottom: SPACING.md },
  avatarText:      { fontSize: FONT.size.hero, fontWeight: "900", color: COLORS.violet, fontFamily: "monospace" },
  displayName:     { fontSize: FONT.size.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.sm },
  badgeRow:        { flexDirection: "row", gap: SPACING.sm },
  badge:           { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1 },
  badgeTrainer:    { backgroundColor: "rgba(255,215,0,0.1)", borderColor: "rgba(255,215,0,0.4)" },
  badgeLearner:    { backgroundColor: "rgba(0,245,255,0.1)", borderColor: "rgba(0,245,255,0.4)" },
  badgePremium:    { backgroundColor: "rgba(255,215,0,0.1)", borderColor: "rgba(255,215,0,0.4)", paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1 },
  badgeText:       { fontSize: FONT.size.sm, fontWeight: "600", color: COLORS.text },

  infoCard:        { backgroundColor: COLORS.panel, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.xl },
  infoRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: SPACING.xs },
  infoLabel:       { color: COLORS.muted, fontSize: FONT.size.sm },
  infoValue:       { color: COLORS.text, fontSize: FONT.size.sm, fontWeight: "600" },
  divider:         { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },

  actions:         { gap: SPACING.md },
  voiceBtn:        { backgroundColor: "rgba(0,245,255,0.12)", borderRadius: RADIUS.md, padding: SPACING.md, alignItems: "center", borderWidth: 1, borderColor: "rgba(0,245,255,0.4)" },
  voiceBtnText:    { color: COLORS.cyan, fontWeight: "700", fontSize: FONT.size.md },
  logoutBtn:       { backgroundColor: "rgba(255,45,120,0.1)", borderRadius: RADIUS.md, padding: SPACING.md, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,45,120,0.3)" },
  logoutBtnText:   { color: COLORS.rose, fontWeight: "700", fontSize: FONT.size.md },
});