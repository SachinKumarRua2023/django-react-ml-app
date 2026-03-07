// mobile/src/pages/LoginSignupLogout.tsx
// Replaces: localStorage → SecureStore, useNavigate → authStore, form → RN inputs

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import api from '../services/api';

type Mode = 'login' | 'signup';

export default function LoginSignupLogout() {
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    role: 'learner' as 'learner' | 'trainer',
  });

  const update = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const resetForm = () => setForm({
    email: '', password: '', confirm_password: '',
    first_name: '', last_name: '', role: 'learner',
  });

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      setError('Email and password are required'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await api.post('api/login/', {
        email: form.email, password: form.password,
      });
      const { token, user } = res.data;
      await setAuth(token, user);
      // Navigation handled automatically by AppNavigator watching token
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await api.post('api/register/', {
        email: form.email,
        password: form.password,
        confirm_password: form.confirm_password,
        first_name: form.first_name,
        last_name: form.last_name,
        role: form.role,
      });
      const { token, user } = res.data;
      await setAuth(token, user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🧠</Text>
          <Text style={styles.appName}>Cosmos RUA</Text>
          <Text style={styles.tagline}>seekhowithrua · AI/ML Platform</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Tab Toggle */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => { setMode('login'); resetForm(); setError(''); }}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => { setMode('signup'); resetForm(); setError(''); }}
            >
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Error / Success */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}
          {!!success && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✅ {success}</Text>
            </View>
          )}

          {/* Signup-only fields */}
          {mode === 'signup' && (
            <>
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.first_name}
                    onChangeText={v => update('first_name', v)}
                    autoCapitalize="words"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.last_name}
                    onChangeText={v => update('last_name', v)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Role Selector */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleRow}>
                  {(['learner', 'trainer'] as const).map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
                      onPress={() => update('role', r)}
                    >
                      <Text style={[styles.roleBtnText, form.role === r && styles.roleBtnTextActive]}>
                        {r === 'learner' ? '🎓 Learner' : '🏫 Trainer'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              value={form.email}
              onChangeText={v => update('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={form.password}
              onChangeText={v => update('password', v)}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={form.confirm_password}
                onChangeText={v => update('confirm_password', v)}
                secureTextEntry
              />
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={mode === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>
                  {mode === 'login' ? '🚀 Login' : '✨ Create Account'}
                </Text>
            }
          </TouchableOpacity>

          {/* Footer toggle */}
          <Text style={styles.toggleText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text
              style={styles.toggleLink}
              onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); resetForm(); setError(''); }}
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </Text>
          </Text>
        </View>

        {/* Bottom tagline */}
        <Text style={styles.footer}>
          🧠 UEEP Framework · AI/ML · Full Stack · Seekhowithrua
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  logo: { fontSize: 56, marginBottom: SPACING.sm },
  appName: {
    fontSize: FONTS.sizes.xxxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONTS.sizes.sm },
  tabTextActive: { color: '#fff' },
  errorBox: {
    backgroundColor: 'rgba(255,61,113,0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: { color: COLORS.error, fontSize: FONTS.sizes.sm, textAlign: 'center' },
  successBox: {
    backgroundColor: 'rgba(0,214,143,0.1)',
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  successText: { color: COLORS.success, fontSize: FONTS.sizes.sm, textAlign: 'center' },
  row: { flexDirection: 'row' },
  inputGroup: { marginBottom: SPACING.md },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.sm,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: FONTS.sizes.md,
  },
  roleRow: { flexDirection: 'row', gap: SPACING.sm },
  roleBtn: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
  },
  roleBtnActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(108,99,255,0.15)' },
  roleBtnText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontWeight: '600' },
  roleBtnTextActive: { color: COLORS.primary },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: FONTS.sizes.lg, letterSpacing: 0.5 },
  toggleText: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
  toggleLink: { color: COLORS.primary, fontWeight: '700', textDecorationLine: 'underline' },
  footer: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: FONTS.sizes.xs,
    marginTop: SPACING.xl,
    letterSpacing: 1,
  },
});