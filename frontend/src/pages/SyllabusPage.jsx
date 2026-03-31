import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import MLVisuals from "../seekhowithrua-animation/MLVisuals";
import PythonVisuals from "../seekhowithrua-animation/PythonVisuals";
import WhiteBoard from "../seekhowithrua-animation/WhiteBoard";
import { loadPyodide, runPython } from "../quizzes/codeRunner";
import {
  loadSyllabusData,
  saveSyllabusData,
  resetSyllabusData,
  generateDefaultContent,
} from "./SyllabusData"; // Updated 2025-03-31
import "./SyllabusCourses.css"; // Cache bust 2025-03-31 v3

// API base URL - Updated 2025-03-31 v3
const API_URL = import.meta.env.VITE_API_URL || "https://django-react-ml-app.onrender.com/api/ml";

// ── Read user from localStorage ──
const getLoggedInUser = () => {
  try {
    const raw = localStorage.getItem("cosmos_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ── Check if user is master@gmail.com ──
const checkMaster = () => {
  const user = getLoggedInUser();
  const masterEmails = ["master@gmail.com", "seekhowithrua@gmail.com", "sachinrua@gmail.com"];
  return masterEmails.includes(user?.email) && !!user?.token;
};

// ── Tiny unique id helper ──
const uid = () => Math.random().toString(36).slice(2, 8);

// ── Check if user is trainer ──
const isTrainer = () => {
  const user = getLoggedInUser();
  if (!user) return false;
  const role = user?.profile?.role || user?.role || "";
  return role === "trainer";
};

// ============================================================
// COURSE LISTING COMPONENT - Beautiful grid layout
// ============================================================
const CourseCard = ({ course, onClick, isActive }) => {
  const topicCount = course.modules?.reduce((acc, mod) => acc + (mod.topics?.length || 0), 0) || 0;
  return (
    <div 
      className={`course-card ${isActive ? 'active' : ''}`}
      onClick={onClick}
      style={{ 
        borderColor: course.color,
        background: isActive ? `${course.color}20` : 'rgba(20, 20, 40, 0.8)'
      }}
    >
      <div className="course-icon" style={{ color: course.color }}>
        {course.icon}
      </div>
      <div className="course-info">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description || 'Learn with hands-on projects'}</p>
        <div className="course-modules-count">
          <span>{course.modules?.length || 0} modules • {topicCount} topics</span>
        </div>
      </div>
      <div className="course-glow" style={{ background: course.color }} />
    </div>
  );
};

const CourseListing = ({ courses, activeCourseId, onSelect, isMasterUser }) => {
  if (!courses || courses.length === 0) {
    return (
      <div className="no-courses">
        <span className="no-courses-icon">📚</span>
        <p>No courses available yet.</p>
        {isMasterUser && <p className="master-hint">As master, you can add courses from the Edit panel.</p>}
      </div>
    );
  }

  return (
    <div className="courses-grid">
      {courses.map(course => (
        <CourseCard 
          key={course.id}
          course={course}
          isActive={course.id === activeCourseId}
          onClick={() => onSelect(course.id)}
        />
      ))}
    </div>
  );
};

// ============================================================
// QUIZ DATA (unchanged — not touched)
// ============================================================
const pythonQuizzes = {
  basics: [
    { id:"pb1", level:"basics", tag:"DSA", title:"Reverse a List", question:"Write a function that reverses a list in-place without using built-in reverse().\nInput: [1,2,3,4,5]\nPrint the reversed list.", starterCode:'def reverse_list(lst):\n    # your code here\n    pass\n\nprint(reverse_list([1,2,3,4,5]))', expectedOutput:'[5, 4, 3, 2, 1]' },
    { id:"pb2", level:"basics", tag:"DSA", title:"Check Palindrome", question:"Write a function is_palindrome(s) that returns True if a string is a palindrome, False otherwise.\nTest with 'racecar' and 'hello'.", starterCode:'def is_palindrome(s):\n    # your code here\n    pass\n\nprint(is_palindrome(\'racecar\'))\nprint(is_palindrome(\'hello\'))', expectedOutput:'True\nFalse' },
    { id:"pb3", level:"basics", tag:"DSA", title:"Fibonacci Sequence", question:"Print the first 8 Fibonacci numbers starting from 0 using a loop.", starterCode:'# your code here', expectedOutput:'0 1 1 2 3 5 8 13' },
    { id:"pb4", level:"basics", tag:"DSA", title:"Find Duplicates", question:"Given a list [1,2,3,2,4,1,5], print all duplicate elements (unique duplicates, sorted).", starterCode:'lst = [1,2,3,2,4,1,5]\n# your code here', expectedOutput:'[1, 2]' },
    { id:"pb5", level:"basics", tag:"DSA", title:"Count Vowels", question:"Write a function that counts vowels in a string.\nTest: count_vowels('Hello World')", starterCode:'def count_vowels(s):\n    # your code here\n    pass\n\nprint(count_vowels(\'Hello World\'))', expectedOutput:'3' },
  ],
  intermediate: [
    { id:"pi1", level:"intermediate", tag:"DSA", title:"Binary Search", question:"Implement binary search. Search for 17 in [1,3,5,7,9,11,13,15,17,19].\nReturn the index.", starterCode:'def binary_search(arr, target):\n    # your code here\n    pass\n\nprint(binary_search([1,3,5,7,9,11,13,15,17,19], 17))', expectedOutput:'8' },
    { id:"pi2", level:"intermediate", tag:"DSA", title:"Merge Sort", question:"Implement merge sort and sort [38,27,43,3,9,82,10].", starterCode:'def merge_sort(arr):\n    # your code here\n    pass\n\nprint(merge_sort([38,27,43,3,9,82,10]))', expectedOutput:'[3, 9, 10, 27, 38, 43, 82]' },
  ],
  advanced: [
    { id:"pa1", level:"advanced", tag:"DSA", title:"Dijkstra's Shortest Path", question:"Dijkstra from node 0 in graph. Print shortest distances to all nodes.", starterCode:'import heapq\n\ndef dijkstra(graph, start):\n    dist = {n: float(\'inf\') for n in graph}\n    dist[start] = 0\n    pq = [(0, start)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in graph[u]:\n            if dist[u]+w < dist[v]:\n                dist[v] = dist[u]+w\n                heapq.heappush(pq,(dist[v],v))\n    return dist\n\ngraph = {0:[(1,4),(2,1)],1:[(3,1)],2:[(1,2),(3,5)],3:[]}\nfor k in sorted(dijkstra(graph,0)): print(f\'{k}: {dijkstra(graph,0)[k]}\')', expectedOutput:'0: 0\n1: 3\n2: 1\n3: 4' },
  ]
};

const mysqlQuizzes = {
  basics: [
    { id:"mb1", level:"basics", tag:"DDL", title:"Create Database", question:"Write SQL to create a database named 'school'.", starterCode:'CREATE DATABASE school;', expectedOutput:"Database 'school' created successfully." },
    { id:"mb2", level:"basics", tag:"DDL", title:"Create Table", question:"Create a table 'students' with id (INT PK AUTO_INCREMENT), name (VARCHAR 100), age (INT).", starterCode:'CREATE TABLE students (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(100),\n    age INT\n);', expectedOutput:"Table 'students' created successfully." },
  ],
  intermediate: [
    { id:"mi1", level:"intermediate", tag:"JOIN", title:"INNER JOIN", question:"Join students and grades tables on student_id. Select student name and grade.", starterCode:'SELECT s.name, g.grade\nFROM students s\nINNER JOIN grades g ON s.id = g.student_id;', expectedOutput:'Alice | 90\nBob | 85\nCharlie | 92' },
  ],
  advanced: [
    { id:"ma1", level:"advanced", tag:"OPTIMIZE", title:"EXPLAIN Query", question:"Use EXPLAIN to analyze a SELECT with WHERE clause. Show query plan.", starterCode:'EXPLAIN SELECT * FROM students WHERE age > 20;', expectedOutput:'id|select_type|table|type|key|rows\n1|SIMPLE|students|ALL|NULL|3' },
  ]
};

// ── Quiz LocalStorage Helpers ──
const QUIZ_STORAGE_KEY = 'cosmos_custom_quizzes';

const loadCustomQuizzes = () => {
  try {
    const stored = localStorage.getItem(QUIZ_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { python: {}, mysql: {} };
  } catch { return { python: {}, mysql: {} }; }
};

const saveCustomQuizzes = (quizzes) => {
  localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizzes));
};

const getAllQuizzes = (type) => {
  const custom = loadCustomQuizzes();
  const base = type === 'python' ? pythonQuizzes : mysqlQuizzes;
  const customForType = custom[type] || {};
  
  // Merge base and custom quizzes
  const merged = {
    basics: [...(base.basics || []), ...(customForType.basics || [])],
    intermediate: [...(base.intermediate || []), ...(customForType.intermediate || [])],
    advanced: [...(base.advanced || []), ...(customForType.advanced || [])],
  };
  return merged;
};


// ============================================================
// COURSE-BASED QUIZ DATA STRUCTURE
// ============================================================
const courseQuizzes = {
  datascience: {
    name: 'Data Science & AI',
    icon: '🤖',
    modules: [
      {
        id: 'python-basics',
        name: 'Python Basics',
        topics: [
          { id: 'variables', name: 'Variables & Data Types', type: 'python' },
          { id: 'operators', name: 'Operators', type: 'python' },
          { id: 'control-flow', name: 'If/Else & Loops', type: 'python' },
          { id: 'functions', name: 'Functions', type: 'python' }
        ]
      },
      {
        id: 'python-oop',
        name: 'Python OOP',
        topics: [
          { id: 'classes', name: 'Classes & Objects', type: 'python' },
          { id: 'inheritance', name: 'Inheritance', type: 'python' },
          { id: 'polymorphism', name: 'Polymorphism', type: 'python' },
          { id: 'encapsulation', name: 'Encapsulation', type: 'python' }
        ]
      },
      {
        id: 'file-handling',
        name: 'File Handling',
        topics: [
          { id: 'read-files', name: 'Reading Files', type: 'python' },
          { id: 'write-files', name: 'Writing Files', type: 'python' },
          { id: 'csv-files', name: 'CSV Handling', type: 'python' },
          { id: 'json-files', name: 'JSON Handling', type: 'python' }
        ]
      },
      {
        id: 'numpy',
        name: 'NumPy',
        topics: [
          { id: 'arrays', name: 'Arrays & Operations', type: 'python' },
          { id: 'array-manipulation', name: 'Array Manipulation', type: 'python' },
          { id: 'linear-algebra', name: 'Linear Algebra', type: 'python' },
          { id: 'statistical-ops', name: 'Statistical Operations', type: 'python' }
        ]
      },
      {
        id: 'pandas',
        name: 'Pandas',
        topics: [
          { id: 'dataframes', name: 'DataFrames', type: 'python' },
          { id: 'data-cleaning', name: 'Data Cleaning', type: 'python' },
          { id: 'grouping', name: 'Grouping & Aggregation', type: 'python' }
        ]
      }
    ],
    quizzes: {
      'variables': [
        { id: 'ds-py-1', title: 'Variable Assignment', question: 'Create variables a=10, b=20 and print their sum.', starterCode: '# Create variables and print sum\na = 10\nb = 20\nprint(a + b)', expectedOutput: '30' },
        { id: 'ds-py-2', title: 'Data Types', question: 'Print the type of variable x = 3.14', starterCode: "x = 3.14\n# Print the type of x\nprint(type(x))", expectedOutput: "<class 'float'>" }
      ],
      'arrays': [
        { id: 'ds-np-1', title: 'Create NumPy Array', question: 'Create a numpy array [1, 2, 3, 4, 5] and print it.', starterCode: 'import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint(arr)', expectedOutput: '[1 2 3 4 5]' },
        { id: 'ds-np-2', title: 'Array Sum', question: 'Create array [10, 20, 30] and print sum.', starterCode: 'import numpy as np\narr = np.array([10, 20, 30])\nprint(np.sum(arr))', expectedOutput: '60' }
      ]
    }
  },
  fullstack: {
    // ...
    icon: '💻',
    modules: [
      {
        id: 'html',
        name: 'HTML',
        topics: [
          { id: 'html-basics', name: 'HTML Basics', type: 'html' },
          { id: 'html-forms', name: 'Forms & Inputs', type: 'html' },
          { id: 'html-semantic', name: 'Semantic HTML', type: 'html' }
        ]
      },
      {
        id: 'css',
        name: 'CSS',
        topics: [
          { id: 'css-selectors', name: 'Selectors', type: 'html' },
          { id: 'css-layout', name: 'Layout & Flexbox', type: 'html' },
          { id: 'css-responsive', name: 'Responsive Design', type: 'html' }
        ]
      },
      {
        id: 'javascript',
        name: 'JavaScript',
        topics: [
          { id: 'js-basics', name: 'JS Basics', type: 'html' },
          { id: 'js-dom', name: 'DOM Manipulation', type: 'html' },
          { id: 'js-events', name: 'Events', type: 'html' }
        ]
      },
      {
        id: 'react',
        name: 'React',
        topics: [
          { id: 'react-components', name: 'Components', type: 'html' },
          { id: 'react-hooks', name: 'Hooks', type: 'html' },
          { id: 'react-state', name: 'State Management', type: 'html' }
        ]
      },
      {
        id: 'react-native',
        name: 'React Native',
        topics: [
          { id: 'rn-components', name: 'Mobile Components', type: 'mobile' },
          { id: 'rn-navigation', name: 'Navigation', type: 'mobile' },
          { id: 'rn-styling', name: 'Mobile Styling', type: 'mobile' }
        ]
      }
    ],
    quizzes: {
      'html-basics': [
        { id: 'fs-html-1', title: 'Basic Page', question: 'Create a heading with "Hello World"', starterCode: '<h1>Hello World</h1>', expectedOutput: 'visual' },
        { id: 'fs-html-2', title: 'Paragraph', question: 'Create a paragraph with some text', starterCode: '<p>This is a paragraph</p>', expectedOutput: 'visual' }
      ],
      'js-basics': [
        { id: 'fs-js-1', title: 'Alert Box', question: 'Show an alert with message', starterCode: '<script>alert("Hello!")</script>', expectedOutput: 'visual' }
      ]
    }
  },
  gaming: {
    name: 'Gaming & Robotics IoT',
    icon: '🎮',
    modules: [
      {
        id: 'game-dev',
        name: 'Game Development',
        topics: [
          { id: 'unity-basics', name: 'Unity Basics', type: 'python' },
          { id: 'game-physics', name: 'Physics', type: 'python' }
        ]
      },
      {
        id: 'robotics',
        name: 'Robotics',
        topics: [
          { id: 'robot-sensors', name: 'Sensors', type: 'python' },
          { id: 'robot-control', name: 'Control Systems', type: 'python' }
        ]
      },
      {
        id: 'iot',
        name: 'IoT',
        topics: [
          { id: 'arduino', name: 'Arduino Programming', type: 'python' },
          { id: 'sensors-iot', name: 'IoT Sensors', type: 'python' }
        ]
      }
    ],
    quizzes: {}
  }
};

// ============================================================
// PYODIDE RUNNER (unchanged)
// ============================================================
let pyodideInstance = null;
let pyodideLoading = false;
let pyodideCallbacks = [];

const loadPyodide = () => new Promise((resolve, reject) => {
  if (pyodideInstance) { resolve(pyodideInstance); return; }
  pyodideCallbacks.push({ resolve, reject });
  if (pyodideLoading) return;
  pyodideLoading = true;
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
  script.onload = async () => {
    try {
      const py = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
      pyodideInstance = py;
      pyodideCallbacks.forEach(cb => cb.resolve(py));
    } catch(e) { pyodideCallbacks.forEach(cb => cb.reject(e)); }
  };
  script.onerror = (e) => pyodideCallbacks.forEach(cb => cb.reject(e));
  document.head.appendChild(script);
});

const runPython = async (code) => {
  const py = await loadPyodide();
  await py.runPythonAsync(`import sys\nfrom io import StringIO\n_stdout = StringIO()\nsys.stdout = _stdout`);
  try {
    await py.runPythonAsync(code);
    const output = await py.runPythonAsync(`sys.stdout.getvalue()`);
    return output.toString().trim();
  } finally {
    await py.runPythonAsync(`sys.stdout = sys.__stdout__`);
  }
};

const runMySQL = (sql) => {
  const s = sql.trim().toLowerCase().replace(/\s+/g,' ');
  if (s.includes('create database')) return "Database 'school' created successfully.";
  if (s.includes('create table') && s.includes('students')) return "Table 'students' created successfully.";
  if (s.includes('inner join')) return "Alice | 90\nBob | 85\nCharlie | 92";
  if (s.includes('explain')) return "id|select_type|table|type|key|rows\n1|SIMPLE|students|ALL|NULL|3";
  return "Query executed successfully.";
};

// ============================================================
// HTML/CSS/JS COMPILER (for Full Stack)
// ============================================================
const compileHTML = (code) => {
  // Wrap user code in a complete HTML document
  const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px; 
      background: #1a1a2e;
      color: white;
    }
  </style>
</head>
<body>
  ${code}
  <script>
    // Capture console output
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog.apply(console, args);
    };
    // Auto-run scripts
    try {
      const scripts = document.querySelectorAll('script:not([src])');
      scripts.forEach(s => {
        try { eval(s.textContent); } catch(e) { logs.push('Error: ' + e.message); }
      });
    } catch(e) { logs.push('Error: ' + e.message); }
  <\/script>
</body>
</html>
  `;
  return fullHTML;
};

// ============================================================
// MOBILE GUI SIMULATOR (for React Native)
// ============================================================
const compileMobile = (code) => {
  // Convert React Native style to HTML for preview
  const mobileHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh; 
      background: #0f0f23;
    }
    .phone-frame {
      width: 375px;
      height: 667px;
      background: #000;
      border-radius: 40px;
      padding: 10px;
      box-shadow: 0 0 50px rgba(0,217,255,0.3);
      position: relative;
    }
    .phone-notch {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 150px;
      height: 30px;
      background: #000;
      border-radius: 0 0 20px 20px;
      z-index: 10;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      background: #1a1a2e;
      border-radius: 30px;
      overflow: hidden;
      position: relative;
    }
    .mobile-content {
      padding: 50px 20px 20px;
      height: 100%;
      overflow-y: auto;
    }
    /* React Native style mappings */
    .View { display: flex; flex-direction: column; }
    .Text { color: white; font-size: 16px; margin: 5px 0; }
    .Button { 
      background: #00d9ff; 
      color: black; 
      padding: 12px 24px; 
      border-radius: 8px; 
      border: none;
      margin: 10px 0;
      font-weight: bold;
      cursor: pointer;
    }
    .TextInput {
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      padding: 10px;
      border-radius: 8px;
      color: white;
      margin: 5px 0;
    }
    .ScrollView { overflow-y: auto; max-height: 100%; }
    .Image { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="phone-frame">
    <div class="phone-notch"></div>
    <div class="phone-screen">
      <div class="mobile-content">
        ${code}
      </div>
    </div>
  </div>
</body>
</html>
  `;
  return mobileHTML;
};

// ============================================================
// CODE EDITOR (unchanged)
// ============================================================
const CodeEditor = ({ value, onChange, language = 'python' }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newVal = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newVal);
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 4; }, 0);
    }
  };
  return (
    <div className="code-editor-wrapper">
      <div className="editor-toolbar">
        <span className="editor-lang">{language === 'python' ? '🐍 Python' : '🗄️ MySQL'}</span>
        <button className="clear-btn" onClick={() => onChange('')}>Clear</button>
      </div>
      <textarea className="code-textarea" value={value} onChange={e => onChange(e.target.value)} onKeyDown={handleKeyDown} spellCheck={false} autoComplete="off" />
    </div>
  );
};

// ============================================================
// QUIZ CARD (unchanged)
// ============================================================
const QuizCard = ({ quiz, quizType, onComplete, isCompleted }) => {
  const [code, setCode] = useState(quiz.starterCode);
  const [output, setOutput] = useState('');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);

  useEffect(() => { setCode(quiz.starterCode); setOutput(''); setResult(null); }, [quiz.id]);
  useEffect(() => {
    if (quizType === 'python') loadPyodide().then(() => setPyodideReady(true)).catch(() => {});
  }, [quizType]);

  const handleRun = async () => {
    setRunning(true); setOutput(''); setResult(null);
    try {
      const out = quizType === 'python' ? await runPython(code) : runMySQL(code);
      setOutput(out);
      const isCorrect = out.trim() === quiz.expectedOutput.trim() || out.trim().replace(/\s+/g,' ') === quiz.expectedOutput.trim().replace(/\s+/g,' ');
      setResult(isCorrect ? 'correct' : 'incorrect');
      if (isCorrect && !isCompleted) onComplete(quiz.id);
    } catch(e) { setOutput(`Error: ${e.message}`); setResult('error'); }
    setRunning(false);
  };

  const tagColors = { DSA:'#00d9ff', DATA:'#a855f7', FULLSTACK:'#ff6b6b', DDL:'#ffd43b', DML:'#00ff88', DQL:'#00d9ff', JOIN:'#ff9500', GROUP:'#a855f7', SUBQUERY:'#ff6b6b', OPTIMIZE:'#00d9ff', TRANSACTION:'#ff9500' };

  return (
    <div className={`quiz-card ${result === 'correct' ? 'correct' : result === 'incorrect' ? 'incorrect' : ''}`}>
      <div className="quiz-card-header">
        <div className="quiz-meta">
          <span className="quiz-tag" style={{background: tagColors[quiz.tag] || '#666'}}>{quiz.tag}</span>
          <span className="quiz-level">{quiz.level}</span>
          {isCompleted && <span className="quiz-done-badge">✓ Solved</span>}
        </div>
        <h2 className="quiz-title">{quiz.title}</h2>
      </div>
      <div className="quiz-question"><pre className="question-text">{quiz.question}</pre></div>
      <div className="quiz-workspace">
        <CodeEditor value={code} onChange={setCode} language={quizType} />
        <div className="quiz-controls">
          {quizType === 'python' && !pyodideReady && <span className="loading-badge">⏳ Loading Python runtime...</span>}
          <button className={`run-btn ${running ? 'running' : ''}`} onClick={handleRun} disabled={running || (quizType === 'python' && !pyodideReady)}>
            {running ? '⏳ Running...' : '▶ Run Code'}
          </button>
        </div>
        {output !== '' && (
          <div className={`output-panel ${result}`}>
            <div className="output-header">
              <span>{result === 'correct' ? '✅ Output (Correct!)' : result === 'incorrect' ? '❌ Output (Not quite...)' : '💥 Error'}</span>
              {result === 'incorrect' && <button className="show-expected-btn" onClick={() => setOutput(p => p + '\n\n--- Expected ---\n' + quiz.expectedOutput)}>Show Expected</button>}
            </div>
            <pre className="output-text">{output}</pre>
          </div>
        )}
      </div>
      {result === 'correct' && <div className="correct-banner">🎉 100% Correct! Excellent work!</div>}
      {result === 'incorrect' && <div className="hint-banner">💡 Not matching expected output. Check your logic and try again!</div>}
    </div>
  );
};


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
          await py.loadPackage('matplotlib');
          await py.loadPackage('scikit-learn');
          await py.runPythonAsync(`import micropip; await micropip.install('seaborn')`);
          console.log('Data Science packages loaded: numpy, pandas, matplotlib, sklearn, seaborn');
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
        setCode('# Write your Python code here\nprint("Hello Data Science!")');
      } else if (topic.type === 'html') {
        setCode('<!-- Write your HTML here -->\n<h1>Hello Web!</h1>');
      } else if (topic.type === 'mobile') {
        setCode('<!-- React Native Style Mobile UI -->\n<div class="View">\n  <div class="Text">Hello Mobile!</div>\n</div>');
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

// ============================================================
// QUIZ PLATFORM (unchanged)
// ============================================================
const Achievement = ({ message, icon, onClose }) => (
  <div className="achievement-popup" onClick={onClose}>
    <div className="achievement-content">
      <div className="achievement-icon">{icon}</div>
      <div className="achievement-text">{message}</div>
    </div>
  </div>
);

const QuizPlatform = ({ quizType, isMasterUser }) => {
  const [level, setLevel] = useState('basics');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(new Set());
  const [achievement, setAchievement] = useState(null);
  const [quizData, setQuizData] = useState(() => getAllQuizzes(quizType));
  const [quizEditorOpen, setQuizEditorOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  const questions = quizData[level] || [];
  const current = questions[currentIdx];
  const totalCompleted = completedQuizzes.size;
  const totalQuestions = Object.values(quizData).flat().length;
  const levelCompleted = questions.filter(q => completedQuizzes.has(q.id)).length;
  const progress = Math.round((totalCompleted / totalQuestions) * 100);
  const levelProgress = Math.round((levelCompleted / questions.length) * 100);

  const handleComplete = (qid) => {
    const newSet = new Set(completedQuizzes);
    newSet.add(qid);
    setCompletedQuizzes(newSet);
    const total = newSet.size;
    if (total === 1) setAchievement({ icon: '🌟', msg: "First solve! You're on your way!" });
    else if (total === 10) setAchievement({ icon: '🔥', msg: '10 Problems Solved! You\'re heating up!' });
    else if (total === 25) setAchievement({ icon: '💎', msg: 'Quarter Century! 25 Problems Done!' });
  };

  const handleSaveQuiz = (quiz) => {
    const custom = loadCustomQuizzes();
    const typeKey = quizType;
    if (!custom[typeKey]) custom[typeKey] = {};
    if (!custom[typeKey][quiz.level]) custom[typeKey][quiz.level] = [];
    
    if (editingQuiz) {
      // Update existing
      const idx = custom[typeKey][quiz.level].findIndex(q => q.id === quiz.id);
      if (idx >= 0) {
        custom[typeKey][quiz.level][idx] = quiz;
      } else {
        // Might have changed level, remove from old and add to new
        Object.keys(custom[typeKey]).forEach(lvl => {
          custom[typeKey][lvl] = custom[typeKey][lvl].filter(q => q.id !== quiz.id);
        });
        custom[typeKey][quiz.level].push(quiz);
      }
    } else {
      // Add new
      quiz.id = `${quizType === 'python' ? 'p' : 'm'}${quiz.level[0]}${Date.now()}`;
      custom[typeKey][quiz.level].push(quiz);
    }
    
    saveCustomQuizzes(custom);
    setQuizData(getAllQuizzes(quizType));
    setQuizEditorOpen(false);
    setEditingQuiz(null);
  };

  const handleDeleteQuiz = (quiz) => {
    if (!window.confirm(`Delete quiz "${quiz.title}"?`)) return;
    const custom = loadCustomQuizzes();
    const typeKey = quizType;
    if (custom[typeKey] && custom[typeKey][quiz.level]) {
      custom[typeKey][quiz.level] = custom[typeKey][quiz.level].filter(q => q.id !== quiz.id);
      saveCustomQuizzes(custom);
      setQuizData(getAllQuizzes(quizType));
      if (currentIdx >= questions.length - 1) setCurrentIdx(Math.max(0, questions.length - 2));
    }
  };

  const handleAddQuiz = () => {
    setEditingQuiz(null);
    setQuizEditorOpen(true);
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizEditorOpen(true);
  };

  const levels = ['basics', 'intermediate', 'advanced'];
  const levelIcons = { basics: '🌱', intermediate: '⚡', advanced: '🔥' };

  return (
    <div className="quiz-platform">
      {achievement && <Achievement icon={achievement.icon} message={achievement.msg} onClose={() => setAchievement(null)} />}
      
      {/* Quiz Editor Modal */}
      {quizEditorOpen && (
        <QuizEditorModal 
          quiz={editingQuiz}
          quizType={quizType}
          onSave={handleSaveQuiz}
          onClose={() => { setQuizEditorOpen(false); setEditingQuiz(null); }}
        />
      )}
      
      <div className="quiz-header">
        <div className="quiz-title-row">
          <span className="quiz-platform-icon">{quizType === 'python' ? '🐍' : '🗄️'}</span>
          <h1 className="quiz-platform-title">{quizType === 'python' ? 'Python' : 'MySQL'} Challenges</h1>
          <span className="quiz-subtitle">CodeChef-Style Practice</span>
          {isMasterUser && (
            <button className="quiz-add-btn" onClick={handleAddQuiz}>+ Add Quiz</button>
          )}
        </div>
        <div className="overall-progress">
          <span>{totalCompleted}/{totalQuestions} Solved</span>
          <div className="prog-bar"><div className="prog-fill" style={{width:`${progress}%`}}/></div>
          <span>{progress}%</span>
        </div>
      </div>
      <div className="level-tabs">
        {levels.map(lv => {
          const lvQ = quizData[lv] || [];
          const lvDone = lvQ.filter(q => completedQuizzes.has(q.id)).length;
          return (
            <button key={lv} className={`level-tab ${level === lv ? 'active' : ''}`} onClick={() => { setLevel(lv); setCurrentIdx(0); }}>
              <span>{levelIcons[lv]}</span>
              <span className="level-name">{lv.charAt(0).toUpperCase()+lv.slice(1)}</span>
              <span className="level-count">{lvDone}/{lvQ.length}</span>
            </button>
          );
        })}
      </div>
      <div className="quiz-layout">
        <aside className="quiz-sidebar">
          <div className="quiz-sidebar-header">
            <span>{levelIcons[level]} {level.charAt(0).toUpperCase()+level.slice(1)}</span>
            <span className="level-prog">{levelCompleted}/{questions.length}</span>
          </div>
          <div className="quiz-sidebar-progress"><div className="prog-bar"><div className="prog-fill" style={{width:`${levelProgress}%`}}/></div></div>
          <div className="quiz-list">
            {questions.map((q, idx) => {
              const done = completedQuizzes.has(q.id);
              const active = idx === currentIdx;
              return (
                <div key={q.id} className="quiz-list-item-wrapper">
                  <button className={`quiz-list-item ${active?'active':''} ${done?'done':''}`} onClick={() => setCurrentIdx(idx)}>
                    <span className="qli-num">{idx+1}</span>
                    <div className="qli-info">
                      <span className="qli-title">{q.title}</span>
                      <span className="qli-tag" style={{color: q.tag==='DSA'?'#00d9ff':q.tag==='DATA'?'#a855f7':'#ff6b6b'}}>{q.tag}</span>
                    </div>
                    {done ? <span className="qli-done">✓</span> : active ? <span className="qli-active">►</span> : null}
                  </button>
                  {isMasterUser && (
                    <div className="quiz-item-actions">
                      <button className="quiz-edit-sm" onClick={() => handleEditQuiz(q)}>✏️</button>
                      <button className="quiz-delete-sm" onClick={() => handleDeleteQuiz(q)}>🗑️</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
        <main className="quiz-main">
          {current && (
            <>
              <QuizCard key={current.id} quiz={current} quizType={quizType} onComplete={handleComplete} isCompleted={completedQuizzes.has(current.id)} />
              <div className="quiz-nav-bar">
                <button className="qnav-btn" disabled={currentIdx===0} onClick={() => setCurrentIdx(i=>i-1)}>← Previous</button>
                <span className="qnav-info">{currentIdx+1} / {questions.length}</span>
                <button className="qnav-btn" disabled={currentIdx===questions.length-1} onClick={() => setCurrentIdx(i=>i+1)}>Next →</button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// ============================================================
// QUIZ EDITOR MODAL — For Master Users to CRUD Quizzes
// ============================================================
const QuizEditorModal = ({ quiz, quizType, onSave, onClose }) => {
  const isEditing = !!quiz;
  const [draft, setDraft] = useState(() => quiz || {
    id: null,
    level: 'basics',
    tag: quizType === 'python' ? 'DSA' : 'DDL',
    title: '',
    question: '',
    starterCode: '',
    expectedOutput: ''
  });

  const levels = ['basics', 'intermediate', 'advanced'];
  const pythonTags = ['DSA', 'DATA', 'FULLSTACK'];
  const mysqlTags = ['DDL', 'DML', 'DQL', 'JOIN', 'GROUP', 'SUBQUERY', 'OPTIMIZE', 'TRANSACTION'];
  const tags = quizType === 'python' ? pythonTags : mysqlTags;

  const handleSave = () => {
    if (!draft.title.trim() || !draft.question.trim()) {
      alert('Title and question are required!');
      return;
    }
    onSave({ ...draft });
  };

  return (
    <div className="quiz-editor-overlay">
      <div className="quiz-editor-modal">
        <div className="qem-header">
          <h2>{isEditing ? '✏️ Edit Quiz' : '+ Add New Quiz'} <span style={{color:'#00d9ff'}}>({quizType})</span></h2>
          <button className="qem-close" onClick={onClose}>✕</button>
        </div>

        <div className="qem-body">
          <div className="qem-row">
            <div className="qem-field">
              <label>Level</label>
              <select value={draft.level} onChange={e => setDraft({...draft, level: e.target.value})}>
                {levels.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
            <div className="qem-field">
              <label>Tag</label>
              <select value={draft.tag} onChange={e => setDraft({...draft, tag: e.target.value})}>
                {tags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="qem-field">
            <label>Title</label>
            <input 
              type="text" 
              placeholder="Quiz title..." 
              value={draft.title} 
              onChange={e => setDraft({...draft, title: e.target.value})}
            />
          </div>

          <div className="qem-field">
            <label>Question / Problem Statement</label>
            <textarea 
              rows={4}
              placeholder="Describe the problem..." 
              value={draft.question} 
              onChange={e => setDraft({...draft, question: e.target.value})}
            />
          </div>

          <div className="qem-field">
            <label>Starter Code</label>
            <textarea 
              rows={6}
              className="code-area"
              placeholder={`Enter starter ${quizType} code...`}
              value={draft.starterCode} 
              onChange={e => setDraft({...draft, starterCode: e.target.value})}
            />
          </div>

          <div className="qem-field">
            <label>Expected Output</label>
            <textarea 
              rows={3}
              placeholder="Expected output..." 
              value={draft.expectedOutput} 
              onChange={e => setDraft({...draft, expectedOutput: e.target.value})}
            />
          </div>
        </div>

        <div className="qem-footer">
          <button className="qem-cancel" onClick={onClose}>Cancel</button>
          <button className="qem-save" onClick={handleSave}>
            {isEditing ? '💾 Save Changes' : '+ Add Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CELEBRATION & MODULE COMPLETE (unchanged)
// ============================================================
const Celebration = ({ onClose }) => (
  <div className="celebration-overlay" onClick={onClose}>
    <div className="celebration-content" onClick={e => e.stopPropagation()}>
      <div className="celebration-emoji">🎉</div>
      <h2>Congratulations!</h2>
      <p>You've completed the entire course!</p>
      <div className="celebration-badges"><span>🏆</span><span>⭐</span><span>🎯</span></div>
      <button className="btn btn-primary" onClick={onClose}>Continue Learning</button>
    </div>
    <div className="confetti">
      {[...Array(50)].map((_, i) => (
        <span key={i} style={{ left:`${Math.random()*100}%`, animationDelay:`${Math.random()*3}s`, background:['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff'][Math.floor(Math.random()*6)] }} />
      ))}
    </div>
  </div>
);

const ModuleComplete = ({ moduleName, onNext }) => (
  <div className="module-complete">
    <div className="complete-icon">✨</div>
    <h3>Module Complete!</h3>
    <p>You've finished <strong>{moduleName}</strong></p>
    <button className="btn btn-primary" onClick={onNext}>Next Module →</button>
  </div>
);

// ============================================================
// ── TRAINER EDITOR COMPONENTS ──
// ============================================================

// Inline editable text — double-click to edit
const InlineEdit = ({ value, onSave, className = '', multiline = false, placeholder = 'Click to edit...' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);

  useEffect(() => { if (editing && ref.current) ref.current.focus(); }, [editing]);

  const commit = () => {
    if (draft.trim()) onSave(draft.trim());
    else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    const props = {
      ref,
      className: `trainer-inline-input ${multiline ? 'multiline' : ''}`,
      value: draft,
      onChange: e => setDraft(e.target.value),
      onBlur: commit,
      onKeyDown: e => { if (!multiline && e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(value); setEditing(false); } }
    };
    return multiline ? <textarea {...props} rows={4} /> : <input {...props} />;
  }

  return (
    <span className={`trainer-editable ${className}`} onDoubleClick={() => { setDraft(value); setEditing(true); }} title="Double-click to edit">
      {value || <em style={{opacity:0.4}}>{placeholder}</em>}
      <span className="trainer-edit-hint">✏️</span>
    </span>
  );
};

// Confirm delete modal
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="confirm-overlay">
    <div className="confirm-modal">
      <div className="confirm-icon">⚠️</div>
      <p className="confirm-msg">{message}</p>
      <div className="confirm-actions">
        <button className="confirm-cancel" onClick={onCancel}>Cancel</button>
        <button className="confirm-delete" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

// Topic content editor modal (full body editor for trainers)
const ContentEditorModal = ({ topic, content, onSave, onClose }) => {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(content)));

  const updateSection = (idx, field, val) => {
    const s = [...draft.sections];
    s[idx] = { ...s[idx], [field]: val };
    setDraft({ ...draft, sections: s });
  };

  const addSection = () => setDraft({ ...draft, sections: [...draft.sections, { heading: 'New Section', text: 'Enter content here...' }] });
  const removeSection = (idx) => setDraft({ ...draft, sections: draft.sections.filter((_, i) => i !== idx) });
  const moveSection = (idx, dir) => {
    const s = [...draft.sections];
    const to = idx + dir;
    if (to < 0 || to >= s.length) return;
    [s[idx], s[to]] = [s[to], s[idx]];
    setDraft({ ...draft, sections: s });
  };

  return (
    <div className="content-editor-overlay">
      <div className="content-editor-modal">
        <div className="cem-header">
          <h2>✏️ Editing: <span style={{color:'#00d9ff'}}>{topic}</span></h2>
          <button className="cem-close" onClick={onClose}>✕</button>
        </div>

        <div className="cem-body">
          <div className="cem-field">
            <label>Topic Title</label>
            <input className="cem-input" value={draft.title} onChange={e => setDraft({...draft, title: e.target.value})} />
          </div>
          <div className="cem-field">
            <label>Description</label>
            <textarea className="cem-textarea" value={draft.description} onChange={e => setDraft({...draft, description: e.target.value})} rows={3} />
          </div>

          <div className="cem-sections-label">
            <span>Sections</span>
            <button className="cem-add-section" onClick={addSection}>+ Add Section</button>
          </div>

          {draft.sections.map((sec, idx) => (
            <div key={idx} className="cem-section-block">
              <div className="cem-section-controls">
                <span className="cem-section-num">§{idx+1}</span>
                <button className="cem-move-btn" onClick={() => moveSection(idx, -1)} disabled={idx===0}>↑</button>
                <button className="cem-move-btn" onClick={() => moveSection(idx, 1)} disabled={idx===draft.sections.length-1}>↓</button>
                <button className="cem-remove-section" onClick={() => removeSection(idx)}>✕</button>
              </div>
              <input className="cem-input" placeholder="Section heading" value={sec.heading} onChange={e => updateSection(idx, 'heading', e.target.value)} />
              <textarea className="cem-textarea" placeholder="Section content..." value={sec.text} onChange={e => updateSection(idx, 'text', e.target.value)} rows={4} />
            </div>
          ))}
        </div>

        <div className="cem-footer">
          <button className="cem-cancel" onClick={onClose}>Cancel</button>
          <button className="cem-save" onClick={() => { onSave(draft); onClose(); }}>💾 Save Content</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// TRAINER PANEL — Syllabus Structure Editor (sidebar panel)
// ============================================================
const TrainerSyllabusPanel = ({ syllabusData, activeSubject, onUpdateSyllabus, onClose }) => {
  const [confirm, setConfirm] = useState(null);
  const subject = syllabusData[activeSubject];

  const updateSubjectTitle = (val) => {
    onUpdateSyllabus(prev => ({
      ...prev,
      [activeSubject]: { ...prev[activeSubject], title: val }
    }));
  };

  const addModule = () => {
    const name = `New Module ${uid()}`;
    onUpdateSyllabus(prev => ({
      ...prev,
      [activeSubject]: {
        ...prev[activeSubject],
        modules: { ...prev[activeSubject].modules, [name]: ["New Topic"] }
      }
    }));
  };

  const renameModule = (oldName, newName) => {
    if (!newName || newName === oldName) return;
    onUpdateSyllabus(prev => {
      const modules = { ...prev[activeSubject].modules };
      const topics = modules[oldName];
      const ordered = Object.keys(modules);
      const idx = ordered.indexOf(oldName);
      const newModules = {};
      ordered.forEach((k, i) => { newModules[i === idx ? newName : k] = modules[k]; });
      return { ...prev, [activeSubject]: { ...prev[activeSubject], modules: newModules } };
    });
  };

  const deleteModule = (moduleName) => {
    onUpdateSyllabus(prev => {
      const modules = { ...prev[activeSubject].modules };
      delete modules[moduleName];
      return { ...prev, [activeSubject]: { ...prev[activeSubject], modules } };
    });
  };

  const addTopic = (moduleName) => {
    const topicName = `New Topic ${uid()}`;
    onUpdateSyllabus(prev => ({
      ...prev,
      [activeSubject]: {
        ...prev[activeSubject],
        modules: {
          ...prev[activeSubject].modules,
          [moduleName]: [...prev[activeSubject].modules[moduleName], topicName]
        }
      }
    }));
  };

  const renameTopic = (moduleName, oldTopic, newTopic) => {
    if (!newTopic || newTopic === oldTopic) return;
    onUpdateSyllabus(prev => ({
      ...prev,
      [activeSubject]: {
        ...prev[activeSubject],
        modules: {
          ...prev[activeSubject].modules,
          [moduleName]: prev[activeSubject].modules[moduleName].map(t => t === oldTopic ? newTopic : t)
        },
        topicContent: (() => {
          const tc = { ...prev[activeSubject].topicContent };
          if (tc[oldTopic]) { tc[newTopic] = tc[oldTopic]; delete tc[oldTopic]; }
          return tc;
        })()
      }
    }));
  };

  const deleteTopic = (moduleName, topic) => {
    onUpdateSyllabus(prev => ({
      ...prev,
      [activeSubject]: {
        ...prev[activeSubject],
        modules: {
          ...prev[activeSubject].modules,
          [moduleName]: prev[activeSubject].modules[moduleName].filter(t => t !== topic)
        }
      }
    }));
  };

  const moveTopic = (moduleName, topicIdx, dir) => {
    onUpdateSyllabus(prev => {
      const topics = [...prev[activeSubject].modules[moduleName]];
      const to = topicIdx + dir;
      if (to < 0 || to >= topics.length) return prev;
      [topics[topicIdx], topics[to]] = [topics[to], topics[topicIdx]];
      return { ...prev, [activeSubject]: { ...prev[activeSubject], modules: { ...prev[activeSubject].modules, [moduleName]: topics } } };
    });
  };

  return (
    <div className="trainer-panel">
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={() => { confirm.action(); setConfirm(null); }}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="trainer-panel-header">
        <div className="tph-title">
          <span className="tph-icon">⚙️</span>
          <span>Syllabus Editor</span>
        </div>
        <button className="tph-close" onClick={onClose}>✕</button>
      </div>

      <div className="trainer-panel-body">
        <div className="tp-field-row">
          <span className="tp-label">Course Title</span>
          <InlineEdit value={subject.title} onSave={updateSubjectTitle} className="tp-title-edit" />
        </div>

        <div className="tp-divider" />

        {Object.entries(subject.modules).map(([moduleName, topics]) => (
          <div key={moduleName} className="tp-module-block">
            <div className="tp-module-header">
              <span className="tp-module-drag">⠿</span>
              <InlineEdit
                value={moduleName}
                onSave={(val) => renameModule(moduleName, val)}
                className="tp-module-name"
                placeholder="Module name..."
              />
              <div className="tp-module-actions">
                <button className="tp-btn tp-btn-add" title="Add Topic" onClick={() => addTopic(moduleName)}>+</button>
                <button className="tp-btn tp-btn-del" title="Delete Module" onClick={() =>
                  setConfirm({ message: `Delete module "${moduleName}" and all its topics?`, action: () => deleteModule(moduleName) })
                }>🗑</button>
              </div>
            </div>

            <div className="tp-topics-list">
              {topics.map((topic, tIdx) => (
                <div key={topic + tIdx} className="tp-topic-row">
                  <span className="tp-topic-bullet">◇</span>
                  <InlineEdit
                    value={topic}
                    onSave={(val) => renameTopic(moduleName, topic, val)}
                    className="tp-topic-name"
                    placeholder="Topic name..."
                  />
                  <div className="tp-topic-actions">
                    <button className="tp-btn-sm" onClick={() => moveTopic(moduleName, tIdx, -1)} disabled={tIdx===0} title="Move up">↑</button>
                    <button className="tp-btn-sm" onClick={() => moveTopic(moduleName, tIdx, 1)} disabled={tIdx===topics.length-1} title="Move down">↓</button>
                    <button className="tp-btn-sm tp-del-sm" onClick={() =>
                      setConfirm({ message: `Delete topic "${topic}"?`, action: () => deleteTopic(moduleName, topic) })
                    } title="Delete">✕</button>
                  </div>
                </div>
              ))}
              <button className="tp-add-topic-btn" onClick={() => addTopic(moduleName)}>
                <span>+</span> Add Topic
              </button>
            </div>
          </div>
        ))}

        <button className="tp-add-module-btn" onClick={addModule}>
          <span>+</span> Add New Module
        </button>
      </div>
    </div>
  );
};
// MAIN SYLLABUS PAGE
// ============================================================
export default function SyllabusPage() {
  const [trainerMode, setTrainerMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isMasterUser, setIsMasterUser] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syllabusData, setSyllabusData] = useState({});
  const [savedIndicator, setSavedIndicator] = useState(false);

  // Convert API courses to syllabus format
  const apiSyllabusData = useCallback(() => {
    const data = {};
    courses.forEach(course => {
      const modules = {};
      course.modules?.forEach(mod => {
        modules[mod.title] = mod.topics?.map(t => t.title) || [];
      });
      data[course.id] = {
        title: course.title,
        icon: course.icon,
        color: course.color,
        description: course.description,
        modules,
        topicContent: {}
      };
    });
    return data;
  }, [courses]);

  const updateSyllabus = useCallback((updater) => {
    setSyllabusData(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveSyllabusData(next);
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
      return next;
    });
  }, []);

  const [viewMode, setViewMode] = useState('courses');
  const [orbOpen, setOrbOpen] = useState(false);
  const [quizOrbOpen, setQuizOrbOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState("datascience");
  const [activeModule, setActiveModule] = useState(null);
  const [activeTopic, setActiveTopic] = useState("");
  const [content, setContent] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [completedModules, setCompletedModules] = useState(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [showModuleComplete, setShowModuleComplete] = useState(false);
  const [currentModuleComplete, setCurrentModuleComplete] = useState("");
  const [trainerPanelOpen, setTrainerPanelOpen] = useState(false);
  const [contentEditorOpen, setContentEditorOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingContent, setEditingContent] = useState(null);

  // Hardcoded 3 courses - Seekhowithrua Bundle Pack
  useEffect(() => {
    const bundleCourses = [
      {
        id: 'datascience',
        title: 'Data Science & AI',
        icon: '🤖',
        color: '#a855f7',
        description: 'Master Data Science, Machine Learning, and AI with Python',
        modules: [
          { id: 1, title: 'Module 1: Python for Data Science', order: 0, topics: [
            { id: 0, title: 'Python Basics for Data Science', order: 0 },
            { id: 1, title: 'NumPy and Pandas Fundamentals', order: 1 },
            { id: 2, title: 'Data Manipulation Techniques', order: 2 }
          ]},
          { id: 2, title: 'Module 2: Data Science Libraries', order: 1, topics: [
            { id: 0, title: 'Advanced Pandas Operations', order: 0 },
            { id: 1, title: 'Matplotlib and Seaborn', order: 1 },
            { id: 2, title: 'Data Visualization Techniques', order: 2 }
          ]},
          { id: 3, title: 'Module 3: Exploratory Data Analysis (EDA)', order: 2, topics: [
            { id: 0, title: 'Understanding Data Distribution', order: 0 },
            { id: 1, title: 'Statistical Summary and Correlation', order: 1 },
            { id: 2, title: 'Data Cleaning and Preprocessing', order: 2 }
          ]},
          { id: 4, title: 'Module 4: SQL for Data Science', order: 3, topics: [
            { id: 0, title: 'SQL Basics and Queries', order: 0 },
            { id: 1, title: 'Joins and Subqueries', order: 1 },
            { id: 2, title: 'Database Design for Data Science', order: 2 }
          ]},
          { id: 5, title: 'Module 5: Business Intelligence (PowerBI & Tableau)', order: 4, topics: [
            { id: 0, title: 'PowerBI Fundamentals', order: 0 },
            { id: 1, title: 'Tableau Dashboard Creation', order: 1 },
            { id: 2, title: 'Data Storytelling and Reporting', order: 2 }
          ]},
          { id: 6, title: 'Module 6: Statistics & Probability for Data Science', order: 5, topics: [
            { id: 0, title: 'Descriptive Statistics', order: 0 },
            { id: 1, title: 'Probability Distributions', order: 1 },
            { id: 2, title: 'Hypothesis Testing', order: 2 }
          ]},
          { id: 7, title: 'Module 7: Advanced Statistics for Data Science', order: 6, topics: [
            { id: 0, title: 'Regression Analysis', order: 0 },
            { id: 1, title: 'ANOVA and Chi-Square Tests', order: 1 },
            { id: 2, title: 'Time Series Analysis', order: 2 }
          ]},
          { id: 8, title: 'Module 8: Machine Learning & Classification', order: 7, topics: [
            { id: 0, title: 'Supervised Learning Algorithms', order: 0 },
            { id: 1, title: 'Classification Models', order: 1 },
            { id: 2, title: 'Model Evaluation Metrics', order: 2 }
          ]},
          { id: 9, title: 'Module 9: Model Optimization & Deep Learning', order: 8, topics: [
            { id: 0, title: 'Hyperparameter Tuning', order: 0 },
            { id: 1, title: 'Neural Network Fundamentals', order: 1 },
            { id: 2, title: 'Deep Learning with TensorFlow', order: 2 }
          ]},
          { id: 10, title: 'Module 10: GenAI & MLOps', order: 9, topics: [
            { id: 0, title: 'Generative AI Concepts', order: 0 },
            { id: 1, title: 'LLMs and Prompt Engineering', order: 1 },
            { id: 2, title: 'MLOps and Model Deployment', order: 2 }
          ]}
        ]
      },
      {
        id: 'fullstack',
        title: 'Full Stack Development',
        icon: '💻',
        color: '#00d9ff',
        description: 'Django, React, Next.js, and React Native for cross-platform apps',
        modules: [
          { id: 1, title: 'Module 1: Django Backend Development', order: 0, topics: [
            { id: 0, title: 'Django Setup and Project Structure', order: 0 },
            { id: 1, title: 'Models and Database Design', order: 1 },
            { id: 2, title: 'REST APIs with Django REST Framework', order: 2 }
          ]},
          { id: 2, title: 'Module 2: React Frontend Fundamentals', order: 1, topics: [
            { id: 0, title: 'React Components and JSX', order: 0 },
            { id: 1, title: 'Hooks and State Management', order: 1 },
            { id: 2, title: 'React Router and Navigation', order: 2 }
          ]},
          { id: 3, title: 'Module 3: Next.js Full Stack Framework', order: 2, topics: [
            { id: 0, title: 'Next.js App Router', order: 0 },
            { id: 1, title: 'Server Components and API Routes', order: 1 },
            { id: 2, title: 'Deployment and Optimization', order: 2 }
          ]},
          { id: 4, title: 'Module 4: React Native Cross-Platform', order: 3, topics: [
            { id: 0, title: 'React Native Setup and Components', order: 0 },
            { id: 1, title: 'Navigation and State in Mobile', order: 1 },
            { id: 2, title: 'Building and Deploying Mobile Apps', order: 2 }
          ]}
        ]
      },
      {
        id: 'gaming',
        title: 'Gaming & Robotics IoT',
        icon: '🎮',
        color: '#ff6b6b',
        description: 'Game development, Robotics, and Internet of Things',
        modules: [
          { id: 1, title: 'Module 1: Game Development Basics', order: 0, topics: [
            { id: 0, title: 'Game Design Principles', order: 0 },
            { id: 1, title: 'Unity or Unreal Engine Basics', order: 1 },
            { id: 2, title: '2D and 3D Game Mechanics', order: 2 }
          ]},
          { id: 2, title: 'Module 2: Robotics Fundamentals', order: 1, topics: [
            { id: 0, title: 'Introduction to Robotics', order: 0 },
            { id: 1, title: 'Sensors and Actuators', order: 1 },
            { id: 2, title: 'Robot Programming', order: 2 }
          ]},
          { id: 3, title: 'Module 3: IoT and Embedded Systems', order: 2, topics: [
            { id: 0, title: 'IoT Architecture and Protocols', order: 0 },
            { id: 1, title: 'Arduino and Raspberry Pi', order: 1 },
            { id: 2, title: 'Smart Device Integration', order: 2 }
          ]}
        ]
      }
    ];
    
    setCourses(bundleCourses);
    setLoading(false);
    
    // Set initial syllabus data
    const initialSyllabus = {};
    bundleCourses.forEach(course => {
      const modules = {};
      course.modules?.forEach(mod => {
        modules[mod.title] = mod.topics?.map(t => t.title) || [];
      });
      initialSyllabus[course.id] = {
        title: course.title,
        icon: course.icon,
        color: course.color,
        description: course.description,
        modules,
        topicContent: {}
      };
    });
    setSyllabusData(initialSyllabus);
    
    // Clear old data
    localStorage.removeItem('cosmos_syllabus_data');
    
    const checkRole = () => {
      const trainer = isTrainer();
      const master = checkMaster();
      setTrainerMode(trainer);
      setIsMasterUser(master);
      setUserRole(trainer ? 'trainer' : getLoggedInUser() ? 'learner' : 'guest');
    };
    checkRole();
    window.addEventListener('storage', checkRole);
    return () => window.removeEventListener('storage', checkRole);
  }, []);

  const currentSubject = syllabusData[activeSubject] || { modules: {}, title: '', icon: '📚' };
  const allModules = Object.keys(currentSubject.modules || {});
  const allTopics = allModules.flatMap(m => currentSubject.modules?.[m] || []);

  const getTopicContent = (topic) => {
    const custom = currentSubject.topicContent?.[topic];
    return custom || generateDefaultContent(topic);
  };

  const saveTopicContent = (topic, newContent) => {
    updateSyllabus(prev => ({
      ...prev,
      [activeSubject]: {
        ...prev[activeSubject],
        topicContent: {
          ...(prev[activeSubject].topicContent || {}),
          [topic]: newContent
        }
      }
    }));
    setContent(newContent);
  };

  const getCurrentPosition = () => {
    for (const module of allModules) {
      const topics = currentSubject.modules[module];
      const idx = topics.indexOf(activeTopic);
      if (idx !== -1) return { module, moduleIndex: allModules.indexOf(module), topicIndex: idx, topics };
    }
    return null;
  };

  const handleNext = () => {
    const pos = getCurrentPosition();
    if (!pos) return;
    const { module, moduleIndex, topicIndex, topics } = pos;
    const newCompleted = new Set(completedTopics);
    newCompleted.add(activeTopic);
    setCompletedTopics(newCompleted);
    if (topicIndex === topics.length - 1) {
      const newCompletedModules = new Set(completedModules);
      newCompletedModules.add(module);
      setCompletedModules(newCompletedModules);
      if (newCompletedModules.size === allModules.length) { setShowCelebration(true); return; }
      setCurrentModuleComplete(module);
      setShowModuleComplete(true);
      setActiveModule(null); setActiveTopic(""); setContent(null);
      return;
    }
    const nextTopic = topics[topicIndex + 1];
    setActiveTopic(nextTopic);
    setContent(getTopicContent(nextTopic));
  };

  const handlePrevious = () => {
    const pos = getCurrentPosition();
    if (!pos || pos.topicIndex === 0) return;
    const prevTopic = pos.topics[pos.topicIndex - 1];
    setActiveTopic(prevTopic);
    setContent(getTopicContent(prevTopic));
  };

  const handleNextModule = () => {
    const pos = getCurrentPosition();
    const nextModuleIndex = pos ? pos.moduleIndex + 1 : 0;
    if (nextModuleIndex < allModules.length) {
      const nextModule = allModules[nextModuleIndex];
      setActiveModule(nextModule);
      const firstTopic = currentSubject.modules[nextModule][0];
      setActiveTopic(firstTopic);
      setContent(getTopicContent(firstTopic));
      setShowModuleComplete(false);
    }
  };

  const canGoNext = activeTopic && completedTopics.size < allTopics.length;
  const canGoPrevious = activeTopic && getCurrentPosition()?.topicIndex > 0;
  const progress = Math.round((completedTopics.size / allTopics.length) * 100);

  const handleSubjectChange = (key) => {
    setActiveSubject(key);
    setActiveModule(null); setActiveTopic(""); setContent(null);
    setCompletedTopics(new Set()); setCompletedModules(new Set());
    setShowCelebration(false); setShowModuleComplete(false);
    setTrainerPanelOpen(false);
  };

  const handleTopicClick = (topic, moduleName) => {
    setActiveTopic(topic);
    setActiveModule(moduleName);
    setContent(getTopicContent(topic));
    setShowModuleComplete(false);
    if (window.innerWidth < 768) setSidebarCollapsed(true);
  };

  const handleResetSyllabus = () => {
    if (window.confirm("Reset all syllabus changes to default? This cannot be undone.")) {
      const reset = resetSyllabusData();
      setSyllabusData(reset);
      setActiveModule(null); setActiveTopic(""); setContent(null);
    }
  };

  const topTabs = [
    { id: 'courses', label: '📚 Courses', icon: '📚' },
    { id: 'quiz-datascience', label: '🤖 Data Science Labs', icon: '🤖' },
    { id: 'quiz-fullstack', label: '💻 Full Stack Labs', icon: '💻' },
    { id: 'quiz-gaming', label: '🎮 Gaming & IoT Labs', icon: '🎮' },
  ];

  const toolTabs = [
    { id: 'ml-visuals',  label: 'ML Visuals',      icon: '🤖', color: '#a855f7' },
    { id: 'py-visuals',  label: 'Python Visuals',  icon: '🐍', color: '#22d3ee' },
    { id: 'whiteboard',  label: 'Whiteboard',      icon: '🖊️', color: '#f59e0b' },
  ];

  const isT = userRole === 'trainer';
  const masterUser = isMasterUser;

  return (
    <div className="courses-page">
      {masterUser && contentEditorOpen && editingTopic && (
        <ContentEditorModal
          topic={editingTopic}
          content={editingContent}
          onSave={(newContent) => saveTopicContent(editingTopic, newContent)}
          onClose={() => { setContentEditorOpen(false); setEditingTopic(null); setEditingContent(null); }}
        />
      )}

      {/* ── TOP MODE TABS ── */}
      <div className="mode-tabs">
        {topTabs.map(tab => (
          <button key={tab.id} className={`mode-tab ${viewMode === tab.id ? 'active' : ''}`} onClick={() => setViewMode(tab.id)}>
            <span className="mode-tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}

        {(isT || isMasterUser) && viewMode === 'courses' && (
          <div className="trainer-badge-row">
            <span className="trainer-badge">⚙️ {isMasterUser ? 'Master' : 'Trainer'} Mode</span>
            <button
              className={`trainer-edit-toggle ${trainerPanelOpen ? 'active' : ''}`}
              onClick={() => setTrainerPanelOpen(p => !p)}
              title="Toggle syllabus editor"
            >
              {trainerPanelOpen ? '✕ Close Editor' : '✏️ Edit Syllabus'}
            </button>
            <button className="trainer-reset-btn" onClick={handleResetSyllabus} title="Reset to defaults">↺ Reset</button>
            {savedIndicator && <span className="saved-indicator">✓ Saved</span>}
          </div>
        )}
      </div>

      {viewMode === 'quiz-datascience' && <CourseQuizPlatform courseId="datascience" isMasterUser={isMasterUser} />}
      {viewMode === 'quiz-fullstack' && <CourseQuizPlatform courseId="fullstack" isMasterUser={isMasterUser} />}
      {viewMode === 'quiz-gaming' && <CourseQuizPlatform courseId="gaming" isMasterUser={isMasterUser} />}
      {viewMode === 'ml-visuals' && <MLVisuals />}
      {viewMode === 'py-visuals' && <PythonVisuals />}
      {viewMode === 'whiteboard' && <WhiteBoard />}

      {/* ── COURSE MODE ── */}
      {viewMode === 'courses' && (
        <>
          {/* ── MASTER EDIT BUTTON ── */}
          {isMasterUser && (
            <button 
              className="master-edit-btn"
              onClick={() => setTrainerPanelOpen(p => !p)}
            >
              ✏️ {trainerPanelOpen ? 'Close Editor' : 'Edit Courses'}
            </button>
          )}

          {/* ── COURSE GRID ── */}
          {loading ? (
            <div className="courses-loading">
              <div className="courses-loading-spinner"></div>
              <p>Loading courses...</p>
            </div>
          ) : (
            <CourseListing 
              courses={courses} 
              activeCourseId={activeSubject}
              onSelect={(courseId) => {
                setActiveSubject(courseId);
                // Find the course and update syllabus data
                const selectedCourse = courses.find(c => c.id === courseId);
                if (selectedCourse) {
                  const modules = {};
                  selectedCourse.modules?.forEach(mod => {
                    modules[mod.title] = mod.topics?.map(t => t.title) || [];
                  });
                  setSyllabusData(prev => ({
                    ...prev,
                    [courseId]: {
                      title: selectedCourse.title,
                      icon: selectedCourse.icon,
                      color: selectedCourse.color,
                      description: selectedCourse.description,
                      modules,
                      topicContent: prev[courseId]?.topicContent || {}
                    }
                  }));
                }
              }}
              isMasterUser={isMasterUser}
            />
          )}

          {/* ── TRAINER PANEL ── */}
          {isMasterUser && trainerPanelOpen && (
            <div className="trainer-panel-wrap" style={{position: 'fixed', top: '120px', right: '20px', width: '350px', maxHeight: '70vh', zIndex: 1000}}>
              <TrainerSyllabusPanel
                syllabusData={syllabusData}
                activeSubject={activeSubject}
                onUpdateSyllabus={updateSyllabus}
                onClose={() => setTrainerPanelOpen(false)}
              />
            </div>
          )}

          {/* ── DETAILED COURSE VIEW (when a topic is selected) ── */}
          {activeSubject && syllabusData[activeSubject] && (
            <>
              {showCelebration && <Celebration onClose={() => setShowCelebration(false)} />}

              <div className="subject-tabs">
                <div className="tabs-container">
                  {courses.map(course => (
                    <button 
                      key={course.id} 
                      className={`subject-tab ${activeSubject === course.id ? 'active' : ''}`} 
                      onClick={() => handleSubjectChange(course.id)} 
                      style={{ '--subject-color': course.color }}
                    >
                      <span className="tab-icon">{course.icon}</span>
                      <span className="tab-text">{course.title}</span>
                      {activeSubject === course.id && <div className="tab-glow" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="course-progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
                <span className="progress-text">{progress}% Complete</span>
              </div>

              {/* ── LAYOUT ROOT ── */}
              <div className="course-layout-root">
                {/* Course sidebar */}
                {!sidebarCollapsed && (
                  <aside className="course-sidebar-wrap">
                    <div className="sidebar-header">
                      <h3 className="sidebar-title">
                        <span>{currentSubject.icon}</span>
                        {currentSubject.title}
                      </h3>
                      <button className="collapse-btn" onClick={() => setSidebarCollapsed(true)}>←</button>
                    </div>
                    <div className="modules-list">
                      {Object.entries(currentSubject.modules).map(([moduleName, topics]) => {
                        const isModuleComplete = completedModules.has(moduleName);
                        const isModuleActive = activeModule === moduleName;
                        return (
                          <div key={moduleName} className="module-group">
                            <button className={`module-header ${isModuleActive ? 'active' : ''} ${isModuleComplete ? 'completed' : ''}`} onClick={() => setActiveModule(isModuleActive ? null : moduleName)}>
                              <span className="module-icon">{isModuleComplete ? '✓' : isModuleActive ? '▼' : '▶'}</span>
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
                                  const hasCustomContent = !!currentSubject.topicContent?.[topic];
                                  return (
                                    <button key={topic} className={`topic-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} onClick={() => handleTopicClick(topic, moduleName)} style={{ animationDelay: `${idx * 0.05}s` }}>
                                      <span className="topic-bullet">{isCompleted ? '✓' : isActive ? '◆' : '◇'}</span>
                                      <span className="topic-text">{topic}</span>
                                      {isMasterUser && hasCustomContent && <span className="custom-content-dot" title="Has custom content">●</span>}
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
                )}

                {/* Collapsed sidebar toggle */}
                {sidebarCollapsed && (
                  <button className="sidebar-expand-btn" onClick={() => setSidebarCollapsed(false)}>
                    →
                  </button>
                )}

                {/* Main content */}
                <main className="content-area">
                  {showModuleComplete ? (
                    <ModuleComplete moduleName={currentModuleComplete} onNext={handleNextModule} />
                  ) : !content ? (
                    <div className="welcome-screen">
                      <div className="welcome-icon">{currentSubject.icon}</div>
                      <h1>{currentSubject.title}</h1>
                      <p>Select a topic from the sidebar to start learning</p>
                      <div className="quick-stats">
                        <div className="stat"><span className="stat-value">{allTopics.length}</span><span className="stat-label">Topics</span></div>
                        <div className="stat"><span className="stat-value">{allModules.length}</span><span className="stat-label">Modules</span></div>
                        <div className="stat"><span className="stat-value">{completedTopics.size}</span><span className="stat-label">Completed</span></div>
                      </div>
                      {(isT || isMasterUser) && (
                        <div className="trainer-welcome-hint">
                          <span>⚙️ {isMasterUser ? 'Master' : 'Trainer'}:</span> Use <strong>✏️ Edit Syllabus</strong> above to manage modules & topics. Click any topic then use <strong>Edit Content</strong> to update its body.
                        </div>
                      )}
                      <div className="start-hint"><span className="hint-arrow">←</span><span>Choose a module to begin</span></div>
                    </div>
                  ) : (
                    <div className="content-display">
                      <div className="content-header">
                        <div className="breadcrumb">
                          <span>{currentSubject.title}</span><span>›</span><span>{activeModule}</span><span>›</span>
                          <span className="active">{activeTopic}</span>
                        </div>
                        <div className="content-actions">
                          <button className={`action-btn ${completedTopics.has(activeTopic) ? 'completed' : ''}`} title="Mark Complete"
                            onClick={() => { const s = new Set(completedTopics); s.add(activeTopic); setCompletedTopics(s); }}>
                            {completedTopics.has(activeTopic) ? '✓' : '○'}
                          </button>
                          <button className="action-btn" title="Bookmark">🔖</button>
                          <button className="action-btn" title="Share">↗</button>
                          {masterUser && (
                          <button
                            className="action-btn trainer-content-edit-btn"
                            title="Edit topic content"
                            onClick={() => {
                              setEditingTopic(activeTopic);
                              setEditingContent(getTopicContent(activeTopic));
                              setContentEditorOpen(true);
                            }}
                            >
                              ✏️ Edit Content
                            </button>
                          )}
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
                          <div className="teaser-header"><span>💻</span><span>Practice Code</span></div>
                          <div className="teaser-body">
                            <p>Interactive Python compiler coming soon...</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <button className="btn btn-primary">Open IDE</button>
                              <button
                                className="quiz-orb-fan-btn"
                                style={{ '--qitem-color': '#22d3ee', width: '44px', height: '44px', fontSize: '20px', cursor: 'pointer' }}
                                onClick={() => { setViewMode('quiz-python'); }}
                                title="Take Quiz"
                              >
                                🧠
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>

                      <div className="content-footer">
                        <button className="nav-btn prev" onClick={handlePrevious} disabled={!canGoPrevious}>← Previous</button>
                        <div className="progress-info">
                          <span>{completedTopics.size} / {allTopics.length} completed</span>
                          <div className="mini-progress"><div style={{ width: `${progress}%` }} /></div>
                        </div>
                        <button className="nav-btn next" onClick={handleNext} disabled={!canGoNext}>
                          {completedTopics.size === allTopics.length - 1 ? 'Finish 🎉' : 'Next →'}
                        </button>
                      </div>
                    </div>
                  )}
                </main>
              </div>
            </>
          )}
        </>
      )}

      {/* ── ALL STYLES ── */}
      <style>{`
        /* ─────────────────────────────────────────────────────────
           PAGE ROOT
          
          ARCHITECTURE (30yr principle):
          The page is divided into 3 horizontal bands:
            1. .mode-tabs          — sticky, ~44px
            2. .subject-tabs       — static, ~46px
            3. .course-progress-bar — static, 3px
            4. .course-layout-root — fills EXACT remaining viewport height
          
          The layout root is a flex-row. Each column manages its
          own internal scroll. The content column is a flex-column:
            top:    .content-header  (sticky within column, not page)
            middle: .content-body    (flex:1, overflow-y:auto — SCROLLS)
            bottom: .content-footer  (always visible, never scrolls)
          
          This ensures footer is ALWAYS visible regardless of content
          length — it is NOT position:sticky (which depends on scroll
          parent having overflow) but a proper flex layout pin.
        ───────────────────────────────────────────────────────── */

        /* Reset any global box-sizing issues */
        .courses-page *,
        .courses-page *::before,
        .courses-page *::after {
          box-sizing: border-box;
        }

        .courses-page {
          display: flex;
          flex-direction: column;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #0a0a1a;
        }

        /* ─────────────────────────────────────────────────────────
           MODE TABS
        ───────────────────────────────────────────────────────── */
        .mode-tabs {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
          flex-wrap: wrap;
          min-height: 0;
        }
        .mode-tab {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 16px;
          border: 1px solid rgba(255,255,255,0.15); border-radius: 8px;
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7);
          cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.2s; letter-spacing: 0.3px;
          white-space: nowrap;
        }
        .mode-tab:hover { background: rgba(255,255,255,0.1); color: white; border-color: rgba(255,255,255,0.3); }
        .mode-tab.active { background: linear-gradient(135deg, rgba(0,217,255,0.2), rgba(168,85,247,0.2)); border-color: #00d9ff; color: #00d9ff; box-shadow: 0 0 12px rgba(0,217,255,0.2); }
        .mode-tab-icon { font-size: 15px; }

        /* ── Trainer toolbar ── */
        .trainer-badge-row {
          margin-left: auto;
          display: flex; align-items: center; gap: 8px;
          padding: 4px 10px;
          background: rgba(255,165,0,0.08);
          border: 1px solid rgba(255,165,0,0.25);
          border-radius: 8px;
          flex-shrink: 0;
        }
        .trainer-badge { font-size: 11px; font-weight: 700; color: #ffa500; letter-spacing: 0.5px; white-space: nowrap; }
        .trainer-edit-toggle {
          padding: 5px 14px; border-radius: 6px;
          border: 1px solid rgba(0,217,255,0.4);
          background: rgba(0,217,255,0.1); color: #00d9ff;
          font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;
        }
        .trainer-edit-toggle:hover { background: rgba(0,217,255,0.2); }
        .trainer-edit-toggle.active { background: rgba(0,217,255,0.25); box-shadow: 0 0 10px rgba(0,217,255,0.3); }
        .trainer-reset-btn {
          padding: 5px 10px; border-radius: 6px;
          border: 1px solid rgba(255,107,107,0.3);
          background: rgba(255,107,107,0.08); color: #ff6b6b;
          font-size: 12px; cursor: pointer; transition: all 0.2s;
        }
        .trainer-reset-btn:hover { background: rgba(255,107,107,0.15); }
        .saved-indicator { font-size: 11px; color: #00ff88; animation: fadeInOut 2s ease forwards; }
        @keyframes fadeInOut { 0%{opacity:0} 15%{opacity:1} 85%{opacity:1} 100%{opacity:0} }

        /* ─────────────────────────────────────────────────────────
           SUBJECT TABS + PROGRESS BAR
        ───────────────────────────────────────────────────────── */
        .subject-tabs {
          padding: 10px 20px 0;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .tabs-container { display: flex; gap: 6px; flex-wrap: wrap; }
        .subject-tab {
          position: relative; display: flex; align-items: center; gap: 8px;
          padding: 10px 18px; border-radius: 10px 10px 0 0;
          border: 1px solid rgba(255,255,255,0.1); border-bottom: none;
          background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6);
          cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.2s; overflow: hidden;
        }
        .subject-tab:hover { background: rgba(255,255,255,0.07); color: white; }
        .subject-tab.active {
          background: rgba(255,255,255,0.07); color: white;
          border-color: var(--subject-color, rgba(255,255,255,0.2));
          box-shadow: 0 -2px 12px rgba(0,0,0,0.3);
        }
        .tab-icon { font-size: 16px; }
        .tab-glow { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--subject-color, #00d9ff); }

        .course-progress-bar {
          height: 3px;
          background: rgba(255,255,255,0.06);
          position: relative;
          overflow: visible;
          flex-shrink: 0;
        }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #00d9ff, #a855f7); transition: width 0.6s ease; }
        .progress-text {
          position: absolute; right: 12px; top: 4px;
          font-size: 10px; color: rgba(255,255,255,0.4); white-space: nowrap;
        }

        /* ─────────────────────────────────────────────────────────
           COURSE LAYOUT ROOT
           
           flex:1 + overflow:hidden = fills exactly the remaining
           height left after mode-tabs + subject-tabs + progress-bar.
           Each child column manages its own scroll independently.
        ───────────────────────────────────────────────────────── */
        .course-layout-root {
          display: flex;
          flex-direction: row;
          width: 100%;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }

        /* ─────────────────────────────────────────────────────────
           TRAINER PANEL WRAP
        ───────────────────────────────────────────────────────── */
        .trainer-panel-wrap {
          width: 300px;
          min-width: 300px;
          flex-shrink: 0;
          min-height: 0;
          border-right: 1px solid rgba(255,165,0,0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideInPanel 0.25s ease;
        }
        @keyframes slideInPanel { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }

        /* Trainer panel internal styles */
        .trainer-panel {
          display: flex; flex-direction: column;
          height: 100%;
          background: rgba(0,0,0,0.5);
          overflow: hidden;
        }
        .trainer-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; flex-shrink: 0;
          border-bottom: 1px solid rgba(255,165,0,0.2);
          background: rgba(255,165,0,0.06);
        }
        .tph-title { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #ffa500; }
        .tph-icon { font-size: 16px; }
        .tph-close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 16px; transition: color 0.2s; }
        .tph-close:hover { color: white; }
        .trainer-panel-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px; }
        .tp-field-row { display: flex; align-items: center; gap: 8px; }
        .tp-label { font-size: 11px; color: rgba(255,255,255,0.4); white-space: nowrap; }
        .tp-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
        .tp-module-block { border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.02); }
        .tp-module-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .tp-module-drag { color: rgba(255,255,255,0.2); font-size: 14px; cursor: grab; }
        .tp-module-name { flex: 1; font-size: 12px; font-weight: 700; color: white; }
        .tp-module-actions { display: flex; gap: 4px; }
        .tp-btn { padding: 3px 8px; border-radius: 4px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.15s; }
        .tp-btn-add { background: rgba(0,217,255,0.15); color: #00d9ff; }
        .tp-btn-add:hover { background: rgba(0,217,255,0.25); }
        .tp-btn-del { background: rgba(255,107,107,0.1); color: #ff6b6b; }
        .tp-btn-del:hover { background: rgba(255,107,107,0.2); }
        .tp-topics-list { padding: 6px 8px; display: flex; flex-direction: column; gap: 2px; }
        .tp-topic-row { display: flex; align-items: center; gap: 6px; padding: 5px 6px; border-radius: 5px; transition: background 0.15s; }
        .tp-topic-row:hover { background: rgba(255,255,255,0.04); }
        .tp-topic-bullet { color: rgba(255,255,255,0.2); font-size: 10px; flex-shrink: 0; }
        .tp-topic-name { flex: 1; font-size: 12px; color: rgba(255,255,255,0.7); }
        .tp-topic-actions { display: flex; gap: 3px; }
        .tp-btn-sm { padding: 2px 6px; border-radius: 4px; border: none; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); cursor: pointer; font-size: 11px; transition: all 0.15s; }
        .tp-btn-sm:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: white; }
        .tp-btn-sm:disabled { opacity: 0.25; cursor: not-allowed; }
        .tp-del-sm:hover { background: rgba(255,107,107,0.15) !important; color: #ff6b6b !important; }
        .tp-add-topic-btn { display: flex; align-items: center; gap: 6px; padding: 5px 8px; margin-top: 4px; border: 1px dashed rgba(0,217,255,0.2); border-radius: 5px; background: rgba(0,217,255,0.04); color: rgba(0,217,255,0.6); cursor: pointer; font-size: 11px; width: 100%; transition: all 0.2s; }
        .tp-add-topic-btn:hover { border-color: rgba(0,217,255,0.4); color: #00d9ff; background: rgba(0,217,255,0.08); }
        .tp-add-module-btn { display: flex; align-items: center; gap: 8px; padding: 10px; margin-top: 6px; border: 1px dashed rgba(255,165,0,0.3); border-radius: 8px; background: rgba(255,165,0,0.05); color: rgba(255,165,0,0.7); cursor: pointer; font-size: 13px; font-weight: 600; width: 100%; transition: all 0.2s; }
        .tp-add-module-btn:hover { border-color: rgba(255,165,0,0.5); color: #ffa500; background: rgba(255,165,0,0.1); }
        .trainer-editable { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; border-radius: 4px; padding: 1px 4px; transition: background 0.15s; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .trainer-editable:hover { background: rgba(0,217,255,0.08); }
        .trainer-edit-hint { font-size: 10px; opacity: 0; transition: opacity 0.2s; flex-shrink: 0; }
        .trainer-editable:hover .trainer-edit-hint { opacity: 0.6; }
        .trainer-inline-input { background: rgba(0,0,0,0.4); border: 1px solid #00d9ff; border-radius: 4px; color: white; padding: 3px 8px; font-size: inherit; width: 100%; outline: none; font-family: inherit; }
        .trainer-inline-input.multiline { resize: vertical; min-height: 60px; }
        .tp-title-edit { font-size: 14px; font-weight: 700; color: white; }

        /* ─────────────────────────────────────────────────────────
           COURSE SIDEBAR — fixed width, full height, scrollable
        ───────────────────────────────────────────────────────── */
        .course-sidebar-wrap {
          width: 280px;
          min-width: 280px;
          flex-shrink: 0;
          height: 100%;
          max-height: 100vh;
          min-height: 0;
          border-right: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(0,0,0,0.25);
        }

        /* Sidebar header — fixed at top of sidebar */
        .sidebar-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 16px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          flex-shrink: 0;
          background: rgba(0,0,0,0.2);
        }
        .sidebar-title {
          font-size: 14px; font-weight: 700; color: white; margin: 0;
          display: flex; align-items: center; gap: 8px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .collapse-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); padding: 4px 9px; border-radius: 6px;
          cursor: pointer; font-size: 13px; transition: all 0.2s; flex-shrink: 0;
        }
        .collapse-btn:hover { background: rgba(255,255,255,0.12); color: white; }

        /* Modules list — scrollable */
        .modules-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px 0;
        }
        .modules-list::-webkit-scrollbar { width: 3px; }
        .modules-list::-webkit-scrollbar-track { background: transparent; }
        .modules-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .module-group { margin-bottom: 2px; }
        .module-header {
          width: 100%; display: flex; align-items: center; gap: 8px;
          padding: 10px 16px; border: none; background: transparent;
          color: rgba(255,255,255,0.7); cursor: pointer; text-align: left;
          transition: all 0.2s; font-size: 13px; font-weight: 600;
        }
        .module-header:hover { background: rgba(255,255,255,0.05); color: white; }
        .module-header.active { background: rgba(0,217,255,0.08); color: #00d9ff; }
        .module-header.completed { color: rgba(0,255,136,0.7); }
        .module-icon { font-size: 11px; color: rgba(255,255,255,0.3); flex-shrink: 0; }
        .module-header.active .module-icon { color: #00d9ff; }
        .module-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .topic-count { font-size: 10px; color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 10px; flex-shrink: 0; }
        .topic-count.done { color: #00ff88; background: rgba(0,255,136,0.1); }

        .topics-list { padding: 2px 0 6px 0; }
        .topic-item {
          width: 100%; display: flex; align-items: center; gap: 8px;
          padding: 8px 16px 8px 28px; border: none; background: transparent;
          color: rgba(255,255,255,0.55); cursor: pointer; text-align: left;
          font-size: 12px; transition: all 0.15s; position: relative;
        }
        .topic-item:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.85); }
        .topic-item.active { background: rgba(0,217,255,0.1); color: #00d9ff; }
        .topic-item.completed { color: rgba(0,255,136,0.5); }
        .topic-bullet { font-size: 9px; flex-shrink: 0; }
        .topic-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .topic-active-indicator { position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #00d9ff; border-radius: 0 2px 2px 0; }
        .custom-content-dot { color: #00ff88; font-size: 8px; flex-shrink: 0; }

        /* Sidebar footer */
        .sidebar-footer { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
        .ueep-mini { display: flex; align-items: center; gap: 8px; font-size: 11px; color: rgba(255,255,255,0.35); }
        .ueep-progress { flex: 1; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
        .ueep-progress .progress-bar { height: 100%; background: linear-gradient(90deg, #00d9ff, #a855f7); transition: width 0.5s; }
        .progress-percent { font-size: 11px; color: rgba(255,255,255,0.4); flex-shrink: 0; }

        /* Sidebar expand button (when collapsed) */
        .sidebar-expand-btn {
          width: 28px;
          min-width: 28px;
          flex-shrink: 0;
          border: none;
          border-right: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.2);
          color: rgba(255,255,255,0.4);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          writing-mode: vertical-rl;
        }
        .sidebar-expand-btn:hover { background: rgba(255,255,255,0.06); color: white; }

        /* ─────────────────────────────────────────────────────────
           CONTENT AREA
           
           flex:1 + min-width:0 = takes remaining horizontal space
           overflow:hidden (NOT auto) = lets children scroll themselves
           display:flex + flex-direction:column = stacks header/body/footer
        ───────────────────────────────────────────────────────── */
        .content-area {
          flex: 1;
          min-width: 0;
          min-height: 0;
          overflow: hidden;         /* NOT auto — children scroll themselves */
          display: flex;
          flex-direction: column;
        }
        .content-area::-webkit-scrollbar { width: 4px; }
        .content-area::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .content-area::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        /* Welcome screen — scrollable within content-area */
        .welcome-screen {
          flex: 1;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 40px; text-align: center;
          overflow-y: auto;
          min-height: 0;
        }
        .welcome-icon { font-size: 56px; margin-bottom: 16px; }
        .welcome-screen h1 { font-size: 28px; font-weight: 700; color: white; margin: 0 0 10px; }
        .welcome-screen p { color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 28px; }
        .quick-stats { display: flex; gap: 28px; margin-bottom: 28px; }
        .stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .stat-value { font-size: 28px; font-weight: 800; color: white; }
        .stat-label { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
        .trainer-welcome-hint { margin: 0 auto 20px; max-width: 420px; padding: 12px 16px; border-radius: 8px; background: rgba(255,165,0,0.08); border: 1px solid rgba(255,165,0,0.2); font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5; text-align: left; }
        .trainer-welcome-hint span { color: #ffa500; font-weight: 700; }
        .start-hint { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.3); font-size: 13px; }
        .hint-arrow { font-size: 18px; animation: bounceLeft 1.5s ease-in-out infinite; }
        @keyframes bounceLeft { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-6px)} }

        /* Content display — fills content-area completely */
        .content-display {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;        /* fill the content-area exactly */
          min-height: 0;
          overflow: hidden;
        }
        .content-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(6, 0, 20, 0.95);
          flex-shrink: 0;     /* never shrink — always visible */
          flex-wrap: wrap; gap: 8px;
          backdrop-filter: blur(10px);
          z-index: 10;
        }
        .breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 12px; color: rgba(255,255,255,0.4); flex-wrap: wrap; }
        .breadcrumb span { color: rgba(255,255,255,0.4); }
        .breadcrumb span.active { color: white; font-weight: 600; }
        .content-actions { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
        .action-btn { padding: 6px 12px; border: 1px solid rgba(255,255,255,0.15); border-radius: 7px; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.6); cursor: pointer; font-size: 12px; transition: all 0.2s; }
        .action-btn:hover { background: rgba(255,255,255,0.1); color: white; }
        .action-btn.completed { border-color: rgba(0,255,136,0.4); color: #00ff88; background: rgba(0,255,136,0.08); }
        .trainer-content-edit-btn { padding: 6px 14px !important; font-size: 12px !important; background: rgba(0,217,255,0.1) !important; border: 1px solid rgba(0,217,255,0.3) !important; color: #00d9ff !important; border-radius: 6px !important; cursor: pointer; font-weight: 700 !important; white-space: nowrap; transition: all 0.2s; }
        .trainer-content-edit-btn:hover { background: rgba(0,217,255,0.2) !important; }

        /* Content body — this is the ONLY scroll zone */
        .content-body {
          flex: 1;            /* takes all space between header and footer */
          min-height: 0;      /* allows shrinking below content size */
          overflow-y: auto;   /* THIS scrolls */
          overflow-x: hidden;
          padding: 28px 40px 32px;
          width: 100%;
        }
        .content-body::-webkit-scrollbar { width: 4px; }
        .content-body::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .content-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
        .content-title { font-size: 28px; font-weight: 800; color: white; margin: 0 0 12px; line-height: 1.3; }
        .content-description { font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.6; margin: 0 0 30px; }
        .content-section { margin-bottom: 28px; }
        .section-heading { font-size: 17px; font-weight: 700; color: #00d9ff; margin: 0 0 10px; padding-bottom: 6px; border-bottom: 1px solid rgba(0,217,255,0.15); }
        .section-text { font-size: 14px; color: rgba(255,255,255,0.7); line-height: 1.7; margin: 0; }
        .code-playground-teaser { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; margin-top: 32px; }
        .teaser-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(0,0,0,0.3); font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.7); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .teaser-body { padding: 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .teaser-body p { color: rgba(255,255,255,0.5); font-size: 13px; margin: 0; }

        /* Content footer — ALWAYS visible, pinned at bottom of flex column */
        .content-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 28px;
          border-top: 1px solid rgba(255,255,255,0.08);
          background: rgba(6, 0, 20, 0.97);
          flex-shrink: 0;    /* never shrink — always takes its full height */
          flex-wrap: wrap; gap: 12px;
          /* NOT position:sticky — that requires scroll parent to have overflow:auto */
          /* Being the last flex child in a flex column IS the pin */
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(0, 217, 255, 0.12);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.4);
        }
        .nav-btn { padding: 10px 22px; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
        .nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: white; transform: translateY(-1px); }
        .nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .nav-btn.next { background: linear-gradient(135deg, rgba(0,217,255,0.15), rgba(168,85,247,0.15)); border-color: rgba(0,217,255,0.3); color: #00d9ff; }
        .nav-btn.next:hover:not(:disabled) { background: linear-gradient(135deg, rgba(0,217,255,0.25), rgba(168,85,247,0.25)); box-shadow: 0 4px 15px rgba(0,217,255,0.2); }
        .progress-info { display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 12px; color: rgba(255,255,255,0.4); }
        .mini-progress { width: 120px; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
        .mini-progress div { height: 100%; background: linear-gradient(90deg, #00d9ff, #a855f7); transition: width 0.5s; }

        /* Module complete */
        .module-complete { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 40px; text-align: center; flex: 1; min-height: 400px; }
        .complete-icon { font-size: 56px; margin-bottom: 16px; animation: completePop 0.6s cubic-bezier(0.175,0.885,0.32,1.275); }
        @keyframes completePop { 0%{transform:scale(0)} 100%{transform:scale(1)} }
        .module-complete h3 { font-size: 24px; font-weight: 800; color: white; margin: 0 0 8px; }
        .module-complete p { color: rgba(255,255,255,0.5); font-size: 15px; margin: 0 0 24px; }

        /* ── Shared btn ── */
        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 22px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 700; transition: all 0.2s; }
        .btn-primary { background: linear-gradient(135deg, #00d9ff, #9d4edd); color: white; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,217,255,0.3); }

        /* Celebration */
        .celebration-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .celebration-content { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; text-align: center; position: relative; z-index: 2; animation: completePop 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
        .celebration-emoji { font-size: 56px; margin-bottom: 16px; }
        .celebration-content h2 { font-size: 28px; font-weight: 800; color: white; margin: 0 0 10px; }
        .celebration-content p { color: rgba(255,255,255,0.6); margin: 0 0 20px; }
        .celebration-badges { font-size: 36px; display: flex; gap: 12px; justify-content: center; margin-bottom: 24px; }
        .confetti { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .confetti span { position: absolute; width: 8px; height: 8px; top: -10px; animation: confettiFall 3s ease-in infinite; border-radius: 2px; }
        @keyframes confettiFall { 0%{top:-10px;transform:rotate(0deg)} 100%{top:110%;transform:rotate(720deg)} }

        /* ─────────────────────────────────────────────────────────
           CONFIRM MODAL
        ───────────────────────────────────────────────────────── */
        .confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .confirm-modal { background: #1a1a2e; border: 1px solid rgba(255,107,107,0.3); border-radius: 12px; padding: 28px 32px; text-align: center; max-width: 320px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
        .confirm-icon { font-size: 32px; margin-bottom: 12px; }
        .confirm-msg { color: rgba(255,255,255,0.85); font-size: 14px; margin-bottom: 20px; line-height: 1.5; }
        .confirm-actions { display: flex; gap: 10px; justify-content: center; }
        .confirm-cancel { padding: 8px 20px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 13px; }
        .confirm-delete { padding: 8px 20px; border-radius: 6px; border: none; background: #ff6b6b; color: white; cursor: pointer; font-size: 13px; font-weight: 700; }

        /* ─────────────────────────────────────────────────────────
           CONTENT EDITOR MODAL
        ───────────────────────────────────────────────────────── */
        .content-editor-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
        .content-editor-modal { background: #12121f; border: 1px solid rgba(0,217,255,0.2); border-radius: 16px; width: 100%; max-width: 680px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(0,217,255,0.1); animation: modalIn 0.25s ease; }
        @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(-10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .cem-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .cem-header h2 { margin: 0; font-size: 16px; color: white; }
        .cem-close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 18px; transition: color 0.2s; }
        .cem-close:hover { color: white; }
        .cem-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
        .cem-field { display: flex; flex-direction: column; gap: 6px; }
        .cem-field label { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
        .cem-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 10px 12px; color: white; font-size: 14px; outline: none; transition: border-color 0.2s; font-family: inherit; }
        .cem-input:focus { border-color: #00d9ff; }
        .cem-textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 10px 12px; color: white; font-size: 14px; outline: none; resize: vertical; font-family: inherit; line-height: 1.5; transition: border-color 0.2s; }
        .cem-textarea:focus { border-color: #00d9ff; }
        .cem-sections-label { display: flex; align-items: center; justify-content: space-between; }
        .cem-sections-label > span { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
        .cem-add-section { padding: 4px 12px; border-radius: 6px; border: 1px solid rgba(0,217,255,0.3); background: rgba(0,217,255,0.08); color: #00d9ff; cursor: pointer; font-size: 12px; transition: all 0.2s; }
        .cem-add-section:hover { background: rgba(0,217,255,0.15); }
        .cem-section-block { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .cem-section-controls { display: flex; align-items: center; gap: 6px; }
        .cem-section-num { font-size: 11px; color: rgba(255,255,255,0.3); font-weight: 700; flex: 1; }
        .cem-move-btn { padding: 2px 8px; background: rgba(255,255,255,0.06); border: none; color: rgba(255,255,255,0.5); border-radius: 4px; cursor: pointer; font-size: 12px; }
        .cem-move-btn:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: white; }
        .cem-move-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .cem-remove-section { padding: 2px 8px; background: rgba(255,107,107,0.1); border: none; color: #ff6b6b; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .cem-remove-section:hover { background: rgba(255,107,107,0.2); }
        .cem-footer { padding: 14px 24px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: flex-end; gap: 10px; }
        .cem-cancel { padding: 9px 20px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 13px; }
        .cem-save { padding: 9px 22px; border-radius: 7px; border: none; background: linear-gradient(135deg, #00d9ff, #00a8cc); color: #000; font-weight: 700; cursor: pointer; font-size: 13px; transition: all 0.2s; }
        .cem-save:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0,217,255,0.3); }

        /* ─────────────────────────────────────────────────────────
           QUIZ PLATFORM (unchanged styles)
        ───────────────────────────────────────────────────────── */
        .quiz-platform { min-height: calc(100vh - 120px); background: transparent; }
        .quiz-header { padding: 20px 24px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .quiz-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .quiz-platform-icon { font-size: 28px; }
        .quiz-platform-title { font-size: 22px; font-weight: 700; color: white; margin: 0; }
        .quiz-subtitle { font-size: 12px; color: #00d9ff; background: rgba(0,217,255,0.1); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(0,217,255,0.3); }
        .overall-progress { display: flex; align-items: center; gap: 10px; font-size: 13px; color: rgba(255,255,255,0.7); }
        .prog-bar { flex: 1; max-width: 200px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
        .prog-fill { height: 100%; background: linear-gradient(90deg, #00d9ff, #a855f7); border-radius: 3px; transition: width 0.5s ease; }
        .level-tabs { display: flex; gap: 8px; padding: 12px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .level-tab { display: flex; align-items: center; gap: 8px; padding: 8px 20px; border: 1px solid rgba(255,255,255,0.12); border-radius: 8px; background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6); cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
        .level-tab:hover { background: rgba(255,255,255,0.08); color: white; }
        .level-tab.active { background: rgba(168,85,247,0.15); border-color: #a855f7; color: white; }
        .level-name { text-transform: capitalize; }
        .level-count { font-size: 11px; background: rgba(255,255,255,0.1); padding: 1px 6px; border-radius: 10px; }
        .quiz-layout { display: grid; grid-template-columns: 280px 1fr; height: calc(100vh - 240px); }
        .quiz-sidebar { border-right: 1px solid rgba(255,255,255,0.08); overflow-y: auto; background: rgba(0,0,0,0.2); }
        .quiz-sidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px 8px; font-size: 13px; font-weight: 700; color: white; text-transform: capitalize; }
        .level-prog { font-size: 11px; color: rgba(255,255,255,0.5); }
        .quiz-sidebar-progress { padding: 0 16px 12px; }
        .quiz-sidebar-progress .prog-bar { max-width: 100%; }
        .quiz-list { display: flex; flex-direction: column; }
        .quiz-list-item { display: flex; align-items: center; gap: 8px; padding: 9px 16px; border: none; border-bottom: 1px solid rgba(255,255,255,0.04); background: transparent; color: rgba(255,255,255,0.65); cursor: pointer; text-align: left; transition: all 0.15s; }
        .quiz-list-item:hover { background: rgba(255,255,255,0.05); color: white; }
        .quiz-list-item.active { background: rgba(0,217,255,0.1); color: #00d9ff; border-left: 2px solid #00d9ff; }
        .quiz-list-item.done { color: rgba(255,255,255,0.4); }
        .qli-num { width: 22px; height: 22px; border-radius: 50%; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .quiz-list-item.active .qli-num { background: rgba(0,217,255,0.3); }
        .quiz-list-item.done .qli-num { background: rgba(0,255,136,0.2); }
        .qli-info { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .qli-title { font-size: 12px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .qli-tag { font-size: 10px; font-weight: 600; opacity: 0.8; }
        .qli-done { color: #00ff88; font-size: 12px; }
        .qli-active { color: #00d9ff; font-size: 10px; }
        .quiz-main { overflow-y: auto; padding: 20px; background: rgba(0,0,0,0.1); }
        .quiz-nav-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; margin-top: 12px; }
        .qnav-btn { padding: 8px 18px; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); cursor: pointer; font-size: 13px; transition: all 0.2s; }
        .qnav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: white; }
        .qnav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .qnav-info { font-size: 13px; color: rgba(255,255,255,0.5); }
        .quiz-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; overflow: hidden; transition: border-color 0.3s; }
        .quiz-card.correct { border-color: rgba(0,255,136,0.4); }
        .quiz-card.incorrect { border-color: rgba(255,107,107,0.4); }
        .quiz-card-header { padding: 16px 20px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .quiz-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .quiz-tag { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; color: #000; letter-spacing: 0.5px; }
        .quiz-level { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: capitalize; background: rgba(255,255,255,0.08); padding: 2px 8px; border-radius: 10px; }
        .quiz-done-badge { font-size: 11px; color: #00ff88; background: rgba(0,255,136,0.1); padding: 2px 8px; border-radius: 10px; border: 1px solid rgba(0,255,136,0.3); }
        .quiz-title { font-size: 20px; font-weight: 700; color: white; margin: 0; }
        .quiz-question { padding: 16px 20px; background: rgba(0,0,0,0.2); }
        .question-text { font-family: 'Courier New', monospace; font-size: 13px; color: rgba(255,255,255,0.85); line-height: 1.6; white-space: pre-wrap; margin: 0; }
        .quiz-workspace { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
        .code-editor-wrapper { border: 1px solid rgba(255,255,255,0.12); border-radius: 10px; overflow: hidden; }
        .editor-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; background: rgba(0,0,0,0.4); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .editor-lang { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.6); }
        .clear-btn { font-size: 11px; padding: 3px 10px; border: 1px solid rgba(255,255,255,0.15); border-radius: 5px; background: transparent; color: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.2s; }
        .clear-btn:hover { background: rgba(255,255,255,0.08); color: white; }
        .code-textarea { width: 100%; min-height: 200px; padding: 14px; background: #1a1a2e; color: #e0e0e0; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.6; border: none; outline: none; resize: vertical; tab-size: 4; box-sizing: border-box; }
        .quiz-controls { display: flex; align-items: center; gap: 12px; }
        .loading-badge { font-size: 12px; color: #ffd43b; background: rgba(255,212,59,0.1); padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(255,212,59,0.3); }
        .run-btn { padding: 10px 24px; background: linear-gradient(135deg, #00d9ff, #00a8cc); border: none; border-radius: 8px; color: #000; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; }
        .run-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(0,217,255,0.4); }
        .run-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .output-panel { border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
        .output-panel.correct { border-color: rgba(0,255,136,0.4); }
        .output-panel.incorrect { border-color: rgba(255,107,107,0.3); }
        .output-header { display: flex; justify-content: space-between; align-items: center; padding: 8px 14px; background: rgba(0,0,0,0.3); font-size: 12px; font-weight: 600; }
        .output-panel.correct .output-header { color: #00ff88; }
        .output-panel.incorrect .output-header { color: #ff6b6b; }
        .show-expected-btn { font-size: 11px; padding: 3px 10px; border: 1px solid rgba(255,212,59,0.4); border-radius: 5px; background: rgba(255,212,59,0.1); color: #ffd43b; cursor: pointer; }
        .output-text { padding: 12px 14px; font-family: monospace; font-size: 13px; color: #e0e0e0; background: rgba(0,0,0,0.2); margin: 0; white-space: pre-wrap; line-height: 1.5; }
        .correct-banner { padding: 14px 20px; background: linear-gradient(135deg, rgba(0,255,136,0.15), rgba(0,200,100,0.1)); border-top: 1px solid rgba(0,255,136,0.3); color: #00ff88; font-weight: 700; font-size: 15px; text-align: center; }
        .hint-banner { padding: 12px 20px; background: rgba(255,212,59,0.08); border-top: 1px solid rgba(255,212,59,0.2); color: #ffd43b; font-size: 13px; text-align: center; }
        .achievement-popup { position: fixed; top: 80px; right: 20px; z-index: 9999; cursor: pointer; animation: slideInRight 0.4s ease, fadeOut 0.3s ease 3.7s forwards; }
        .achievement-content { display: flex; align-items: center; gap: 12px; padding: 14px 20px; background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(20,20,40,0.95)); border: 1px solid rgba(255,212,59,0.5); border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5); min-width: 260px; }
        .achievement-icon { font-size: 28px; }
        .achievement-text { font-size: 14px; font-weight: 700; color: white; }
        @keyframes slideInRight { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes fadeOut { to{opacity:0;transform:translateX(120%)} }

        /* ─────────────────────────────────────────────────────────
           RESPONSIVE
        ───────────────────────────────────────────────────────── */
        @media (max-width: 768px) {
          .courses-page {
            height: auto;
            overflow: visible;
          }
          .course-layout-root {
            flex-direction: column;
            overflow: visible;
            flex: unset;
            height: auto;
          }
          .trainer-panel-wrap {
            width: 100%; min-width: unset;
            border-right: none; border-bottom: 1px solid rgba(255,165,0,0.2);
            max-height: 300px;
          }
          .course-sidebar-wrap {
            width: 100%; min-width: unset;
            border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08);
            max-height: 260px;
          }
          .content-area { overflow: visible; min-height: 70vh; }
          .content-display { height: auto; overflow: visible; }
          .content-body { overflow: visible; }
          .content-footer {
            position: sticky; bottom: 0;
            border-top: 1px solid rgba(0,217,255,0.12);
          }
          .quiz-layout { grid-template-columns: 1fr; grid-template-rows: 200px 1fr; }
          .quiz-sidebar { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .trainer-badge-row { margin-left: 0; width: 100%; }
          .content-body { padding: 20px 16px 28px; }
          .content-header { padding: 10px 16px; }
          .content-footer { padding: 12px 16px; }
        }
        /* ─────────────────────────────────────────────────────────
           FLOATING ORB + RADIAL TOOL MENU
        ───────────────────────────────────────────────────────── */
        .floating-orb-wrap {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        /* Fan items container */
        .orb-fan {
          position: absolute;
          bottom: 72px;
          right: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
          pointer-events: none;
        }
        .orb-fan.open { pointer-events: all; }

        .orb-fan-item {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transform: translateY(20px) scale(0.7);
          transition: opacity 0.25s, transform 0.25s;
          cursor: pointer;
        }
        .orb-fan.open .orb-fan-item:nth-child(1) { opacity:1; transform:translateY(0) scale(1); transition-delay:0.05s; }
        .orb-fan.open .orb-fan-item:nth-child(2) { opacity:1; transform:translateY(0) scale(1); transition-delay:0.12s; }
        .orb-fan.open .orb-fan-item:nth-child(3) { opacity:1; transform:translateY(0) scale(1); transition-delay:0.19s; }

        .orb-fan-label {
          font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
          padding: 5px 12px; border-radius: 20px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
          white-space: nowrap;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4);
          transition: background 0.2s, border-color 0.2s;
        }
        .orb-fan-item:hover .orb-fan-label { border-color: var(--item-color); color: var(--item-color); background: rgba(0,0,0,0.9); }

        .orb-fan-btn {
          width: 46px; height: 46px; border-radius: 50%;
          border: 2px solid var(--item-color);
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 14px var(--item-color), 0 4px 16px rgba(0,0,0,0.5);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          flex-shrink: 0;
        }
        .orb-fan-item:hover .orb-fan-btn {
          transform: scale(1.15);
          box-shadow: 0 0 24px var(--item-color), 0 4px 20px rgba(0,0,0,0.6);
        }
        .orb-fan-item.tool-active .orb-fan-btn {
          background: var(--item-color);
          box-shadow: 0 0 28px var(--item-color);
        }
        .orb-fan-item.tool-active .orb-fan-label {
          color: var(--item-color);
          border-color: var(--item-color);
        }

        /* Main orb */
        .main-orb {
          width: 60px; height: 60px; border-radius: 50%;
          background: conic-gradient(from 0deg, #a855f7, #22d3ee, #f59e0b, #a855f7);
          border: none;
          cursor: pointer;
          position: relative;
          box-shadow:
            0 0 0 4px rgba(168,85,247,0.25),
            0 0 30px rgba(168,85,247,0.5),
            0 0 60px rgba(34,211,238,0.3);
          animation: orbSpin 4s linear infinite, orbPulse 2.5s ease-in-out infinite alternate;
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
        }
        .main-orb:hover {
          transform: scale(1.12);
          box-shadow:
            0 0 0 6px rgba(168,85,247,0.35),
            0 0 50px rgba(168,85,247,0.7),
            0 0 80px rgba(34,211,238,0.5);
        }
        .main-orb.open {
          animation: orbSpin 1.5s linear infinite;
          transform: scale(1.1) rotate(45deg);
          box-shadow:
            0 0 0 6px rgba(34,211,238,0.4),
            0 0 60px rgba(34,211,238,0.8),
            0 0 100px rgba(168,85,247,0.5);
        }

        @keyframes orbSpin {
          from { filter: hue-rotate(0deg); }
          to   { filter: hue-rotate(360deg); }
        }
        @keyframes orbPulse {
          from { box-shadow: 0 0 0 4px rgba(168,85,247,0.2), 0 0 30px rgba(168,85,247,0.4), 0 0 60px rgba(34,211,238,0.2); }
          to   { box-shadow: 0 0 0 8px rgba(168,85,247,0.35), 0 0 50px rgba(168,85,247,0.7), 0 0 90px rgba(34,211,238,0.4); }
        }

        .orb-tooltip {
          position: absolute;
          bottom: -26px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.5);
          white-space: nowrap;
          pointer-events: none;
          text-transform: uppercase;
        }
        /* ═══════════════════════════════════════════════════════════════
        3D FLOATING QUIZ ORB — Attention Grabbing Edition
        Position: Fixed on body, animated, glowing, floating in 3D space
      ═══════════════════════════════════════════════════════════════ */

      .quiz-orb-wrap {
        position: fixed;
        bottom: 32px;
        right: 110px;   /* ← moves it left of the tools orb (60px orb + 32px right + 18px gap) */
        left: unset;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        /* 3D perspective for depth */
        perspective: 1000px;
        transform-style: preserve-3d;
      }

      /* ═══════════════════════════════════════════════════════════════
        MAIN ORB — 3D Sphere with Depth & Glow
      ═══════════════════════════════════════════════════════════════ */

      .quiz-main-orb {
        width: 70px;
        height: 70px;
        border-radius: 50%;
        position: relative;
        cursor: pointer;
        border: none;
        outline: none;
        
        /* Multi-layer gradient for 3D depth */
        background: 
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, rgba(34,211,238,0.6) 0%, rgba(168,85,247,0.4) 40%, rgba(34,211,238,0.2) 70%, transparent 100%),
          conic-gradient(from 180deg, #22d3ee, #a855f7, #06b6d4, #22d3ee);
        
        /* 3D shadow layers */
        box-shadow: 
          /* Inner glow */
          inset -10px -10px 20px rgba(0,0,0,0.5),
          inset 10px 10px 20px rgba(255,255,255,0.3),
          /* Core glow */
          0 0 0 4px rgba(34,211,238,0.3),
          0 0 20px rgba(34,211,238,0.6),
          0 0 40px rgba(168,85,247,0.4),
          0 0 60px rgba(34,211,238,0.3),
          /* Ambient glow */
          0 10px 40px rgba(0,0,0,0.4);
        
        /* Floating animation */
        animation: 
          quizOrbFloat 3s ease-in-out infinite,
          quizOrbSpin 8s linear infinite,
          quizOrbPulse 2s ease-in-out infinite alternate;
        
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        transform-style: preserve-3d;
      }

      /* 3D highlight reflection */
      .quiz-main-orb::before {
        content: '';
        position: absolute;
        top: 15%;
        left: 20%;
        width: 25%;
        height: 25%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 40%, transparent 70%);
        filter: blur(1px);
        pointer-events: none;
      }

      /* Secondary reflection for more depth */
      .quiz-main-orb::after {
        content: '';
        position: absolute;
        bottom: 10%;
        right: 15%;
        width: 15%;
        height: 15%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%);
        filter: blur(2px);
        pointer-events: none;
      }

      /* Hover state — intensify everything */
      .quiz-main-orb:hover {
        transform: scale(1.15) translateY(-5px);
        box-shadow: 
          inset -10px -10px 20px rgba(0,0,0,0.5),
          inset 10px 10px 20px rgba(255,255,255,0.4),
          0 0 0 6px rgba(34,211,238,0.4),
          0 0 30px rgba(34,211,238,0.8),
          0 0 60px rgba(168,85,247,0.6),
          0 0 90px rgba(34,211,238,0.5),
          0 15px 50px rgba(0,0,0,0.5);
        animation-duration: 0.5s, 4s, 1s;
      }

      /* Open state — morph and spin fast */
      .quiz-main-orb.open {
        animation: quizOrbSpin 1s linear infinite, quizOrbMorph 0.6s ease forwards;
        transform: scale(1.1) rotateX(15deg);
        box-shadow: 
          0 0 0 8px rgba(34,211,238,0.5),
          0 0 50px rgba(34,211,238,0.9),
          0 0 80px rgba(168,85,247,0.7),
          0 0 120px rgba(34,211,238,0.5);
      }

      /* Active quiz state — pulsing alert */
      .quiz-main-orb.quiz-active {
        animation: 
          quizOrbFloat 2s ease-in-out infinite,
          quizOrbSpin 6s linear infinite,
          quizOrbAlertPulse 1.5s ease-in-out infinite;
        box-shadow: 
          0 0 0 5px rgba(34,211,238,0.6),
          0 0 40px rgba(34,211,238,1),
          0 0 80px rgba(168,85,247,0.8),
          0 0 120px rgba(34,211,238,0.6);
      }

      /* ═══════════════════════════════════════════════════════════════
        KEYFRAME ANIMATIONS
      ═══════════════════════════════════════════════════════════════ */

      /* Smooth floating motion — like it's suspended in liquid */
      @keyframes quizOrbFloat {
        0%, 100% {
          transform: translateY(0px) rotateX(0deg) rotateY(0deg);
        }
        25% {
          transform: translateY(-8px) rotateX(5deg) rotateY(5deg);
        }
        50% {
          transform: translateY(-4px) rotateX(0deg) rotateY(10deg);
        }
        75% {
          transform: translateY(-12px) rotateX(-5deg) rotateY(5deg);
        }
      }

      /* Continuous hue rotation for living gradient */
      @keyframes quizOrbSpin {
        from {
          filter: hue-rotate(0deg);
        }
        to {
          filter: hue-rotate(-360deg);
        }
      }

      /* Breathing glow pulse */
      @keyframes quizOrbPulse {
        from {
          box-shadow: 
            inset -10px -10px 20px rgba(0,0,0,0.5),
            inset 10px 10px 20px rgba(255,255,255,0.2),
            0 0 0 4px rgba(34,211,238,0.2),
            0 0 20px rgba(34,211,238,0.4),
            0 0 40px rgba(168,85,247,0.3),
            0 0 60px rgba(34,211,238,0.2),
            0 10px 40px rgba(0,0,0,0.4);
        }
        to {
          box-shadow: 
            inset -10px -10px 20px rgba(0,0,0,0.5),
            inset 10px 10px 20px rgba(255,255,255,0.35),
            0 0 0 8px rgba(34,211,238,0.4),
            0 0 35px rgba(34,211,238,0.7),
            0 0 55px rgba(168,85,247,0.5),
            0 0 80px rgba(34,211,238,0.4),
            0 10px 40px rgba(0,0,0,0.4);
        }
      }

      /* Alert pulse when quiz is active — attention grabbing */
      @keyframes quizOrbAlertPulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.08);
        }
      }

      /* Morph animation when opening */
      @keyframes quizOrbMorph {
        0% {
          border-radius: 50%;
        }
        50% {
          border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%;
        }
        100% {
          border-radius: 50%;
        }
      }

      /* ═══════════════════════════════════════════════════════════════
        ORBITING PARTICLES — Extra visual flair
      ═══════════════════════════════════════════════════════════════ */

      .quiz-orb-particles {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100px;
        height: 100px;
        transform: translate(-50%, -50%);
        pointer-events: none;
        opacity: 0.6;
      }

      .quiz-orb-particles span {
        position: absolute;
        width: 4px;
        height: 4px;
        background: #22d3ee;
        border-radius: 50%;
        box-shadow: 0 0 10px #22d3ee;
        animation: orbitParticle 4s linear infinite;
      }

      .quiz-orb-particles span:nth-child(1) {
        top: 0;
        left: 50%;
        animation-delay: 0s;
        animation-duration: 3s;
      }

      .quiz-orb-particles span:nth-child(2) {
        top: 50%;
        right: 0;
        animation-delay: -1s;
        animation-duration: 4s;
        background: #a855f7;
        box-shadow: 0 0 10px #a855f7;
      }

      .quiz-orb-particles span:nth-child(3) {
        bottom: 0;
        left: 50%;
        animation-delay: -2s;
        animation-duration: 3.5s;
        background: #06b6d4;
        box-shadow: 0 0 10px #06b6d4;
      }

      @keyframes orbitParticle {
        0% {
          transform: rotate(0deg) translateX(45px) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: rotate(360deg) translateX(45px) rotate(-360deg);
          opacity: 0;
        }
      }

      /* ═══════════════════════════════════════════════════════════════
        FAN MENU — Smooth unfold with 3D depth
      ═══════════════════════════════════════════════════════════════ */

      .quiz-orb-fan {
        position: absolute;
        bottom: 85px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
        pointer-events: none;
        perspective: 800px;
      }

      .quiz-orb-fan.open {
        pointer-events: all;
      }

      .quiz-orb-fan-item {
        display: flex;
        align-items: center;
        gap: 12px;
        opacity: 0;
        transform: translateX(-30px) translateZ(-50px) rotateY(-15deg);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
        transform-origin: left center;
      }

      /* Staggered entrance animation */
      .quiz-orb-fan.open .quiz-orb-fan-item:nth-child(1) {
        opacity: 1;
        transform: translateX(0) translateZ(0) rotateY(0);
        transition-delay: 0.08s;
      }

      .quiz-orb-fan.open .quiz-orb-fan-item:nth-child(2) {
        opacity: 1;
        transform: translateX(0) translateZ(0) rotateY(0);
        transition-delay: 0.16s;
      }

      /* Hover lift effect on fan items */
      .quiz-orb-fan-item:hover {
        transform: translateX(5px) scale(1.05);
      }

      /* ═══════════════════════════════════════════════════════════════
        FAN BUTTONS — Mini 3D orbs
      ═══════════════════════════════════════════════════════════════ */

      .quiz-orb-fan-btn {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        border: 2px solid var(--qitem-color);
        background: 
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
          rgba(0,0,0,0.7);
        backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
        box-shadow: 
          inset -3px -3px 8px rgba(0,0,0,0.5),
          inset 3px 3px 8px rgba(255,255,255,0.1),
          0 0 15px var(--qitem-color),
          0 4px 20px rgba(0,0,0,0.5);
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
      }

      .quiz-orb-fan-btn::before {
        content: '';
        position: absolute;
        top: 10%;
        left: 15%;
        width: 30%;
        height: 30%;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
        pointer-events: none;
      }

      .quiz-orb-fan-item:hover .quiz-orb-fan-btn {
        transform: scale(1.2) translateY(-3px);
        box-shadow: 
          inset -3px -3px 8px rgba(0,0,0,0.5),
          inset 3px 3px 8px rgba(255,255,255,0.15),
          0 0 25px var(--qitem-color),
          0 0 40px var(--qitem-color),
          0 8px 25px rgba(0,0,0,0.6);
      }

      .quiz-tool-active .quiz-orb-fan-btn {
        background: 
          radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 50%),
          var(--qitem-color);
        box-shadow: 
          0 0 30px var(--qitem-color),
          0 0 50px var(--qitem-color),
          inset 0 0 20px rgba(255,255,255,0.3);
        animation: fanBtnPulse 2s ease-in-out infinite;
      }

      @keyframes fanBtnPulse {
        0%, 100% {
          box-shadow: 
            0 0 30px var(--qitem-color),
            0 0 50px var(--qitem-color);
        }
        50% {
          box-shadow: 
            0 0 40px var(--qitem-color),
            0 0 60px var(--qitem-color),
            0 0 80px var(--qitem-color);
        }
      }

      /* ═══════════════════════════════════════════════════════════════
        FAN LABELS — Glass morphism style
      ═══════════════════════════════════════════════════════════════ */

      .quiz-orb-fan-label {
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.5px;
        padding: 8px 16px;
        border-radius: 25px;
        background: rgba(0,0,0,0.8);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        white-space: nowrap;
        box-shadow: 
          0 4px 20px rgba(0,0,0,0.4),
          inset 0 1px 0 rgba(255,255,255,0.1);
        transition: all 0.3s ease;
        text-shadow: 0 2px 4px rgba(0,0,0,0.5);
      }

      .quiz-orb-fan-item:hover .quiz-orb-fan-label {
        border-color: var(--qitem-color);
        color: var(--qitem-color);
        background: rgba(0,0,0,0.9);
        transform: translateX(5px);
        box-shadow: 
          0 0 20px rgba(0,0,0,0.5),
          0 0 30px var(--qitem-color);
      }

      .quiz-tool-active .quiz-orb-fan-label {
        color: var(--qitem-color);
        border-color: var(--qitem-color);
        background: rgba(0,0,0,0.9);
        box-shadow: 0 0 20px var(--qitem-color);
      }

      /* ═══════════════════════════════════════════════════════════════
        TOOLTIP — Floating label under main orb
      ═══════════════════════════════════════════════════════════════ */

      .quiz-orb-tooltip {
        position: absolute;
        bottom: -32px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 2px;
        color: rgba(255,255,255,0.6);
        white-space: nowrap;
        pointer-events: none;
        text-transform: uppercase;
        text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        animation: tooltipFloat 2s ease-in-out infinite;
        background: rgba(0,0,0,0.6);
        padding: 4px 12px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(8px);
      }

      @keyframes tooltipFloat {
        0%, 100% {
          transform: translateX(-50%) translateY(0);
        }
        50% {
          transform: translateX(-50%) translateY(-3px);
        }
      }

      /* ═══════════════════════════════════════════════════════════════
        RESPONSIVE ADJUSTMENTS
      ═══════════════════════════════════════════════════════════════ */

      @media (max-width: 768px) {
        .quiz-orb-wrap {
          bottom: 20px;
          left: 20px;
        }
        
        .quiz-main-orb {
          width: 60px;
          height: 60px;
        }
        
        .quiz-orb-fan-btn {
          width: 44px;
          height: 44px;
          font-size: 18px;
        }
      }
      
      @keyframes ambientGlow {
        from {
          opacity: 0.5;
          transform: scale(1);
        }
        to {
          opacity: 0.8;
          transform: scale(1.2);
        }
      }
      `}</style>

      {/* ── FLOATING ORB ── */}
      <div className="floating-orb-wrap">
        <div className={`orb-fan ${orbOpen ? 'open' : ''}`}>
          {toolTabs.map(t => (
            <div
              key={t.id}
              className={`orb-fan-item ${viewMode === t.id ? 'tool-active' : ''}`}
              style={{ '--item-color': t.color }}
              onClick={() => { setViewMode(viewMode === t.id ? 'courses' : t.id); setOrbOpen(false); }}
            >
              <span className="orb-fan-label">{t.label}</span>
              <div className="orb-fan-btn">{t.icon}</div>
            </div>
          ))}
        </div>

        <button className={`main-orb ${orbOpen ? 'open' : ''}`} onClick={() => setOrbOpen(o => !o)} title="Tools">
          {orbOpen ? '✕' : '🔮'}
          <span className="orb-tooltip">{orbOpen ? 'close' : 'tools'}</span>
        </button>
      </div>

      {/* ── QUIZ ORB — bottom-left floating brain orb ── */}
      <div className="quiz-orb-wrap">
        <div className={`quiz-orb-fan ${quizOrbOpen ? 'open' : ''}`}>
          {[
            { id: 'quiz-python', label: 'Python Quiz', icon: '🐍', color: '#22d3ee' },
            { id: 'quiz-mysql',  label: 'MySQL Quiz',  icon: '🗄️', color: '#a855f7' },
          ].map((t, i) => (
            <div
              key={t.id}
              className={`quiz-orb-fan-item ${viewMode === t.id ? 'quiz-tool-active' : ''}`}
              style={{ '--qitem-color': t.color }}
              onClick={() => { setViewMode(viewMode === t.id ? 'courses' : t.id); setQuizOrbOpen(false); }}
            >
              <div className="quiz-orb-fan-btn">{t.icon}</div>
              <span className="quiz-orb-fan-label">{t.label}</span>
            </div>
          ))}
        </div>
        <button
          className={`quiz-main-orb ${quizOrbOpen ? 'open' : ''} ${(viewMode==='quiz-python'||viewMode==='quiz-mysql') ? 'quiz-active' : ''}`}
          onClick={() => setQuizOrbOpen(o => !o)}
          title="Quizzes"
        >
          {quizOrbOpen ? '✕' : (viewMode==='quiz-python'||viewMode==='quiz-mysql') ? '❓' : '🧠'}
          <span className="quiz-orb-tooltip">{quizOrbOpen ? 'close' : 'quizzes'}</span>
        </button>
      </div>
    </div>
  );
}