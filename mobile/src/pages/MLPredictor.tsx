// mobile/src/pages/MLPredictor.tsx
// YouTube Growth Predictor — React Native port
// Replaces: frontend MLPredictor.jsx

import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from "react-native";
import { api } from "../services/api";
import { COLORS, SPACING, RADIUS, FONT } from "../constants/theme";

interface Channel {
  channel_name: string;
  subscribers:  number;
  video_views:  number;
  uploads:      number;
}
interface Result {
  predicted_subscribers: number;
  predicted_video_views: number;
  similar_channels?: Channel[];
}

const fmt = (n?: number) => (n ? Number(n).toLocaleString() : "0");

export default function MLPredictor() {
  const [form,    setForm]    = useState({ subscribers: "", views: "", uploads: "" });
  const [result,  setResult]  = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!form.subscribers || !form.views || !form.uploads) {
      setError("Please fill all fields."); return;
    }
    try {
      setLoading(true);
      const res = await api.post("/api/ml/recommend/", {
        subscribers: Number(form.subscribers),
        views:       Number(form.views),
        uploads:     Number(form.uploads),
      });
      setResult(res.data);
    } catch {
      setError("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚀 YouTube Growth Predictor</Text>
        <Text style={styles.headerSub}>AI-powered channel analytics and prediction</Text>
      </View>

      {/* Input Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Channel Metrics</Text>

        {[
          { key: "subscribers", label: "Current Subscribers",  ph: "e.g. 10000" },
          { key: "views",       label: "Total Video Views",    ph: "e.g. 500000" },
          { key: "uploads",     label: "Total Uploads",        ph: "e.g. 50" },
        ].map((f) => (
          <View key={f.key} style={styles.formGroup}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              placeholder={f.ph}
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              value={form[f.key as keyof typeof form]}
              onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
            />
          </View>
        ))}

        {!!error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color={COLORS.bg} />
            : <Text style={styles.btnText}>🔮 Predict Growth</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Results */}
      {result && (
        <>
          <View style={styles.predRow}>
            <PredCard icon="📈" label="Predicted Subscribers" value={fmt(result.predicted_subscribers)} color={COLORS.cyan} />
            <PredCard icon="📺" label="Predicted Views"       value={fmt(result.predicted_video_views)} color={COLORS.violet} />
          </View>

          {result.similar_channels && result.similar_channels.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🔥 Top Similar Channels</Text>
              {result.similar_channels.map((ch, i) => (
                <View key={i} style={styles.channelCard}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.channelName}>{ch.channel_name}</Text>
                    <View style={styles.statsRow}>
                      <Stat label="Subscribers" value={fmt(ch.subscribers)} />
                      <Stat label="Views"        value={fmt(ch.video_views)} />
                      <Stat label="Uploads"      value={fmt(ch.uploads)} />
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

function PredCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={[styles.predCard, { borderColor: color + "50" }]}>
      <Text style={styles.predIcon}>{icon}</Text>
      <Text style={[styles.predValue, { color }]}>{value}</Text>
      <Text style={styles.predLabel}>{label}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  content:      { padding: SPACING.lg, paddingBottom: 40 },
  header:       { marginBottom: SPACING.lg },
  headerTitle:  { fontSize: FONT.size.xl, fontWeight: "700", color: COLORS.text },
  headerSub:    { color: COLORS.muted, fontSize: FONT.size.sm, marginTop: 4 },

  card:         { backgroundColor: COLORS.panel, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.lg },
  cardTitle:    { color: COLORS.cyan, fontSize: FONT.size.md, fontWeight: "700", marginBottom: SPACING.md },
  formGroup:    { marginBottom: SPACING.md },
  label:        { color: COLORS.muted, fontSize: FONT.size.xs, fontWeight: "600", marginBottom: SPACING.xs, letterSpacing: 1, fontFamily: "monospace" },
  input:        { backgroundColor: "rgba(0,0,0,0.45)", borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, fontSize: FONT.size.md },
  errorBox:     { backgroundColor: "rgba(255,45,120,0.1)", borderRadius: RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.sm, borderWidth: 1, borderColor: "rgba(255,45,120,0.3)" },
  errorText:    { color: COLORS.rose, fontSize: FONT.size.sm },
  btn:          { backgroundColor: COLORS.cyan, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: "center", marginTop: SPACING.sm },
  btnText:      { color: COLORS.bg, fontWeight: "700", fontSize: FONT.size.md },

  predRow:      { flexDirection: "row", gap: SPACING.md, marginBottom: SPACING.lg },
  predCard:     { flex: 1, backgroundColor: COLORS.panel2, borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, alignItems: "center" },
  predIcon:     { fontSize: 28, marginBottom: SPACING.xs },
  predValue:    { fontSize: FONT.size.xl, fontWeight: "800", fontFamily: "monospace" },
  predLabel:    { color: COLORS.muted, fontSize: FONT.size.xs, textAlign: "center", marginTop: SPACING.xs },

  sectionTitle: { color: COLORS.text, fontSize: FONT.size.lg, fontWeight: "700", marginBottom: SPACING.md },
  channelCard:  { flexDirection: "row", backgroundColor: COLORS.panel2, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.md, alignItems: "center" },
  rankBadge:    { width: 32, height: 32, borderRadius: RADIUS.full, backgroundColor: "rgba(0,245,255,0.1)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "rgba(0,245,255,0.3)" },
  rankText:     { color: COLORS.cyan, fontWeight: "700", fontSize: FONT.size.sm },
  channelName:  { color: COLORS.text, fontWeight: "700", fontSize: FONT.size.md, marginBottom: SPACING.xs },
  statsRow:     { flexDirection: "row", gap: SPACING.md, flexWrap: "wrap" },
  statLabel:    { color: COLORS.muted, fontSize: FONT.size.xs },
  statValue:    { color: COLORS.cyan, fontWeight: "700", fontSize: FONT.size.sm },
});