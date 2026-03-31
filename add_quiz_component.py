import re

# Read the current file
with open('frontend/src/pages/SyllabusPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# New CourseQuizPlatform component to insert before the old QuizPlatform
new_component = '''
// ============================================================
// COURSE QUIZ PLATFORM (New - with module/topic structure)
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
      // Default starter code based on topic type
      if (topic.type === 'python') {
        setCode('# Write your Python code here\\nprint("Hello Data Science!")');
      } else if (topic.type === 'html') {
        setCode('<!-- Write your HTML here -->\\n<h1>Hello Web!</h1>');
      } else if (topic.type === 'mobile') {
        setCode('<!-- React Native Style Mobile UI -->\\n<div class="View">\\n  <div class="Text">Hello Mobile!</div>\\n</div>');
      }
    }
    setOutput('');
    setPreviewHTML('');
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

  const currentQuizzes = activeTopic ? (course.quizzes[activeTopic.id] || []) : [];

  return (
    <div className="course-quiz-platform">
      <div className="quiz-header">
        <h2>{course.icon} {course.name} - Interactive Labs</h2>
      </div>
      
      <div className="quiz-layout">
        {/* Sidebar with modules and topics */}
        <div className="quiz-sidebar">
          {course.modules.map((module) => (
            <div key={module.id} className="quiz-module">
              <button 
                className={`quiz-module-header ${activeModule?.id === module.id ? 'active' : ''}`}
                onClick={() => setActiveModule(activeModule?.id === module.id ? null : module)}
              >
                <span>{activeModule?.id === module.id ? '▼' : '▶'}</span>
                {module.name}
              </button>
              
              {activeModule?.id === module.id && (
                <div className="quiz-topics">
                  {module.topics.map((topic) => (
                    <button
                      key={topic.id}
                      className={`quiz-topic ${activeTopic?.id === topic.id ? 'active' : ''}`}
                      onClick={() => handleTopicClick(topic)}
                    >
                      <span className="topic-icon">
                        {topic.type === 'python' ? '🐍' : topic.type === 'html' ? '🌐' : '📱'}
                      </span>
                      {topic.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Main content area */}
        <div className="quiz-main">
          {activeTopic ? (
            <>
              <div className="quiz-info">
                <h3>{activeTopic.name}</h3>
                {currentQuizzes.length > 0 && (
                  <div className="quiz-question">
                    <p>{currentQuizzes[0].question}</p>
                  </div>
                )}
              </div>
              
              <div className="quiz-workspace">
                {/* Code Editor */}
                <div className="code-panel">
                  <div className="panel-header">
                    <span>📝 Code Editor ({activeTopic.type})</span>
                    <button 
                      className="run-btn"
                      onClick={runCode}
                      disabled={isRunning}
                    >
                      {isRunning ? '⏳ Running...' : '▶️ Run Code'}
                    </button>
                  </div>
                  <textarea
                    className="code-editor"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                  />
                </div>
                
                {/* Output / Preview Panel */}
                <div className="output-panel">
                  <div className="panel-header">
                    <span>
                      {activeTopic.type === 'python' ? '📤 Output' : '👁️ Live Preview'}
                    </span>
                  </div>
                  
                  {activeTopic.type === 'python' ? (
                    <pre className="output-display">{output || 'Click "Run Code" to see output...'}</pre>
                  ) : (
                    <div className="preview-container">
                      {previewHTML ? (
                        <iframe
                          srcDoc={previewHTML}
                          title="preview"
                          className="preview-frame"
                          sandbox="allow-scripts"
                        />
                      ) : (
                        <div className="preview-placeholder">
                          Click "Run Code" to see live preview...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="quiz-welcome">
              <div className="welcome-icon">{course.icon}</div>
              <h3>Welcome to {course.name} Labs</h3>
              <p>Select a module and topic from the sidebar to start coding!</p>
              <div className="course-stats">
                <div className="stat">
                  <span className="stat-value">{course.modules.length}</span>
                  <span className="stat-label">Modules</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    {course.modules.reduce((acc, m) => acc + m.topics.length, 0)}
                  </span>
                  <span className="stat-label">Topics</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

'''

# Find where to insert - before the old QuizPlatform
insert_marker = '// ============================================================\n// QUIZ PLATFORM'

if insert_marker in content:
    content = content.replace(insert_marker, new_component + insert_marker)
    print('Added CourseQuizPlatform component')
else:
    print('Could not find insertion point')

# Write back
with open('frontend/src/pages/SyllabusPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
