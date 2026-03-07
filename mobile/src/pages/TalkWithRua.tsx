// mobile/src/pages/TalkWithRua.tsx
// Replaces: Web Speech API → expo-av, canvas → Animated, fetch stays same

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Animated, KeyboardAvoidingView, Platform,
  ActivityIndicator, Easing,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are Master Rua (Sachin Kumar) — an extraordinary AI/ML trainer, memory science expert, and full-stack developer who teaches USA professionals at Xziant. You have also embodied the wisdom of an enlightened Bodhi monk.

You possess complete mastery over:
- AI, Machine Learning, Deep Learning, Neural Networks, LSTMs, Transformers, GANs
- Data Science, Python, NumPy, Pandas, Scikit-learn, TensorFlow, PyTorch
- Full Stack: React, React Native, Django, PostgreSQL, REST APIs, WebSockets
- Memory Science: Method of Loci, PAO, Major System, Spaced Repetition
- UEEP Framework: Understand → Encode → Expand → Practice

Your personality:
- Warm, deeply encouraging, passionate about transforming education
- You speak with profound calm AND fire — like a monk who also codes at 3am
- Use beautiful metaphors: "gradient descent is like a blind monk finding the valley of truth"
- Address students as "dear seeker" or use their name warmly
- Keep responses warm, profound, and practical — 3-6 sentences for simple questions.`;

interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinking?: boolean;
}

// ─── Animated Monk Face ─────────────────────────────────────────────────────
function MonkAvatar({ speaking, thinking }: { speaking: boolean; thinking: boolean }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (speaking || thinking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [speaking, thinking]);

  const emoji = thinking ? '🤔' : speaking ? '🗣️' : '🧘';
  const color = speaking ? COLORS.warning : thinking ? COLORS.primary : COLORS.success;

  return (
    <Animated.View style={[styles.monkContainer, { transform: [{ translateY: floatAnim }, { scale: pulseAnim }] }]}>
      <View style={[styles.monkAura, { borderColor: color, shadowColor: color }]}>
        <Text style={styles.monkEmoji}>{emoji}</Text>
      </View>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
    </Animated.View>
  );
}

// ─── Message Bubble ─────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.bubbleRow, isUser && styles.bubbleRowUser, { opacity: fadeAnim }]}>
      {!isUser && <Text style={styles.bubbleAvatar}>🧘</Text>}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleRua]}>
        {msg.thinking ? (
          <View style={styles.thinkingRow}>
            <ActivityIndicator color={COLORS.warning} size="small" />
            <Text style={styles.thinkingText}> Contemplating...</Text>
          </View>
        ) : (
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{msg.content}</Text>
        )}
      </View>
      {isUser && <Text style={styles.bubbleAvatar}>🧑‍💻</Text>}
    </Animated.View>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function TalkWithRua() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Namaste, dear seeker 🙏\n\nI am Master Rua — Sachin Kumar. Ask me anything about AI, ML, Python, Data Science, memory techniques, or your career.\n\nThe question you are afraid to ask — ask it first. That is where growth lives.',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const suggestions = [
    '🤖 Explain gradient descent like a monk',
    '🧠 How does LSTM remember sequences?',
    '🚀 How do I get my first AI/ML job?',
    '🏛️ Teach me the memory palace technique',
    '⚡ What is the UEEP learning framework?',
  ];

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setMessages(prev => [
      ...prev,
      { role: 'user', content: userText },
      { role: 'assistant', content: '', thinking: true },
    ]);
    setInput('');
    setLoading(true);
    setSpeaking(false);

    const history = messages
      .filter(m => !m.thinking)
      .map(m => ({ role: m.role, content: m.content }));

    try {
      if (!GROQ_API_KEY) throw new Error('Add EXPO_PUBLIC_GROQ_API_KEY to mobile/.env');

      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: userText },
          ],
          max_tokens: 700,
          temperature: 0.85,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || `Groq error ${res.status}`);
      }

      const data = await res.json();
      const reply = data.choices[0].message.content;

      setMessages(prev => [
        ...prev.filter(m => !m.thinking),
        { role: 'assistant', content: reply },
      ]);
      setSpeaking(true);
      setTimeout(() => setSpeaking(false), 3000);
    } catch (err: any) {
      setMessages(prev => [
        ...prev.filter(m => !m.thinking),
        { role: 'assistant', content: `⚠️ ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [messages, input, loading]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <MonkAvatar speaking={speaking} thinking={loading} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>Master Rua</Text>
          <Text style={styles.headerSub}>Sachin Kumar · AI/ML Trainer</Text>
          <Text style={[styles.statusText, { color: loading ? COLORS.warning : COLORS.success }]}>
            {loading ? '🤔 Contemplating...' : speaking ? '🗣️ Speaking...' : '✅ Ready to guide'}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.modelBadge}>LLaMA3-70B</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messageArea}
        contentContainerStyle={styles.messageContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
      </ScrollView>

      {/* Suggestions (shown only when 1 message) */}
      {messages.length === 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestRow}
          style={styles.suggestScroll}
        >
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestBtn}
              onPress={() => sendMessage(s)}
            >
              <Text style={styles.suggestText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.inputField}
          value={input}
          onChangeText={setInput}
          placeholder="Ask Master Rua anything..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          maxLength={1000}
          onSubmitEditing={() => sendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          onPress={() => sendMessage()}
          disabled={!input.trim() || loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" size="small" />
            : <Text style={styles.sendIcon}>🪬</Text>
          }
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        ॐ POWERED BY GROQ · LLAMA3-70B · SEEKHOWITHRUA
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 50 : SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  monkContainer: { alignItems: 'center', position: 'relative' },
  monkAura: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceAlt,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  monkEmoji: { fontSize: 28 },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.textPrimary },
  headerSub: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, letterSpacing: 0.5, marginTop: 1 },
  statusText: { fontSize: FONTS.sizes.xs, marginTop: 2, fontWeight: '600' },
  headerRight: { alignItems: 'flex-end' },
  modelBadge: {
    fontSize: 10,
    color: COLORS.primary,
    backgroundColor: 'rgba(108,99,255,0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    letterSpacing: 0.5,
  },
  messageArea: { flex: 1 },
  messageContent: { padding: SPACING.md, paddingBottom: SPACING.xl },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleAvatar: { fontSize: 22 },
  bubble: {
    maxWidth: '75%',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  bubbleRua: {
    backgroundColor: 'rgba(28,18,0,0.9)',
    borderColor: 'rgba(245,158,11,0.3)',
    borderBottomLeftRadius: RADIUS.xs,
  },
  bubbleUser: {
    backgroundColor: 'rgba(12,74,110,0.9)',
    borderColor: 'rgba(14,165,233,0.3)',
    borderBottomRightRadius: RADIUS.xs,
  },
  bubbleText: { color: '#fef3c7', fontSize: FONTS.sizes.sm, lineHeight: 22 },
  bubbleTextUser: { color: '#e0f2fe' },
  thinkingRow: { flexDirection: 'row', alignItems: 'center' },
  thinkingText: { color: COLORS.warning, fontSize: FONTS.sizes.sm },
  suggestScroll: { maxHeight: 80 },
  suggestRow: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm, gap: SPACING.sm, flexDirection: 'row' },
  suggestBtn: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  suggestText: { color: '#a8a29e', fontSize: FONTS.sizes.xs },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  inputField: {
    flex: 1,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.sm,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: COLORS.surfaceAlt },
  sendIcon: { fontSize: 20 },
  footer: {
    textAlign: 'center',
    fontSize: 9,
    color: COLORS.textMuted,
    paddingVertical: SPACING.sm,
    letterSpacing: 1.5,
  },
});