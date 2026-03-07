// mobile/src/pages/SyllabusPage.tsx
// Heavy web page → clean native version: courses browser + quiz launcher
// Pyodide (browser Python) → NOT available on mobile; quiz redirects to TalkWithRua
// Full quiz platform would need a separate Python API — placeholder added

import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, FlatList, SectionList,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';

// ─── Syllabus Data (same as web) ──────────────────────────────────────────
const syllabusData = {
  mysql:  { title: 'MySQL Database',    icon: '🗄️', color: '#00758f', modules: { 'Basics': ['Introduction to RDBMS','SQL Syntax & Data Types','SELECT Statement Deep Dive','WHERE Clause & Operators','ORDER BY & Sorting','LIMIT & Pagination'], 'Intermediate': ['JOINS (INNER, LEFT, RIGHT, FULL)','GROUP BY & HAVING Clauses','Subqueries & Nested Queries','Indexes & Query Optimization','Views & Virtual Tables','Stored Procedures'], 'Advanced': ['Triggers & Events','Transactions & ACID','Database Normalization','Query Performance Tuning','Replication & Scaling','Backup & Recovery'] } },
  python: { title: 'Python Programming', icon: '🐍', color: '#ffd43b', modules: { 'Core Python': ['Variables & Data Types','Control Flow & Loops','Functions & Scope','OOP Concepts','Exception Handling','File Operations'], 'Advanced Python': ['Decorators & Closures','Generators & Iterators','Multithreading & Multiprocessing','Async Programming (asyncio)','Memory Management','Metaclasses'], 'Backend Development': ['Django Framework Basics','Django REST Framework','Authentication & JWT','API Development','Testing & Debugging','Deployment Strategies'] } },
  react:  { title: 'React Development',  icon: '⚛️', color: '#61dafb', modules: { 'Fundamentals': ['JSX & Component Structure','Props & State Management','Hooks (useState, useEffect)','Event Handling','Conditional Rendering','Lists & Keys'], 'Advanced React': ['Context API','Redux Toolkit & RTK Query','Performance Optimization','Code Splitting & Lazy Loading','Custom Hooks','Error Boundaries'], 'Production Ready': ['Authentication Flows','Protected Routes','API Integration Patterns','Vite & Build Optimization','Testing (Jest, React Testing Library)','Deployment on Vercel'] } },
  ml:     { title: 'Machine Learning',   icon: '🤖', color: '#ff6b6b', modules: { 'Foundations': ['Linear Regression','Logistic Regression','K-Nearest Neighbors','Decision Trees','Support Vector Machines','Naive Bayes'], 'Advanced ML': ['Random Forest & Bagging','Gradient Boosting (XGBoost, LightGBM)','Feature Engineering','Hyperparameter Tuning','Cross Validation','Ensemble Methods'], 'Production ML': ['Model Evaluation Metrics','Model Serialization','ML APIs with Django/FastAPI','Docker Containerization','Clustering (KMeans, DBSCAN)','Real-world End-to-End Projects'] } },
  genai:  { title: 'Generative AI',      icon: '🧠', color: '#a855f7', modules: { 'LLM Fundamentals': ['Transformer Architecture','Tokenization (BPE, WordPiece)','Word Embeddings & Attention','Prompt Engineering Basics','Context Windows & Limits'], 'Advanced LLM': ['Fine-Tuning Strategies','RAG Architecture & Implementation','Vector Databases (Pinecone, Chroma)','LangChain & LlamaIndex','PEFT & LoRA','Model Quantization'], 'Production AI': ['Local LLM Deployment (llama.cpp, Ollama)','Building AI Chatbots','Voice AI Integration (Whisper, TTS)','Scaling AI Systems','Cost Optimization','Ethical AI Considerations'] } },
  django: { title: 'Django Full Stack',  icon: '🎯', color: '#092e20', modules: { 'Django Basics': ['MTV Architecture','Models & ORM','Views & URL Routing','Templates & Forms','Admin Interface','Static & Media Files'], 'Django Advanced': ['Class-Based Views','Middleware & Signals','Caching Strategies','Celery & Background Tasks','WebSockets & Channels','Security Best Practices'], 'Full Stack Integration': ['REST API Development','React-Django Integration','Authentication (OAuth, JWT)','Database Optimization','Testing & CI/CD','AWS/Render Deployment'] } },
};

type SubjectKey = keyof typeof syllabusData;
type ViewMode = 'courses' | 'quiz';

const QUIZ_INFO = [
  { lang: '🐍 Python', level: 'Basics', count: 25, color: '#ffd43b' },
  { lang: '🐍 Python', level: 'Intermediate', count: 25, color: '#f59e0b' },
  { lang: '🐍 Python', level: 'Advanced', count: 25, color: '#ef4444' },
  { lang: '🗄️ MySQL', level: 'Basics', count: 25, color: '#00758f' },
  { lang: '🗄️ MySQL', level: 'Intermediate', count: 25, color: '#0284c7' },
  { lang: '🗄️ MySQL', level: 'Advanced', count: 25, color: '#6366f1' },
];

export default function SyllabusPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('courses');
  const [activeSubject, setActiveSubject] = useState<SubjectKey>('python');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  const subject = syllabusData[activeSubject];
  const allTopics = Object.values(subject.modules).flat();
  const progress = Math.round((completedTopics.size / allTopics.length) * 100);

  const toggleTopic = (topic: string) => {
    const s = new Set(completedTopics);
    s.has(topic) ? s.delete(topic) : s.add(topic);
    setCompletedTopics(s);
  };

  return (
    <View style={styles.container}>
      {/* Top mode tabs */}
      <View style={styles.topTabs}>
        <TouchableOpacity
          style={[styles.topTab, viewMode === 'courses' && styles.topTabActive]}
          onPress={() => setViewMode('courses')}
        >
          <Text style={[styles.topTabText, viewMode === 'courses' && styles.topTabTextActive]}>📚 Courses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topTab, viewMode === 'quiz' && styles.topTabActive]}
          onPress={() => setViewMode('quiz')}
        >
          <Text style={[styles.topTabText, viewMode === 'quiz' && styles.topTabTextActive]}>🏆 Quizzes</Text>
        </TouchableOpacity>
      </View>

      {/* ── COURSES MODE ── */}
      {viewMode === 'courses' && (
        <>
          {/* Subject tabs horizontal scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subjectTabs}
            style={styles.subjectTabsScroll}
          >
            {(Object.entries(syllabusData) as [SubjectKey, typeof syllabusData.python][]).map(([key, data]) => (
              <TouchableOpacity
                key={key}
                style={[styles.subjectTab, activeSubject === key && { borderColor: data.color, backgroundColor: data.color + '18' }]}
                onPress={() => { setActiveSubject(key); setExpandedModule(null); setCompletedTopics(new Set()); }}
              >
                <Text style={styles.subjectIcon}>{data.icon}</Text>
                <Text style={[styles.subjectName, activeSubject === key && { color: data.color }]}>{data.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Progress bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: subject.color }]} />
            </View>
            <Text style={styles.progressText}>{progress}% · {completedTopics.size}/{allTopics.length}</Text>
          </View>

          {/* Module list */}
          <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.courseTitle}>{subject.icon} {subject.title}</Text>

            {Object.entries(subject.modules).map(([modName, topics]) => {
              const isExpanded = expandedModule === modName;
              const doneCnt = topics.filter(t => completedTopics.has(t)).length;
              const isDone = doneCnt === topics.length;
              return (
                <View key={modName} style={styles.moduleGroup}>
                  <TouchableOpacity
                    style={[styles.moduleHeader, isDone && styles.moduleHeaderDone]}
                    onPress={() => setExpandedModule(isExpanded ? null : modName)}
                  >
                    <Text style={styles.moduleToggle}>{isDone ? '✅' : isExpanded ? '▼' : '▶'}</Text>
                    <Text style={[styles.moduleName, isDone && { color: COLORS.success }]}>{modName}</Text>
                    <Text style={styles.moduleCount}>{doneCnt}/{topics.length}</Text>
                  </TouchableOpacity>
                  {isExpanded && topics.map((topic, i) => {
                    const done = completedTopics.has(topic);
                    return (
                      <TouchableOpacity
                        key={topic}
                        style={[styles.topicItem, done && styles.topicItemDone]}
                        onPress={() => toggleTopic(topic)}
                      >
                        <Text style={styles.topicBullet}>{done ? '✓' : '◇'}</Text>
                        <Text style={[styles.topicText, done && styles.topicTextDone]}>{topic}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* ── QUIZ MODE ── */}
      {viewMode === 'quiz' && (
        <ScrollView contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}>
          <Text style={styles.quizTitle}>🏆 Code Challenges</Text>
          <Text style={styles.quizSub}>75 Python + 75 MySQL challenges · CodeChef-style practice</Text>
          <View style={[styles.quizNotice, { borderColor: COLORS.warning }]}>
            <Text style={styles.quizNoticeIcon}>📱</Text>
            <Text style={styles.quizNoticeText}>
              Interactive Python execution runs in the web version.{'\n'}
              On mobile, use these challenges for study — test your answers in any Python environment.
            </Text>
          </View>
          {QUIZ_INFO.map((q, i) => (
            <View key={i} style={[styles.quizCard, { borderColor: q.color + '55' }]}>
              <View style={[styles.quizCardAccent, { backgroundColor: q.color }]} />
              <View style={styles.quizCardContent}>
                <Text style={styles.quizCardLang}>{q.lang}</Text>
                <Text style={styles.quizCardLevel}>{q.level}</Text>
                <Text style={styles.quizCardCount}>{q.count} Problems</Text>
              </View>
              <Text style={styles.quizCardArrow}>→</Text>
            </View>
          ))}

          {/* CTA to web */}
          <View style={styles.webCTA}>
            <Text style={styles.webCTATitle}>💻 Full Interactive Practice</Text>
            <Text style={styles.webCTAText}>Visit the web platform for real-time Python execution with automated grading.</Text>
            <Text style={styles.webCTAUrl}>seekhowithrua.vercel.app → Syllabus → Python Quiz</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topTabs: { flexDirection: 'row', padding: SPACING.sm, gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.surface },
  topTab: { flex: 1, padding: SPACING.sm, borderRadius: RADIUS.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  topTabActive: { backgroundColor: 'rgba(0,217,255,0.15)', borderColor: '#00d9ff' },
  topTabText: { color: COLORS.textMuted, fontWeight: '600', fontSize: FONTS.sizes.sm },
  topTabTextActive: { color: '#00d9ff' },
  subjectTabsScroll: { maxHeight: 80, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  subjectTabs: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm, flexDirection: 'row' },
  subjectTab: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  subjectIcon: { fontSize: 16 },
  subjectName: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm + 2, paddingHorizontal: SPACING.md },
  progressBar: { flex: 1, height: 5, backgroundColor: COLORS.surfaceAlt, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, width: 80 },
  courseTitle: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },
  moduleGroup: { marginBottom: SPACING.sm, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  moduleHeader: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.surface, gap: SPACING.sm },
  moduleHeaderDone: { backgroundColor: 'rgba(0,214,143,0.08)' },
  moduleToggle: { fontSize: FONTS.sizes.sm, width: 20 },
  moduleName: { flex: 1, fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  moduleCount: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, backgroundColor: COLORS.surfaceAlt, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  topicItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.sm, paddingHorizontal: SPACING.md + 4, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border },
  topicItemDone: { backgroundColor: 'rgba(0,214,143,0.05)' },
  topicBullet: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, width: 16 },
  topicText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 20 },
  topicTextDone: { color: COLORS.success, textDecorationLine: 'line-through' },
  // Quiz mode
  quizTitle: { fontSize: FONTS.sizes.xxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  quizSub: { fontSize: FONTS.sizes.sm, color: COLORS.textMuted, marginBottom: SPACING.lg },
  quizNotice: { flexDirection: 'row', gap: SPACING.sm, padding: SPACING.md, backgroundColor: 'rgba(255,170,0,0.08)', borderWidth: 1, borderRadius: RADIUS.md, marginBottom: SPACING.lg, alignItems: 'flex-start' },
  quizNoticeIcon: { fontSize: 20 },
  quizNoticeText: { flex: 1, fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 18 },
  quizCard: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  quizCardAccent: { width: 4, alignSelf: 'stretch' },
  quizCardContent: { flex: 1, padding: SPACING.md },
  quizCardLang: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textPrimary },
  quizCardLevel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 1 },
  quizCardCount: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: 2 },
  quizCardArrow: { fontSize: 20, color: COLORS.textMuted, paddingRight: SPACING.md },
  webCTA: { marginTop: SPACING.lg, padding: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.primary + '44', alignItems: 'center' },
  webCTATitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.primary, marginBottom: SPACING.sm },
  webCTAText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.sm },
  webCTAUrl: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, fontStyle: 'italic' },
});