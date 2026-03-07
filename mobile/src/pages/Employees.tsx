// mobile/src/pages/Employees.tsx
// Team management CRUD — React Native port
// Replaces: frontend Employees.jsx
// Changes: confirm() → Alert.alert, CSS → StyleSheet, div → View, input → TextInput

import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { api } from "../services/api";
import { COLORS, SPACING, RADIUS, FONT } from "../constants/theme";

interface Employee {
  id:         number;
  name:       string;
  age:        number;
  department: string;
  salary:     number;
}

const EMPTY = { name: "", age: "", department: "", salary: "" };

export default function Employees() {
  const [employees,  setEmployees]  = useState<Employee[]>([]);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState<number | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/employees/");
      setEmployees(res.data);
    } catch (e: any) {
      console.error("Fetch Error:", e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.department || !form.salary) {
      Alert.alert("Validation", "All fields are required"); return;
    }
    const payload = {
      name:       form.name,
      age:        Number(form.age),
      department: form.department,
      salary:     Number(form.salary),
    };
    setSubmitting(true);
    try {
      if (editId) {
        await api.put(`/api/employees/${editId}/`, payload);
        setEditId(null);
      } else {
        await api.post("/api/employees/", payload);
      }
      setForm(EMPTY);
      fetchData();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (emp: Employee) => {
    setForm({
      name:       emp.name,
      age:        String(emp.age),
      department: emp.department,
      salary:     String(emp.salary),
    });
    setEditId(emp.id);
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert("Delete Member", `Remove ${name} from the team?`, [
      { text: "Cancel", style: "cancel" },
      {
        text:  "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/employees/${id}/`);
            fetchData();
          } catch {
            Alert.alert("Error", "Failed to delete.");
          }
        },
      },
    ]);
  };

  const handleCancel = () => { setEditId(null); setForm(EMPTY); };

  const DEPT_COLORS: Record<string, string> = {
    IT:        COLORS.cyan,
    Marketing: COLORS.violet,
    Sales:     COLORS.green,
    HR:        COLORS.gold,
    Design:    COLORS.aurora,
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>👥 Team Management</Text>
          <Text style={styles.headerSub}>Manage your team members</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{editId ? "✏️ Edit Member" : "➕ Add New Member"}</Text>

          {[
            { key: "name",       label: "Full Name",   ph: "Enter name",     type: "default" },
            { key: "age",        label: "Age",          ph: "Enter age",      type: "numeric" },
            { key: "department", label: "Department",   ph: "e.g. IT, Sales", type: "default" },
            { key: "salary",     label: "Salary (₹)",  ph: "Enter salary",   type: "numeric" },
          ].map((f) => (
            <View key={f.key} style={styles.inputGroup}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={f.ph}
                placeholderTextColor={COLORS.muted}
                keyboardType={f.type as any}
                value={form[f.key as keyof typeof form]}
                onChangeText={(v) => setForm((p) => ({ ...p, [f.key]: v }))}
              />
            </View>
          ))}

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[
                styles.submitBtn,
                editId ? styles.updateBtn : styles.addBtn,
                submitting && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color={COLORS.bg} size="small" />
                : <Text style={styles.submitBtnText}>{editId ? "💾 Update" : "➕ Add Member"}</Text>
              }
            </TouchableOpacity>
            {editId && (
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>❌ Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* List */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Team Members ({employees.length})</Text>
          {loading && <ActivityIndicator color={COLORS.cyan} size="small" />}
        </View>

        {employees.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyText}>No team members yet. Add the first one above!</Text>
          </View>
        ) : (
          employees.map((emp) => {
            const deptColor = DEPT_COLORS[emp.department] || COLORS.violet;
            return (
              <View key={emp.id} style={styles.empCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{emp.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.empInfo}>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.deptBadge, { backgroundColor: deptColor + "20", borderColor: deptColor + "40" }]}>
                      <Text style={[styles.deptText, { color: deptColor }]}>{emp.department}</Text>
                    </View>
                    <Text style={styles.empAge}>{emp.age} yrs</Text>
                  </View>
                  <Text style={styles.empSalary}>₹{Number(emp.salary).toLocaleString()}</Text>
                </View>
                <View style={styles.empActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(emp)}>
                    <Text>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(emp.id, emp.name)}>
                    <Text>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content:       { padding: SPACING.lg, paddingBottom: 40 },
  header:        { marginBottom: SPACING.lg },
  headerTitle:   { fontSize: FONT.size.xl, fontWeight: "700", color: COLORS.text },
  headerSub:     { color: COLORS.muted, fontSize: FONT.size.sm, marginTop: 4 },

  formCard:      { backgroundColor: COLORS.panel, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.lg },
  formTitle:     { color: COLORS.cyan, fontSize: FONT.size.md, fontWeight: "700", marginBottom: SPACING.md, fontFamily: "monospace" },
  inputGroup:    { marginBottom: SPACING.md },
  label:         { color: COLORS.muted, fontSize: FONT.size.xs, fontWeight: "600", marginBottom: SPACING.xs, letterSpacing: 1, fontFamily: "monospace" },
  input:         { backgroundColor: "rgba(0,0,0,0.45)", borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, fontSize: FONT.size.md },
  formActions:   { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.sm },
  submitBtn:     { flex: 1, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: "center" },
  addBtn:        { backgroundColor: COLORS.purple },
  updateBtn:     { backgroundColor: COLORS.orange },
  submitBtnText: { color: COLORS.white, fontWeight: "700", fontSize: FONT.size.md },
  cancelBtn:     { flex: 1, backgroundColor: COLORS.panel2, borderRadius: RADIUS.md, padding: SPACING.md, alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  cancelBtnText: { color: COLORS.rose, fontWeight: "600" },

  listHeader:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.md },
  listTitle:     { color: COLORS.text, fontSize: FONT.size.md, fontWeight: "700" },
  emptyState:    { alignItems: "center", paddingVertical: 40 },
  emptyIcon:     { fontSize: 48, marginBottom: SPACING.md },
  emptyText:     { color: COLORS.muted, textAlign: "center" },

  empCard:       { flexDirection: "row", backgroundColor: COLORS.panel2, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.sm, alignItems: "center", gap: SPACING.md },
  avatar:        { width: 46, height: 46, borderRadius: RADIUS.full, backgroundColor: "rgba(102,0,255,0.2)", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  avatarText:    { color: COLORS.violet, fontWeight: "800", fontSize: FONT.size.xl, fontFamily: "monospace" },
  empInfo:       { flex: 1 },
  empName:       { color: COLORS.text, fontWeight: "700", fontSize: FONT.size.md },
  badgeRow:      { flexDirection: "row", alignItems: "center", gap: SPACING.sm, marginTop: 3 },
  deptBadge:     { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full, borderWidth: 1 },
  deptText:      { fontSize: FONT.size.xs, fontWeight: "600" },
  empAge:        { color: COLORS.muted, fontSize: FONT.size.xs },
  empSalary:     { color: COLORS.green, fontWeight: "700", fontSize: FONT.size.sm, marginTop: 3 },
  empActions:    { gap: SPACING.xs },
  editBtn:       { backgroundColor: "rgba(255,149,0,0.15)", borderRadius: RADIUS.sm, padding: 8, borderWidth: 1, borderColor: "rgba(255,149,0,0.3)" },
  deleteBtn:     { backgroundColor: "rgba(255,45,120,0.12)", borderRadius: RADIUS.sm, padding: 8, borderWidth: 1, borderColor: "rgba(255,45,120,0.25)" },
});