// ============================================================
// SYLLABUS DATA FILE — Source of Truth
// Trainers can edit this via the UI (persisted in localStorage)
// Learners / guests get read-only access — no edit UI shown
// ============================================================

export const defaultSyllabusData = {
  datascience: {
    title: "Data Science & AI",
    icon: "🤖",
    color: "#a855f7",
    modules: {
      "Data Science Fundamentals": ["Python for Data Science", "NumPy & Pandas", "Data Visualization (Matplotlib, Seaborn)", "Statistical Analysis", "Data Cleaning & Preprocessing", "Feature Engineering"],
      "Machine Learning": ["Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Hyperparameter Tuning", "Ensemble Methods", "ML Pipelines"],
      "Deep Learning & AI": ["Neural Networks", "TensorFlow & PyTorch", "Computer Vision", "Natural Language Processing", "LLMs & Transformers", "Generative AI Applications"]
    },
    topicContent: {}
  },
  fullstack: {
    title: "Full Stack Development",
    icon: "💻",
    color: "#22d3ee",
    modules: {
      "Frontend Development": ["HTML5, CSS3, JavaScript", "React.js & Hooks", "State Management (Redux)", "Responsive Design", "Tailwind CSS", "TypeScript"],
      "Backend Development": ["Node.js & Express", "Django Framework", "REST API Design", "Authentication & Security", "Database Design", "Microservices"],
      "Mobile & Deployment": ["React Native", "Flutter Basics", "Docker & Kubernetes", "AWS/Cloud Services", "CI/CD Pipelines", "Production Deployment"]
    },
    topicContent: {}
  },
  gamerobotics: {
    title: "Game & Robotics",
    icon: "🎮",
    color: "#ff6b6b",
    modules: {
      "Game Development": ["Unity Basics", "C# for Game Dev", "3D Modeling", "Physics & Animation", "Game AI", "Multiplayer Systems"],
      "Robotics": ["Arduino Programming", "Raspberry Pi", "Sensors & Actuators", "ROS (Robot OS)", "Computer Vision for Robotics", "Autonomous Navigation"],
      "IoT & Embedded": ["Embedded C/C++", "IoT Protocols", "Smart Device Integration", "PCB Design", "Real-time Systems", "Project Building"]
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
