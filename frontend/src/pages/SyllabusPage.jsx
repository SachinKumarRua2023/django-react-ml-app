import { useState, useEffect } from "react";

// Embedded syllabus data
const syllabusData = {
  mysql: {
    title: "MySQL Database",
    icon: "🗄️",
    color: "#00758f",
    modules: {
      "Basics": ["Introduction to RDBMS", "SQL Syntax & Data Types", "SELECT Statement Deep Dive", "WHERE Clause & Operators", "ORDER BY & Sorting", "LIMIT & Pagination"],
      "Intermediate": ["JOINS (INNER, LEFT, RIGHT, FULL)", "GROUP BY & HAVING Clauses", "Subqueries & Nested Queries", "Indexes & Query Optimization", "Views & Virtual Tables", "Stored Procedures"],
      "Advanced": ["Triggers & Events", "Transactions & ACID", "Database Normalization", "Query Performance Tuning", "Replication & Scaling", "Backup & Recovery"]
    }
  },
  python: {
    title: "Python Programming",
    icon: "🐍",
    color: "#ffd43b",
    modules: {
      "Core Python": ["Variables & Data Types", "Control Flow & Loops", "Functions & Scope", "OOP Concepts", "Exception Handling", "File Operations"],
      "Advanced Python": ["Decorators & Closures", "Generators & Iterators", "Multithreading & Multiprocessing", "Async Programming (asyncio)", "Memory Management", "Metaclasses"],
      "Backend Development": ["Django Framework Basics", "Django REST Framework", "Authentication & JWT", "API Development", "Testing & Debugging", "Deployment Strategies"]
    }
  },
  react: {
    title: "React Development",
    icon: "⚛️",
    color: "#61dafb",
    modules: {
      "Fundamentals": ["JSX & Component Structure", "Props & State Management", "Hooks (useState, useEffect)", "Event Handling", "Conditional Rendering", "Lists & Keys"],
      "Advanced React": ["Context API", "Redux Toolkit & RTK Query", "Performance Optimization", "Code Splitting & Lazy Loading", "Custom Hooks", "Error Boundaries"],
      "Production Ready": ["Authentication Flows", "Protected Routes", "API Integration Patterns", "Vite & Build Optimization", "Testing (Jest, React Testing Library)", "Deployment on Vercel"]
    }
  },
  ml: {
    title: "Machine Learning",
    icon: "🤖",
    color: "#ff6b6b",
    modules: {
      "Foundations": ["Linear Regression", "Logistic Regression", "K-Nearest Neighbors", "Decision Trees", "Support Vector Machines", "Naive Bayes"],
      "Advanced ML": ["Random Forest & Bagging", "Gradient Boosting (XGBoost, LightGBM)", "Feature Engineering", "Hyperparameter Tuning", "Cross Validation", "Ensemble Methods"],
      "Production ML": ["Model Evaluation Metrics", "Model Serialization (Pickle, Joblib)", "ML APIs with Django/FastAPI", "Docker Containerization", "Clustering (KMeans, DBSCAN)", "Real-world End-to-End Projects"]
    }
  },
  genai: {
    title: "Generative AI",
    icon: "🧠",
    color: "#a855f7",
    modules: {
      "LLM Fundamentals": ["Transformer Architecture", "Tokenization (BPE, WordPiece)", "Word Embeddings & Attention", "Prompt Engineering Basics", "Context Windows & Limits"],
      "Advanced LLM": ["Fine-Tuning Strategies", "RAG Architecture & Implementation", "Vector Databases (Pinecone, Chroma)", "LangChain & LlamaIndex", "PEFT & LoRA", "Model Quantization"],
      "Production AI": ["Local LLM Deployment (llama.cpp, Ollama)", "Building AI Chatbots", "Voice AI Integration (Whisper, TTS)", "Scaling AI Systems", "Cost Optimization", "Ethical AI Considerations"]
    }
  },
  django: {
    title: "Django Full Stack",
    icon: "🎯",
    color: "#092e20",
    modules: {
      "Django Basics": ["MTV Architecture", "Models & ORM", "Views & URL Routing", "Templates & Forms", "Admin Interface", "Static & Media Files"],
      "Django Advanced": ["Class-Based Views", "Middleware & Signals", "Caching Strategies", "Celery & Background Tasks", "WebSockets & Channels", "Security Best Practices"],
      "Full Stack Integration": ["REST API Development", "React-Django Integration", "Authentication (OAuth, JWT)", "Database Optimization", "Testing & CI/CD", "AWS/Render Deployment"]
    }
  }
};

const generateContent = (topic) => ({
  title: topic,
  description: `Master ${topic} with hands-on examples and real-world projects.`,
  sections: [
    { heading: "Overview", text: "This topic covers fundamental concepts and practical implementation." },
    { heading: "Key Concepts", text: "Understanding the core principles and best practices." },
    { heading: "Practice Exercise", text: "Apply what you've learned with coding challenges." }
  ]
});

// Celebration component
const Celebration = ({ onClose }) => (
  <div className="celebration-overlay" onClick={onClose}>
    <div className="celebration-content" onClick={e => e.stopPropagation()}>
      <div className="celebration-emoji">🎉</div>
      <h2>Congratulations!</h2>
      <p>You've completed the entire course!</p>
      <div className="celebration-badges">
        <span>🏆</span>
        <span>⭐</span>
        <span>🎯</span>
      </div>
      <button className="btn btn-primary" onClick={onClose}>Continue Learning</button>
    </div>
    <div className="confetti">
      {[...Array(50)].map((_, i) => (
        <span key={i} style={{ 
          left: `${Math.random() * 100}%`, 
          animationDelay: `${Math.random() * 3}s`,
          background: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)]
        }} />
      ))}
    </div>
  </div>
);

// Module completion component
const ModuleComplete = ({ moduleName, onNext }) => (
  <div className="module-complete">
    <div className="complete-icon">✨</div>
    <h3>Module Complete!</h3>
    <p>You've finished <strong>{moduleName}</strong></p>
    <button className="btn btn-primary" onClick={onNext}>Next Module →</button>
  </div>
);

export default function SyllabusPage() {
  const [activeSubject, setActiveSubject] = useState("python");
  const [activeModule, setActiveModule] = useState(null);
  const [activeTopic, setActiveTopic] = useState("");
  const [content, setContent] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [completedModules, setCompletedModules] = useState(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [showModuleComplete, setShowModuleComplete] = useState(false);
  const [currentModuleComplete, setCurrentModuleComplete] = useState("");

  const currentSubject = syllabusData[activeSubject];
  const allModules = Object.keys(currentSubject.modules);
  const allTopics = allModules.flatMap(m => currentSubject.modules[m]);

  // Get current position
  const getCurrentPosition = () => {
    let topicIndex = 0;
    for (const module of allModules) {
      const topics = currentSubject.modules[module];
      const idx = topics.indexOf(activeTopic);
      if (idx !== -1) {
        return { module, moduleIndex: allModules.indexOf(module), topicIndex: idx, topics };
      }
      topicIndex += topics.length;
    }
    return null;
  };

  // Navigate to next topic
  const handleNext = () => {
    const pos = getCurrentPosition();
    if (!pos) return;

    const { module, moduleIndex, topicIndex, topics } = pos;
    
    // Mark current as completed
    const newCompleted = new Set(completedTopics);
    newCompleted.add(activeTopic);
    setCompletedTopics(newCompleted);

    // Check if module complete
    const moduleTopics = topics;
    const isLastTopicInModule = topicIndex === moduleTopics.length - 1;
    
    if (isLastTopicInModule) {
      // Mark module complete
      const newCompletedModules = new Set(completedModules);
      newCompletedModules.add(module);
      setCompletedModules(newCompletedModules);
      
      // Check if all modules complete
      if (newCompletedModules.size === allModules.length) {
        setShowCelebration(true);
        return;
      }
      
      // Show module complete screen
      setCurrentModuleComplete(module);
      setShowModuleComplete(true);
      setActiveModule(null);
      setActiveTopic("");
      setContent(null);
      return;
    }

    // Move to next topic
    const nextTopic = moduleTopics[topicIndex + 1];
    setActiveTopic(nextTopic);
    setContent(generateContent(nextTopic));
  };

  // Navigate to previous topic
  const handlePrevious = () => {
    const pos = getCurrentPosition();
    if (!pos || pos.topicIndex === 0) return;

    const { topics, topicIndex } = pos;
    const prevTopic = topics[topicIndex - 1];
    setActiveTopic(prevTopic);
    setContent(generateContent(prevTopic));
  };

  // Go to next module
  const handleNextModule = () => {
    const pos = getCurrentPosition();
    const nextModuleIndex = pos ? pos.moduleIndex + 1 : 0;
    
    if (nextModuleIndex < allModules.length) {
      const nextModule = allModules[nextModuleIndex];
      setActiveModule(nextModule);
      const firstTopic = currentSubject.modules[nextModule][0];
      setActiveTopic(firstTopic);
      setContent(generateContent(firstTopic));
      setShowModuleComplete(false);
    }
  };

  // Check if can go next/previous
  const canGoNext = activeTopic && completedTopics.size < allTopics.length;
  const canGoPrevious = activeTopic && getCurrentPosition()?.topicIndex > 0;

  // Calculate progress
  const progress = Math.round((completedTopics.size / allTopics.length) * 100);

  const handleSubjectChange = (key) => {
    setActiveSubject(key);
    setActiveModule(null);
    setActiveTopic("");
    setContent(null);
    setCompletedTopics(new Set());
    setCompletedModules(new Set());
    setShowCelebration(false);
    setShowModuleComplete(false);
  };

  const handleTopicClick = (topic, moduleName) => {
    setActiveTopic(topic);
    setActiveModule(moduleName);
    setContent(generateContent(topic));
    setShowModuleComplete(false);
    if (window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className="courses-page">
      {/* Celebration Overlay */}
      {showCelebration && <Celebration onClose={() => setShowCelebration(false)} />}

      {/* Subject Tabs */}
      <div className="subject-tabs">
        <div className="tabs-container">
          {Object.entries(syllabusData).map(([key, data]) => (
            <button
              key={key}
              className={`subject-tab ${activeSubject === key ? 'active' : ''}`}
              onClick={() => handleSubjectChange(key)}
              style={{ '--subject-color': data.color }}
            >
              <span className="tab-icon">{data.icon}</span>
              <span className="tab-text">{data.title}</span>
              {activeSubject === key && <div className="tab-glow" />}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="course-progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
        <span className="progress-text">{progress}% Complete</span>
      </div>

      {/* Main Content */}
      <div className="course-layout">
        {/* Sidebar */}
        <aside className={`course-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-header">
            <h3 className="sidebar-title">
              <span>{currentSubject.icon}</span>
              {currentSubject.title}
            </h3>
            <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>

          <div className="modules-list">
            {Object.entries(currentSubject.modules).map(([moduleName, topics]) => {
              const isModuleComplete = completedModules.has(moduleName);
              const isModuleActive = activeModule === moduleName;
              
              return (
                <div key={moduleName} className="module-group">
                  <button
                    className={`module-header ${isModuleActive ? 'active' : ''} ${isModuleComplete ? 'completed' : ''}`}
                    onClick={() => setActiveModule(isModuleActive ? null : moduleName)}
                  >
                    <span className="module-icon">
                      {isModuleComplete ? '✓' : isModuleActive ? '▼' : '▶'}
                    </span>
                    <span className="module-name">{moduleName}</span>
                    <span className={`topic-count ${isModuleComplete ? 'done' : ''}`}>
                      {isModuleComplete ? 'Done' : `${topics.filter(t => completedTopics.has(t)).length}/${topics.length}`}
                    </span>
                  </button>

                  {isModuleActive && (
                    <div className="topics-list">
                      {topics.map((topic, idx) => {
                        const isCompleted = completedTopics.has(topic);
                        const isActive = activeTopic === topic;
                        
                        return (
                          <button
                            key={topic}
                            className={`topic-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                            onClick={() => handleTopicClick(topic, moduleName)}
                            style={{ animationDelay: `${idx * 0.05}s` }}
                          >
                            <span className="topic-bullet">
                              {isCompleted ? '✓' : isActive ? '◆' : '◇'}
                            </span>
                            <span className="topic-text">{topic}</span>
                            {isActive && <span className="topic-active-indicator" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="sidebar-footer">
            <div className="ueep-mini">
              <span>Course Progress</span>
              <div className="ueep-progress">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <span className="progress-percent">{progress}%</span>
            </div>
          </div>
        </aside>

        {/* Content Viewer */}
        <main className="content-viewer">
          {showModuleComplete ? (
            <ModuleComplete moduleName={currentModuleComplete} onNext={handleNextModule} />
          ) : !content ? (
            <div className="welcome-screen">
              <div className="welcome-icon">{currentSubject.icon}</div>
              <h1>{currentSubject.title}</h1>
              <p>Select a topic from the sidebar to start learning</p>
              
              <div className="quick-stats">
                <div className="stat">
                  <span className="stat-value">{allTopics.length}</span>
                  <span className="stat-label">Topics</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{allModules.length}</span>
                  <span className="stat-label">Modules</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{completedTopics.size}</span>
                  <span className="stat-label">Completed</span>
                </div>
              </div>

              <div className="start-hint">
                <span className="hint-arrow">←</span>
                <span>Choose a module to begin</span>
              </div>
            </div>
          ) : (
            <div className="content-display">
              <div className="content-header">
                <div className="breadcrumb">
                  <span>{currentSubject.title}</span>
                  <span>›</span>
                  <span>{activeModule}</span>
                  <span>›</span>
                  <span className="active">{activeTopic}</span>
                </div>
                <div className="content-actions">
                  <button 
                    className={`action-btn ${completedTopics.has(activeTopic) ? 'completed' : ''}`} 
                    title="Mark Complete"
                    onClick={() => {
                      const newSet = new Set(completedTopics);
                      newSet.add(activeTopic);
                      setCompletedTopics(newSet);
                    }}
                  >
                    {completedTopics.has(activeTopic) ? '✓' : '○'}
                  </button>
                  <button className="action-btn" title="Bookmark">🔖</button>
                  <button className="action-btn" title="Share">↗</button>
                </div>
              </div>

              <article className="content-body">
                <h1 className="content-title">{content.title}</h1>
                <p className="content-description">{content.description}</p>

                {content.sections.map((section, idx) => (
                  <section key={idx} className="content-section">
                    <h3 className="section-heading">{section.heading}</h3>
                    <p className="section-text">{section.text}</p>
                  </section>
                ))}

                <div className="code-playground-teaser">
                  <div className="teaser-header">
                    <span>💻</span>
                    <span>Practice Code</span>
                  </div>
                  <div className="teaser-body">
                    <p>Interactive Python compiler coming soon...</p>
                    <button className="btn btn-primary">Open IDE</button>
                  </div>
                </div>
              </article>

              <div className="content-footer">
                <button 
                  className="nav-btn prev" 
                  onClick={handlePrevious}
                  disabled={!canGoPrevious}
                >
                  <span>←</span> Previous
                </button>
                
                <div className="progress-info">
                  <span>{completedTopics.size} / {allTopics.length} completed</span>
                  <div className="mini-progress">
                    <div style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <button 
                  className="nav-btn next" 
                  onClick={handleNext}
                  disabled={!canGoNext}
                >
                  {completedTopics.size === allTopics.length - 1 ? 'Finish 🎉' : 'Next →'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}