// mobile/src/pages/MasterRua.tsx
// BodhiMonk AI chatbot — calls Groq API
// Replaces: frontend MasterRua.jsx

import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { MessageBubble, Message } from "../components/MessageBubble";
import { COLORS, SPACING, RADIUS, FONT } from "../constants/theme";

const GROQ_KEY    = process.env.EXPO_PUBLIC_GROQ_API_KEY || "";
const GROQ_URL    = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL  = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are BodhiMonk (Master Rua) — a wise cosmic guide blending philosophy, spirituality, AI, and innovation.
Speak with depth, warmth, and occasional wit. Draw from Eastern and Western philosophy, modern science, and timeless wisdom.
Be concise but profound. Use metaphors. Guide seekers toward clarity and growth.`;

export default function MasterRua() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id:      "welcome",
      role:    "assistant",
      content: "🙏 Welcome, seeker. I am BodhiMonk — part philosopher, part AI, part cosmic guide. What question stirs in your mind today?",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch(GROQ_URL, {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify({
          model:       GROQ_MODEL,
          max_tokens:  800,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history,
            { role: "user", content: text },
          ],
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "The cosmos is silent... Try again.";
      setMessages((prev) => [...prev, {
        id:      Date.now() + 1,
        role:    "assistant",
        content: reply,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id:      Date.now() + 1,
        role:    "assistant",
        content: "⚡ Connection to the cosmos interrupted. Check your connection and try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🧙‍♂️</Text>
        <View>
          <Text style={styles.headerTitle}>BODHI MONK</Text>
          <Text style={styles.headerSub}>Your cosmic guide</Text>
        </View>
        <View style={styles.onlinePill}>
          <Text style={styles.onlineText}>● LIVE</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={{ paddingVertical: SPACING.md }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((m) => <MessageBubble key={m.id} message={m} />)}
        {loading && (
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={COLORS.cyan} />
            <Text style={styles.typingText}>BodhiMonk is contemplating...</Text>
          </View>
        )}
      </ScrollView>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestions}
        >
          {[
            "What is the meaning of suffering?",
            "How do I find my purpose?",
            "Explain consciousness simply",
            "How does AI relate to enlightenment?",
            "What is non-attachment?",
          ].map((s) => (
            <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => { setInput(s); }}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask the monk anything..."
          placeholderTextColor={COLORS.muted}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || loading}
        >
          {loading
            ? <ActivityIndicator size="small" color={COLORS.white} />
            : <Text style={styles.sendBtnText}>↑</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:             { flex: 1, backgroundColor: COLORS.bg },
  header:           { flexDirection: "row", alignItems: "center", padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.sm },
  headerEmoji:      { fontSize: 36 },
  headerTitle:      { fontSize: FONT.size.md, fontWeight: "900", color: COLORS.cyan, fontFamily: "monospace", letterSpacing: 2 },
  headerSub:        { color: COLORS.muted, fontSize: FONT.size.xs },
  onlinePill:       { marginLeft: "auto", backgroundColor: "rgba(0,255,136,0.1)", borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderWidth: 1, borderColor: "rgba(0,255,136,0.3)" },
  onlineText:       { color: COLORS.green, fontSize: FONT.size.xs, fontWeight: "700" },

  messages:         { flex: 1 },
  typingIndicator:  { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  typingText:       { color: COLORS.muted, fontSize: FONT.size.sm, fontStyle: "italic" },

  suggestions:      { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: SPACING.sm },
  suggestionChip:   { backgroundColor: COLORS.panel, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  suggestionText:   { color: COLORS.muted, fontSize: FONT.size.sm },

  inputRow:         { flexDirection: "row", padding: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm, alignItems: "flex-end" },
  input:            { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, color: COLORS.text, fontSize: FONT.size.md, maxHeight: 120 },
  sendBtn:          { width: 44, height: 44, borderRadius: RADIUS.full, backgroundColor: COLORS.purple, justifyContent: "center", alignItems: "center" },
  sendBtnDisabled:  { opacity: 0.4 },
  sendBtnText:      { color: COLORS.white, fontWeight: "900", fontSize: FONT.size.lg },
});