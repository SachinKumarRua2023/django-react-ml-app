// mobile/src/pages/TrainerDashboard.tsx
// Trainer KPI dashboard

import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { COLORS, SPACING, RADIUS, FONT } from "../constants/theme";

interface KPI {
  label: string;
  value: string | number;
  icon:  string;
  color: string;
  delta?: string;
}

interface LeaderboardEntry {
  rank:    number;
  name:    string;
  score:   number;
  badge?:  string;
}

export default function TrainerDashboard() {
  const { isTrainer, displayName } = useAuth();
  const [kpis,        setKpis]        = useState<KPI[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [refreshing,  setRefreshing]  = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [kpiRes, lbRes] = await Promise.allSettled([
        api.get("/api/trainer/kpi/"),
        api.get("/api/trainer/leaderboard/"),
      ]);

      if (kpiRes.status === "fulfilled") {
        const d = kpiRes.value.data;
        setKpis([
          { label: "Total Students",  value: d.total_students  ?? 0,   icon: "🎓", color: COLORS.cyan },
          { label: "Active Panels",   value: d.active_panels   ?? 0,   icon: "🎙️", color: COLORS.violet },
          { label: "Avg Score",       value: `${d.avg_score    ?? 0}%`, icon: "📊", color: COLORS.green },
          { label: "Course Progress", value: `${d.completion   ?? 0}%`, icon: "📚", color: COLORS.gold },
        ]);
      } else {
        // Demo data
        setKpis([
          { label: "Total Students",  value: 48,    icon: "🎓", color: COLORS.cyan,   delta: "+3 this week" },
          { label: "Active Panels",   value: 2,     icon: "🎙️", color: COLORS.violet, delta: "Live now" },
          { label: "Avg Score",       value: "74%", icon: "📊", color: COLORS.green,  delta: "+5% this month" },
          { label: "Course Progress", value: "61%", icon: "📚", color: COLORS.gold,   delta: "On track" },
        ]);
      }

      if (lbRes.status === "fulfilled") {
        setLeaderboard(lbRes.value.data?.results || lbRes.value.data || []);
      } else {
        setLeaderboard([
          { rank: 1, name: "Priya Sharma",   score: 98, badge: "🥇" },
          { rank: 2, name: "Arjun Mehta",    score: 94, badge: "🥈" },
          { rank: 3, name: "Sachin Kumar",   score: 91, badge: "🥉" },
          { rank: 4, name: "Nisha Reddy",    score: 87 },
          { rank: 5, name: "Vikram Singh",   score: 83 },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) return (
    <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
      <ActivityIndicator color={COLORS.cyan} size="large" />
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.cyan} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Trainer Dashboard</Text>
        <Text style={styles.headerSub}>
          {isTrainer ? `Welcome, ${displayName}` : "View-only mode for learners"}
        </Text>
      </View>

      {/* KPI Grid */}
      <View style={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <View key={kpi.label} style={[styles.kpiCard, { borderColor: kpi.color + "40" }]}>
            <Text style={styles.kpiIcon}>{kpi.icon}</Text>
            <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
            {kpi.delta && <Text style={styles.kpiDelta}>{kpi.delta}</Text>}
          </View>
        ))}
      </View>

      {/* Leaderboard */}
      <Text style={styles.sectionTitle}>🏆 Student Leaderboard</Text>
      <View style={styles.leaderboard}>
        {leaderboard.map((entry) => (
          <View key={entry.rank} style={styles.leaderEntry}>
            <Text style={styles.leaderRank}>{entry.badge || `#${entry.rank}`}</Text>
            <Text style={styles.leaderName} numberOfLines={1}>{entry.name}</Text>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${entry.score}%` as any, backgroundColor: entry.rank === 1 ? COLORS.gold : entry.rank === 2 ? COLORS.muted : entry.rank === 3 ? COLORS.orange : COLORS.border }]} />
            </View>
            <Text style={styles.leaderScore}>{entry.score}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  content:       { padding: SPACING.lg, paddingBottom: 40 },
  header:        { marginBottom: SPACING.lg },
  headerTitle:   { fontSize: FONT.size.xl, fontWeight: "700", color: COLORS.text },
  headerSub:     { color: COLORS.muted, fontSize: FONT.size.sm, marginTop: 4 },

  kpiGrid:       { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginBottom: SPACING.xl },
  kpiCard:       { width: "47%", backgroundColor: COLORS.panel, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, alignItems: "center" },
  kpiIcon:       { fontSize: 28, marginBottom: SPACING.xs },
  kpiValue:      { fontSize: FONT.size.xxl, fontWeight: "900", fontFamily: "monospace" },
  kpiLabel:      { color: COLORS.muted, fontSize: FONT.size.xs, textAlign: "center", marginTop: 3 },
  kpiDelta:      { color: COLORS.green, fontSize: FONT.size.xs, marginTop: 4 },

  sectionTitle:  { fontSize: FONT.size.lg, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.md },
  leaderboard:   { backgroundColor: COLORS.panel, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, overflow: "hidden" },
  leaderEntry:   { flexDirection: "row", alignItems: "center", padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.sm },
  leaderRank:    { width: 28, textAlign: "center", fontSize: FONT.size.md, color: COLORS.gold },
  leaderName:    { flex: 1, color: COLORS.text, fontSize: FONT.size.sm, fontWeight: "600" },
  scoreBar:      { width: 80, height: 6, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" },
  scoreBarFill:  { height: "100%", borderRadius: 3 },
  leaderScore:   { width: 32, textAlign: "right", color: COLORS.cyan, fontWeight: "700", fontSize: FONT.size.sm, fontFamily: "monospace" },
});