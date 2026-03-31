import re

with open('frontend/src/pages/SyllabusPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the entire CourseQuizPlatform component with improved version
old_component_start = '// ============================================================\n// COURSE QUIZ PLATFORM (New - with module/topic structure)\n// ============================================================\nconst CourseQuizPlatform = ({ courseId, isMasterUser }) => {'

new_component = '''// ============================================================
// COURSE QUIZ PLATFORM (Professional UI/UX)
// ============================================================
const CourseQuizPlatform = ({ courseId, isMasterUser }) => {
  const course = courseQuizzes[courseId];
  const [activeModule, setActiveModule] = useState(null);
  const [activeTopic, setActiveTopic] = useState(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');
  const [completedQuizzes, setCompletedQuizzes] = useState(new Set());
  const [editMode, setEditMode] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  
  // Load Pyodide packages for Data Science
  useEffect(() => {
    if (courseId === 'datascience') {
      loadPyodide().then(async (py) => {
        try {
          await py.loadPackage('numpy');
          await py.loadPackage('pandas');
          console.log('Data Science packages loaded');
        } catch(e) {
          console.log('Package loading error:', e);
        }
      });
    }
  }, [courseId]);

  const handleTopicClick = (topic) => {
    setActiveTopic(topic);
    const quizzes = course.quizzes[topic.id] || [];
    if (quizzes.length > 0) {
      setCode(quizzes[0].starterCode || '');
    } else {
      if (topic.type === 'python') {
        setCode(`# Write your Python code here\\nprint("Hello Data Science!")`);
      } else if (topic.type === 'html') {
        setCode(`<!-- Write your HTML here -->\\n<h1>Hello Web!</h1>`);
      } else if (topic.type === 'mobile') {
        setCode(`<!-- React Native Style Mobile UI -->\\n<div class="View">\\n  <div class="Text">Hello Mobile!</div>\\n</div>`);
      }
    }
    setOutput('');
    setPreviewHTML('');
    setEditingQuiz(null);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('Running...');
    
    try {
      if (activeTopic?.type === 'python') {
        const result = await runPython(code);
        setOutput(result);
      } else if (activeTopic?.type === 'html') {
        const html = compileHTML(code);
        setPreviewHTML(html);
        setOutput('Preview rendered successfully!');
      } else if (activeTopic?.type === 'mobile') {
        const mobile = compileMobile(code);
        setPreviewHTML(mobile);
        setOutput('Mobile preview rendered!');
      }
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
    
    setIsRunning(false);
  };

  const handleSaveQuiz = () => {
    if (!editingQuiz || !activeTopic) return;
    
    const topicQuizzes = course.quizzes[activeTopic.id] || [];
    const existingIndex = topicQuizzes.findIndex(q => q.id === editingQuiz.id);
    
    if (existingIndex >= 0) {
      topicQuizzes[existingIndex] = editingQuiz;
    } else {
      topicQuizzes.push(editingQuiz);
    }
    
    course.quizzes[activeTopic.id] = topicQuizzes;
    setEditingQuiz(null);
    setEditMode(false);
    alert('Quiz saved successfully!');
  };

  const handleDeleteQuiz = (quizId) => {
    if (!activeTopic) return;
    const topicQuizzes = course.quizzes[activeTopic.id] || [];
    course.quizzes[activeTopic.id] = topicQuizzes.filter(q => q.id !== quizId);
    setEditingQuiz(null);
    alert('Quiz deleted!');
  };

  const currentQuizzes = activeTopic ? (course.quizzes[activeTopic.id] || []) : [];

  return (
    <div className="course-quiz-platform">
      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-header-left">
          <span className="course-icon">{course.icon}</span>
          <div className="quiz-header-info">
            <h2>{course.name}</h2>
            <span className="quiz-subtitle">Interactive Labs & Practice</span>
          </div>
        </div>
        {isMasterUser && (
          <div className="master-controls">
            <button 
              className={`master-btn ${editMode ? 'active' : ''}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? '✓ Done Editing' : '✏️ Edit Quizzes'}
            </button>
          </div>
        )}
      </div>
      
      <div className="quiz-layout">
        {/* Professional Sidebar */}
        <div className="quiz-sidebar-pro">
          <div className="sidebar-header">
            <span className="sidebar-title">📚 Course Modules</span>
            <span className="topic-count">
              {course.modules.reduce((acc, m) => acc + m.topics.length, 0)} topics
            </span>
          </div>
          
          <div className="modules-list">
            {course.modules.map((module) => (
              <div key={module.id} className={`module-card ${activeModule?.id === module.id ? 'expanded' : ''}`}>
                <button 
                  className="module-header"
                  onClick={() => setActiveModule(activeModule?.id === module.id ? null : module)}
                >
                  <span className="module-icon">{activeModule?.id === module.id ? '▼' : '▶'}</span>
                  <span className="module-name">{module.name}</span>
                  <span className="module-badge">{module.topics.length}</span>
                </button>
                
                {activeModule?.id === module.id && (
                  <div className="topics-list">
                    {module.topics.map((topic) => (
                      <button
                        key={topic.id}
                        className={`topic-item ${activeTopic?.id === topic.id ? 'active' : ''}`}
                        onClick={() => handleTopicClick(topic)}
                      >
                        <span className="topic-type-icon">
                          {topic.type === 'python' ? '🐍' : topic.type === 'html' ? '🌐' : '📱'}
                        </span>
                        <span className="topic-name">{topic.name}</span>
                        {course.quizzes[topic.id]?.length > 0 && (
                          <span className="quiz-indicator">📝</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Workspace - Full Width */}
        <div className="quiz-workspace-pro">
          {activeTopic ? (
            <>
              {/* Topic Header */}
              <div className="workspace-header">
                <div className="topic-info">
                  <span className="topic-type-badge">{activeTopic.type}</span>
                  <h3>{activeTopic.name}</h3>
                </div>
                {currentQuizzes.length > 0 && (
                  <div className="quiz-selector">
                    <select 
                      value={editingQuiz?.id || currentQuizzes[0]?.id}
                      onChange={(e) => {
                        const quiz = currentQuizzes.find(q => q.id === e.target.value);
                        if (quiz) setCode(quiz.starterCode);
                      }}
                    >
                      {currentQuizzes.map((quiz, idx) => (
                        <option key={quiz.id} value={quiz.id}>
                          Quiz {idx + 1}: {quiz.title}
                        </option>
                      ))}
                    </select>
                    {editMode && (
                      <button 
                        className="add-quiz-btn"
                        onClick={() => setEditingQuiz({
                          id: `new-${Date.now()}`,
                          title: 'New Quiz',
                          question: 'Enter question here...',
                          starterCode: '# Your starter code',
                          expectedOutput: ''
                        })}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Quiz Editor for Master Users */}
              {editMode && editingQuiz && (
                <div className="quiz-editor-panel">
                  <h4>✏️ Edit Quiz</h4>
                  <input
                    type="text"
                    value={editingQuiz.title}
                    onChange={(e) => setEditingQuiz({...editingQuiz, title: e.target.value})}
                    placeholder="Quiz Title"
                    className="quiz-edit-input"
                  />
                  <textarea
                    value={editingQuiz.question}
                    onChange={(e) => setEditingQuiz({...editingQuiz, question: e.target.value})}
                    placeholder="Question"
                    className="quiz-edit-textarea"
                    rows={2}
                  />
                  <textarea
                    value={editingQuiz.starterCode}
                    onChange={(e) => setEditingQuiz({...editingQuiz, starterCode: e.target.value})}
                    placeholder="Starter Code"
                    className="quiz-edit-textarea code"
                    rows={4}
                  />
                  <input
                    type="text"
                    value={editingQuiz.expectedOutput}
                    onChange={(e) => setEditingQuiz({...editingQuiz, expectedOutput: e.target.value})}
                    placeholder="Expected Output"
                    className="quiz-edit-input"
                  />
                  <div className="quiz-edit-actions">
                    <button className="save-quiz-btn" onClick={handleSaveQuiz}>💾 Save Quiz</button>
                    <button className="cancel-quiz-btn" onClick={() => setEditingQuiz(null)}>Cancel</button>
                    {editingQuiz.id && !editingQuiz.id.startsWith('new-') && (
                      <button className="delete-quiz-btn" onClick={() => handleDeleteQuiz(editingQuiz.id)}>🗑️ Delete</button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Question Display */}
              {currentQuizzes.length > 0 && !editMode && (
                <div className="question-panel">
                  <div className="question-box">
                    <span className="question-label">📝 Challenge:</span>
                    <p>{currentQuizzes[0].question}</p>
                  </div>
                </div>
              )}
              
              {/* Code & Preview Workspace */}
              <div className="editor-preview-split">
                {/* Left: Code Editor */}
                <div className="editor-section">
                  <div className="section-header">
                    <span className="section-icon">📝</span>
                    <span className="section-title">Code Editor ({activeTopic.type})</span>
                    <button 
                      className="run-btn-pro"
                      onClick={runCode}
                      disabled={isRunning}
                    >
                      {isRunning ? '⏳ Running...' : '▶️ Run Code'}
                    </button>
                  </div>
                  <div className="editor-container">
                    <textarea
                      className="code-editor-pro"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                      placeholder={`Write your ${activeTopic.type} code here...`}
                    />
                  </div>
                </div>
                
                {/* Right: Output / Preview */}
                <div className="preview-section">
                  <div className="section-header">
                    <span className="section-icon">
                      {activeTopic.type === 'python' ? '📤' : '👁️'}
                    </span>
                    <span className="section-title">
                      {activeTopic.type === 'python' ? 'Terminal Output' : 'Live Preview'}
                    </span>
                  </div>
                  <div className="preview-container-pro">
                    {activeTopic.type === 'python' ? (
                      <pre className="terminal-output">{output || '> Click "Run Code" to execute...'}</pre>
                    ) : previewHTML ? (
                      <iframe
                        srcDoc={previewHTML}
                        title="preview"
                        className="live-preview-frame"
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="preview-placeholder-pro">
                        <div className="placeholder-icon">👁️</div>
                        <p>Click "Run Code" to see live preview</p>
                        {activeTopic.type === 'mobile' && (
                          <p className="placeholder-hint">Mobile GUI will render here</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="welcome-screen">
              <div className="welcome-content">
                <div className="welcome-icon-large">{course.icon}</div>
                <h2>Welcome to {course.name}</h2>
                <p>Select a module and topic from the left sidebar to start coding</p>
                <div className="course-overview">
                  <div className="overview-stat">
                    <span className="stat-number">{course.modules.length}</span>
                    <span className="stat-label">Modules</span>
                  </div>
                  <div className="overview-stat">
                    <span className="stat-number">
                      {course.modules.reduce((acc, m) => acc + m.topics.length, 0)}
                    </span>
                    <span className="stat-label">Topics</span>
                  </div>
                  <div className="overview-stat">
                    <span className="stat-number">
                      {Object.keys(course.quizzes).length}
                    </span>
                    <span className="stat-label">Quizzes</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};'''

# Replace the old component
if old_component_start in content:
    # Find where the old component ends (next // === or export)
    pattern = r'// ============================================================\n// COURSE QUIZ PLATFORM.*?\n// ============================================================\n};'
    content = re.sub(pattern, new_component.strip(), content, flags=re.DOTALL)
    print('Replaced CourseQuizPlatform with improved version')
else:
    print('Could not find old component start')

with open('frontend/src/pages/SyllabusPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
