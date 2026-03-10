// ============================================================
// SYLLABUS DATA FILE — Source of Truth
// Trainers can edit this via the UI (persisted in localStorage)
// Learners / guests get read-only access — no edit UI shown
// ============================================================

export const defaultSyllabusData = {
  mysql: {
    title: "MySQL Database",
    icon: "🗄️",
    color: "#00758f",
    modules: {
      "Basics": ["Introduction to RDBMS", "SQL Syntax & Data Types", "SELECT Statement Deep Dive", "WHERE Clause & Operators", "ORDER BY & Sorting", "LIMIT & Pagination"],
      "Intermediate": ["JOINS (INNER, LEFT, RIGHT, FULL)", "GROUP BY & HAVING Clauses", "Subqueries & Nested Queries", "Indexes & Query Optimization", "Views & Virtual Tables", "Stored Procedures"],
      "Advanced": ["Triggers & Events", "Transactions & ACID", "Database Normalization", "Query Performance Tuning", "Replication & Scaling", "Backup & Recovery"]
    },
    topicContent: {}
  },
  python: {
    title: "Python Programming",
    icon: "🐍",
    color: "#ffd43b",
    modules: {
      "Core Python": ["Variables & Data Types", "Control Flow & Loops", "Functions & Scope", "OOP Concepts", "Exception Handling", "File Operations"],
      "Advanced Python": ["Decorators & Closures", "Generators & Iterators", "Multithreading & Multiprocessing", "Async Programming (asyncio)", "Memory Management", "Metaclasses"],
      "Backend Development": ["Django Framework Basics", "Django REST Framework", "Authentication & JWT", "API Development", "Testing & Debugging", "Deployment Strategies"]
    },
    topicContent: {}
  },
  react: {
    title: "React Development",
    icon: "⚛️",
    color: "#61dafb",
    modules: {
      "Fundamentals": ["JSX & Component Structure", "Props & State Management", "Hooks (useState, useEffect)", "Event Handling", "Conditional Rendering", "Lists & Keys"],
      "Advanced React": ["Context API", "Redux Toolkit & RTK Query", "Performance Optimization", "Code Splitting & Lazy Loading", "Custom Hooks", "Error Boundaries"],
      "Production Ready": ["Authentication Flows", "Protected Routes", "API Integration Patterns", "Vite & Build Optimization", "Testing (Jest, React Testing Library)", "Deployment on Vercel"]
    },
    topicContent: {}
  },
  ml: {
    title: "Machine Learning",
    icon: "🤖",
    color: "#ff6b6b",
    modules: {
      "Foundations": ["Linear Regression", "Logistic Regression", "K-Nearest Neighbors", "Decision Trees", "Support Vector Machines", "Naive Bayes"],
      "Advanced ML": ["Random Forest & Bagging", "Gradient Boosting (XGBoost, LightGBM)", "Feature Engineering", "Hyperparameter Tuning", "Cross Validation", "Ensemble Methods"],
      "Production ML": ["Model Evaluation Metrics", "Model Serialization (Pickle, Joblib)", "ML APIs with Django/FastAPI", "Docker Containerization", "Clustering (KMeans, DBSCAN)", "Real-world End-to-End Projects"]
    },
    topicContent: {}
  },
  genai: {
    title: "Generative AI",
    icon: "🧠",
    color: "#a855f7",
    modules: {
      "LLM Fundamentals": ["Transformer Architecture", "Tokenization (BPE, WordPiece)", "Word Embeddings & Attention", "Prompt Engineering Basics", "Context Windows & Limits"],
      "Advanced LLM": ["Fine-Tuning Strategies", "RAG Architecture & Implementation", "Vector Databases (Pinecone, Chroma)", "LangChain & LlamaIndex", "PEFT & LoRA", "Model Quantization"],
      "Production AI": ["Local LLM Deployment (llama.cpp, Ollama)", "Building AI Chatbots", "Voice AI Integration (Whisper, TTS)", "Scaling AI Systems", "Cost Optimization", "Ethical AI Considerations"]
    },
    topicContent: {}
  },
  django: {
    title: "Django Full Stack",
    icon: "🎯",
    color: "#092e20",
    modules: {
      "Django Basics": ["MTV Architecture", "Models & ORM", "Views & URL Routing", "Templates & Forms", "Admin Interface", "Static & Media Files"],
      "Django Advanced": ["Class-Based Views", "Middleware & Signals", "Caching Strategies", "Celery & Background Tasks", "WebSockets & Channels", "Security Best Practices"],
      "Full Stack Integration": ["REST API Development", "React-Django Integration", "Authentication (OAuth, JWT)", "Database Optimization", "Testing & CI/CD", "AWS/Render Deployment"]
    },
    topicContent: {}
  }
};

// ── Default content generator (fallback when no custom content set) ──
export const generateDefaultContent = (topic) => ({
  title: topic,
  description: `Master ${topic} with hands-on examples and real-world projects. This topic dives deep into core concepts, practical patterns, and production-ready techniques.`,
  sections: [
    {
      heading: "Overview",
      text: "This topic covers fundamental concepts and practical implementation strategies used in modern software development."
    },
    {
      heading: "Key Concepts",
      text: "Understanding the core principles and best practices that make this topic essential for professional developers."
    },
    {
      heading: "Practical Application",
      text: "Real-world usage patterns, common pitfalls to avoid, and performance considerations when working with this technology."
    },
    {
      heading: "Practice Exercise",
      text: "Apply what you've learned with hands-on coding challenges and mini-projects designed to reinforce these concepts."
    }
  ]
});

// ── Storage key for localStorage persistence ──
export const SYLLABUS_STORAGE_KEY = "cosmos_syllabus_data";

// ── Load syllabus: localStorage first, fallback to default ──
export const loadSyllabusData = () => {
  try {
    const stored = localStorage.getItem(SYLLABUS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Deep merge: ensure new default subjects are included if not in stored
      const merged = { ...defaultSyllabusData };
      Object.keys(parsed).forEach(key => {
        merged[key] = {
          ...defaultSyllabusData[key],
          ...parsed[key],
          topicContent: {
            ...(defaultSyllabusData[key]?.topicContent || {}),
            ...(parsed[key]?.topicContent || {})
          }
        };
      });
      return merged;
    }
  } catch (e) {
    console.warn("Failed to load syllabus from storage:", e);
  }
  return JSON.parse(JSON.stringify(defaultSyllabusData)); // deep clone
};

// ── Save syllabus to localStorage ──
export const saveSyllabusData = (data) => {
  try {
    localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save syllabus:", e);
    return false;
  }
};

// ── Reset syllabus to default ──
export const resetSyllabusData = () => {
  localStorage.removeItem(SYLLABUS_STORAGE_KEY);
  return JSON.parse(JSON.stringify(defaultSyllabusData));
};
