import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import MLVisuals from "../seekhowithrua-animation/MLVisuals";
import PythonVisuals from "../seekhowithrua-animation/PythonVisuals";
import WhiteBoard from "../seekhowithrua-animation/WhiteBoard";
import {
  loadSyllabusData,
  saveSyllabusData,
  resetSyllabusData,
  generateDefaultContent,
} from "./SyllabusData";

const API_URL = import.meta.env.VITE_API_URL || "https://django-react-ml-app.onrender.com/api/ml";

const getLoggedInUser = () => {
  try {
    const raw = localStorage.getItem("cosmos_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const checkMaster = () => {
  const user = getLoggedInUser();
  const masterEmails = ["master@gmail.com", "seekhowithrua@gmail.com"];
  return masterEmails.includes(user?.email) && !!user?.token;
};

const uid = () => Math.random().toString(36).slice(2, 8);

const isTrainer = () => {
  const user = getLoggedInUser();
  if (!user) return false;
  const role = user?.profile?.role || user?.role || "";
  return role === "trainer";
};

// ── Quiz Data ──
const pythonQuizzes = {
  basics: [
    { id:"pb1", level:"basics", tag:"DSA", title:"Reverse a List", question:"Write a function that reverses a list in-place without using built-in reverse().\nInput: [1,2,3,4,5]\nPrint the reversed list.", starterCode:'def reverse_list(lst):\n    # your code here\n    pass\n\nprint(reverse_list([1,2,3,4,5]))', expectedOutput:'[5, 4, 3, 2, 1]' },
    { id:"pb2", level:"basics", tag:"DSA", title:"Check Palindrome", question:"Write a function is_palindrome(s) that returns True if a string is a palindrome, False otherwise.\nTest with 'racecar' and 'hello'.", starterCode:"def is_palindrome(s):\n    # your code here\n    pass\n\nprint(is_palindrome('racecar'))\nprint(is_palindrome('hello'))", expectedOutput:'True\nFalse' },
    { id:"pb3", level:"basics", tag:"DSA", title:"Fibonacci Sequence", question:"Print the first 8 Fibonacci numbers starting from 0 using a loop.", starterCode:'# your code here', expectedOutput:'0 1 1 2 3 5 8 13' },
    { id:"pb4", level:"basics", tag:"DSA", title:"Find Duplicates", question:"Given a list [1,2,3,2,4,1,5], print all duplicate elements (unique duplicates, sorted).", starterCode:'lst = [1,2,3,2,4,1,5]\n# your code here', expectedOutput:'[1, 2]' },
    { id:"pb5", level:"basics", tag:"DSA", title:"Count Vowels", question:"Write a function that counts vowels in a string.\nTest: count_vowels('Hello World')", starterCode:"def count_vowels(s):\n    # your code here\n    pass\n\nprint(count_vowels('Hello World'))", expectedOutput:'3' },
  ],
  intermediate: [
    { id:"pi1", level:"intermediate", tag:"DSA", title:"Binary Search", question:"Implement binary search. Search for 17 in [1,3,5,7,9,11,13,15,17,19].\nReturn the index.", starterCode:'def binary_search(arr, target):\n    # your code here\n    pass\n\nprint(binary_search([1,3,5,7,9,11,13,15,17,19], 17))', expectedOutput:'8' },
    { id:"pi2", level:"intermediate", tag:"DSA", title:"Merge Sort", question:"Implement merge sort and sort [38,27,43,3,9,82,10].", starterCode:'def merge_sort(arr):\n    # your code here\n    pass\n\nprint(merge_sort([38,27,43,3,9,82,10]))', expectedOutput:'[3, 9, 10, 27, 38, 43, 82]' },
  ],
  advanced: [
    { id:"pa1", level:"advanced", tag:"DSA", title:"Dijkstra's Shortest Path", question:"Dijkstra from node 0 in graph. Print shortest distances to all nodes.", starterCode:"import heapq\n\ndef dijkstra(graph, start):\n    dist = {n: float('inf') for n in graph}\n    dist[start] = 0\n    pq = [(0, start)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in graph[u]:\n            if dist[u]+w < dist[v]:\n                dist[v] = dist[u]+w\n                heapq.heappush(pq,(dist[v],v))\n    return dist\n\ngraph = {0:[(1,4),(2,1)],1:[(3,1)],2:[(1,2),(3,5)],3:[]}\nfor k in sorted(dijkstra(graph,0)): print(f'{k}: {dijkstra(graph,0)[k]}')", expectedOutput:'0: 0\n1: 3\n2: 1\n3: 4' },
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

// ── Pyodide (lazy, singleton) ──
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

// ── Three.js Background (memory-efficient, auto-cleanup) ──
const ThreeBackground = () => {
  const mountRef = useRef(null);
  const animRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    let THREE;
    let scene, camera, renderer, particles, geo, mat;

    const init = async () => {
      try {
        THREE = await import('https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js').catch(() => null);
        if (!THREE || !mountRef.current) return;

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 80;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;z-index:0;opacity:0.35;';
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Particle system — low count for performance
        const count = 600;
        geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const palette = [[0,0.85,1],[0.66,0.33,0.87],[0.13,0.82,0.53]];
        for (let i = 0; i < count; i++) {
          positions[i*3]   = (Math.random()-0.5)*200;
          positions[i*3+1] = (Math.random()-0.5)*200;
          positions[i*3+2] = (Math.random()-0.5)*100;
          const c = palette[Math.floor(Math.random()*palette.length)];
          colors[i*3]=c[0]; colors[i*3+1]=c[1]; colors[i*3+2]=c[2];
        }
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        mat = new THREE.PointsMaterial({ size: 0.6, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true });
        particles = new THREE.Points(geo, mat);
        scene.add(particles);

        let frame = 0;
        const animate = () => {
          animRef.current = requestAnimationFrame(animate);
          frame++;
          if (frame % 2 !== 0) return; // Skip every other frame for perf
          particles.rotation.y += 0.0008;
          particles.rotation.x += 0.0003;
          renderer.render(scene, camera);
        };
        animate();

        const onResize = () => {
          if (!camera || !renderer) return;
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize, { passive: true });
        mountRef.current._cleanup = onResize;
      } catch(e) { /* silently skip if Three.js fails */ }
    };

    init();

    return () => {
      cancelAnimationFrame(animRef.current);
      if (geo) geo.dispose();
      if (mat) mat.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.domElement?.remove();
      }
      if (mountRef.current?._cleanup) {
        window.removeEventListener('resize', mountRef.current._cleanup);
      }
    };
  }, []);

  return <div ref={mountRef} style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0}} />;
};

// ── Code Editor ──
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
    <div className="syl-code-editor">
      <div className="syl-editor-toolbar">
        <span className="syl-editor-lang">{language === 'python' ? '🐍 Python' : '🗄️ MySQL'}</span>
        <button className="syl-clear-btn" onClick={() => onChange('')}>Clear</button>
      </div>
      <textarea className="syl-code-textarea" value={value} onChange={e => onChange(e.target.value)} onKeyDown={handleKeyDown} spellCheck={false} autoComplete="off" />
    </div>
  );
};

// ── Quiz Card ──
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

  const tagColors = { DSA:'#00d9ff',DATA:'#a855f7',FULLSTACK:'#ff6b6b',DDL:'#ffd43b',DML:'#00ff88',DQL:'#00d9ff',JOIN:'#ff9500',GROUP:'#a855f7',SUBQUERY:'#ff6b6b',OPTIMIZE:'#00d9ff',TRANSACTION:'#ff9500' };

  return (
    <div className={`syl-quiz-card ${result === 'correct' ? 'q-correct' : result === 'incorrect' ? 'q-incorrect' : ''}`}>
      <div className="syl-quiz-card-header">
        <div className="syl-quiz-meta">
          <span className="syl-quiz-tag" style={{background: tagColors[quiz.tag] || '#666'}}>{quiz.tag}</span>
          <span className="syl-quiz-level">{quiz.level}</span>
          {isCompleted && <span className="syl-quiz-solved">✓ Solved</span>}
        </div>
        <h2 className="syl-quiz-title">{quiz.title}</h2>
      </div>
      <div className="syl-quiz-question"><pre className="syl-question-pre">{quiz.question}</pre></div>
      <div className="syl-quiz-workspace">
        <CodeEditor value={code} onChange={setCode} language={quizType} />
        <div className="syl-quiz-controls">
          {quizType === 'python' && !pyodideReady && <span className="syl-loading-badge">⏳ Loading Python runtime...</span>}
          <button className={`syl-run-btn${running?' running':''}`} onClick={handleRun} disabled={running || (quizType==='python'&&!pyodideReady)}>
            {running ? '⏳ Running...' : '▶ Run Code'}
          </button>
        </div>
        {output !== '' && (
          <div className={`syl-output-panel ${result}`}>
            <div className="syl-output-header">
              <span>{result==='correct'?'✅ Correct!':result==='incorrect'?'❌ Not quite...':'💥 Error'}</span>
              {result==='incorrect' && <button className="syl-show-expected" onClick={()=>setOutput(p=>p+'\n\n--- Expected ---\n'+quiz.expectedOutput)}>Show Expected</button>}
            </div>
            <pre className="syl-output-text">{output}</pre>
          </div>
        )}
      </div>
      {result==='correct' && <div className="syl-correct-banner">🎉 100% Correct! Excellent work!</div>}
      {result==='incorrect' && <div className="syl-hint-banner">💡 Check your logic and try again!</div>}
    </div>
  );
};

// ── Quiz Platform ──
const Achievement = ({ message, icon, onClose }) => (
  <div className="syl-achievement" onClick={onClose}>
    <div className="syl-achievement-inner"><span>{icon}</span><span>{message}</span></div>
  </div>
);

const QuizPlatform = ({ quizType }) => {
  const [level, setLevel] = useState('basics');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState(new Set());
  const [achievement, setAchievement] = useState(null);

  const quizData = quizType === 'python' ? pythonQuizzes : mysqlQuizzes;
  const questions = quizData[level] || [];
  const current = questions[currentIdx];
  const totalCompleted = completedQuizzes.size;
  const totalQuestions = Object.values(quizData).flat().length;
  const levelCompleted = questions.filter(q => completedQuizzes.has(q.id)).length;
  const progress = Math.round((totalCompleted/totalQuestions)*100);
  const levelProgress = Math.round((levelCompleted/questions.length)*100);

  const handleComplete = (qid) => {
    const newSet = new Set(completedQuizzes);
    newSet.add(qid);
    setCompletedQuizzes(newSet);
    const total = newSet.size;
    if (total===1) setAchievement({icon:'🌟',msg:"First solve! You're on your way!"});
    else if (total===10) setAchievement({icon:'🔥',msg:'10 Problems Solved!'});
  };

  const levels = ['basics','intermediate','advanced'];
  const levelIcons = {basics:'🌱',intermediate:'⚡',advanced:'🔥'};

  return (
    <div className="syl-quiz-platform">
      {achievement && <Achievement icon={achievement.icon} message={achievement.msg} onClose={()=>setAchievement(null)}/>}
      <div className="syl-quiz-header">
        <div className="syl-quiz-title-row">
          <span style={{fontSize:'28px'}}>{quizType==='python'?'🐍':'🗄️'}</span>
          <h1 className="syl-quiz-h1">{quizType==='python'?'Python':'MySQL'} Challenges</h1>
          <span className="syl-quiz-badge">CodeChef-Style</span>
        </div>
        <div className="syl-overall-prog">
          <span>{totalCompleted}/{totalQuestions} Solved</span>
          <div className="syl-prog-bar"><div className="syl-prog-fill" style={{width:`${progress}%`}}/></div>
          <span>{progress}%</span>
        </div>
      </div>
      <div className="syl-level-tabs">
        {levels.map(lv => {
          const lvQ = quizData[lv]||[];
          const lvDone = lvQ.filter(q=>completedQuizzes.has(q.id)).length;
          return (
            <button key={lv} className={`syl-level-tab${level===lv?' active':''}`} onClick={()=>{setLevel(lv);setCurrentIdx(0);}}>
              <span>{levelIcons[lv]}</span>
              <span>{lv.charAt(0).toUpperCase()+lv.slice(1)}</span>
              <span className="syl-lv-count">{lvDone}/{lvQ.length}</span>
            </button>
          );
        })}
      </div>
      <div className="syl-quiz-layout">
        <aside className="syl-quiz-sidebar">
          <div className="syl-qsidebar-header">
            <span>{levelIcons[level]} {level.charAt(0).toUpperCase()+level.slice(1)}</span>
            <span>{levelCompleted}/{questions.length}</span>
          </div>
          <div className="syl-prog-bar" style={{margin:'0 12px 8px'}}><div className="syl-prog-fill" style={{width:`${levelProgress}%`}}/></div>
          <div className="syl-quiz-list">
            {questions.map((q,idx)=>{
              const done=completedQuizzes.has(q.id);
              const active=idx===currentIdx;
              return (
                <button key={q.id} className={`syl-qlist-item${active?' active':''}${done?' done':''}`} onClick={()=>setCurrentIdx(idx)}>
                  <span className="syl-qnum">{idx+1}</span>
                  <div className="syl-qinfo">
                    <span className="syl-qtitle">{q.title}</span>
                    <span className="syl-qtag">{q.tag}</span>
                  </div>
                  {done?<span style={{color:'#00ff88',fontSize:'12px'}}>✓</span>:active?<span style={{color:'#00d9ff',fontSize:'10px'}}>►</span>:null}
                </button>
              );
            })}
          </div>
        </aside>
        <main className="syl-quiz-main">
          {current && (
            <>
              <QuizCard key={current.id} quiz={current} quizType={quizType} onComplete={handleComplete} isCompleted={completedQuizzes.has(current.id)}/>
              <div className="syl-quiz-nav">
                <button className="syl-qnav-btn" disabled={currentIdx===0} onClick={()=>setCurrentIdx(i=>i-1)}>← Prev</button>
                <span style={{color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>{currentIdx+1}/{questions.length}</span>
                <button className="syl-qnav-btn" disabled={currentIdx===questions.length-1} onClick={()=>setCurrentIdx(i=>i+1)}>Next →</button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// ── Celebration ──
const Celebration = ({ onClose }) => (
  <div className="syl-celebration" onClick={onClose}>
    <div className="syl-celebrate-box" onClick={e=>e.stopPropagation()}>
      <div style={{fontSize:'56px',marginBottom:'16px'}}>🎉</div>
      <h2 style={{color:'white',margin:'0 0 10px'}}>Course Complete!</h2>
      <p style={{color:'rgba(255,255,255,0.6)',margin:'0 0 20px'}}>You've mastered this course!</p>
      <div style={{fontSize:'36px',display:'flex',gap:'12px',justifyContent:'center',marginBottom:'24px'}}>🏆⭐🎯</div>
      <button className="syl-btn-primary" onClick={onClose}>Continue Learning</button>
    </div>
    {[...Array(40)].map((_,i)=>(
      <span key={i} style={{position:'absolute',left:`${Math.random()*100}%`,top:'-10px',width:'8px',height:'8px',borderRadius:'2px',background:['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff'][Math.floor(Math.random()*6)],animation:`sylConfetti 3s ease-in ${Math.random()*3}s infinite`}}/>
    ))}
  </div>
);

const ModuleComplete = ({ moduleName, onNext }) => (
  <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'80px 40px',textAlign:'center',flex:1}}>
    <div style={{fontSize:'56px',marginBottom:'16px',animation:'sylPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275)'}}>✨</div>
    <h3 style={{fontSize:'24px',fontWeight:'800',color:'white',margin:'0 0 8px'}}>Module Complete!</h3>
    <p style={{color:'rgba(255,255,255,0.5)',margin:'0 0 24px'}}>You've finished <strong style={{color:'white'}}>{moduleName}</strong></p>
    <button className="syl-btn-primary" onClick={onNext}>Next Module →</button>
  </div>
);

// ── Inline Editable ──
const InlineEdit = ({ value, onSave, className='', multiline=false, placeholder='Click to edit...' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef(null);
  useEffect(()=>{ if(editing&&ref.current) ref.current.focus(); },[editing]);
  const commit = () => { if(draft.trim()) onSave(draft.trim()); else setDraft(value); setEditing(false); };
  if (editing) {
    const props = { ref, className:`syl-inline-input${multiline?' multiline':''}`, value:draft, onChange:e=>setDraft(e.target.value), onBlur:commit, onKeyDown:e=>{if(!multiline&&e.key==='Enter')commit();if(e.key==='Escape'){setDraft(value);setEditing(false);}} };
    return multiline ? <textarea {...props} rows={4}/> : <input {...props}/>;
  }
  return (
    <span className={`syl-editable ${className}`} onDoubleClick={()=>{setDraft(value);setEditing(true);}} title="Double-click to edit">
      {value||<em style={{opacity:0.4}}>{placeholder}</em>}
      <span className="syl-edit-hint">✏️</span>
    </span>
  );
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="syl-confirm-overlay">
    <div className="syl-confirm-modal">
      <div style={{fontSize:'32px',marginBottom:'12px'}}>⚠️</div>
      <p style={{color:'rgba(255,255,255,0.85)',fontSize:'14px',marginBottom:'20px',lineHeight:1.5}}>{message}</p>
      <div style={{display:'flex',gap:'10px',justifyContent:'center'}}>
        <button className="syl-confirm-cancel" onClick={onCancel}>Cancel</button>
        <button className="syl-confirm-delete" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

const ContentEditorModal = ({ topic, content, onSave, onClose }) => {
  const [draft, setDraft] = useState(()=>JSON.parse(JSON.stringify(content)));
  const updateSection = (idx,field,val) => { const s=[...draft.sections]; s[idx]={...s[idx],[field]:val}; setDraft({...draft,sections:s}); };
  const addSection = () => setDraft({...draft,sections:[...draft.sections,{heading:'New Section',text:'Enter content...'}]});
  const removeSection = (idx) => setDraft({...draft,sections:draft.sections.filter((_,i)=>i!==idx)});
  const moveSection = (idx,dir) => { const s=[...draft.sections]; const to=idx+dir; if(to<0||to>=s.length)return; [s[idx],s[to]]=[s[to],s[idx]]; setDraft({...draft,sections:s}); };
  return (
    <div className="syl-cem-overlay">
      <div className="syl-cem-modal">
        <div className="syl-cem-header">
          <h2 style={{margin:0,fontSize:'16px',color:'white'}}>✏️ Editing: <span style={{color:'#00d9ff'}}>{topic}</span></h2>
          <button className="syl-cem-close" onClick={onClose}>✕</button>
        </div>
        <div className="syl-cem-body">
          <div className="syl-cem-field"><label>Topic Title</label><input className="syl-cem-input" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></div>
          <div className="syl-cem-field"><label>Description</label><textarea className="syl-cem-textarea" value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} rows={3}/></div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
            <label style={{fontSize:'11px',fontWeight:700,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.5px'}}>Sections</label>
            <button className="syl-cem-add-section" onClick={addSection}>+ Add Section</button>
          </div>
          {draft.sections.map((sec,idx)=>(
            <div key={idx} className="syl-cem-section-block">
              <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'8px'}}>
                <span style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',fontWeight:700,flex:1}}>§{idx+1}</span>
                <button className="syl-cem-move" onClick={()=>moveSection(idx,-1)} disabled={idx===0}>↑</button>
                <button className="syl-cem-move" onClick={()=>moveSection(idx,1)} disabled={idx===draft.sections.length-1}>↓</button>
                <button className="syl-cem-remove" onClick={()=>removeSection(idx)}>✕</button>
              </div>
              <input className="syl-cem-input" placeholder="Section heading" value={sec.heading} onChange={e=>updateSection(idx,'heading',e.target.value)}/>
              <textarea className="syl-cem-textarea" placeholder="Section content..." value={sec.text} onChange={e=>updateSection(idx,'text',e.target.value)} rows={4}/>
            </div>
          ))}
        </div>
        <div className="syl-cem-footer">
          <button className="syl-cem-cancel" onClick={onClose}>Cancel</button>
          <button className="syl-cem-save" onClick={()=>{onSave(draft);onClose();}}>💾 Save</button>
        </div>
      </div>
    </div>
  );
};

// ── Trainer Panel ──
const TrainerSyllabusPanel = ({ syllabusData, activeSubject, onUpdateSyllabus, onClose }) => {
  const [confirm, setConfirm] = useState(null);
  const subject = syllabusData[activeSubject];

  const updateSubjectTitle = (val) => onUpdateSyllabus(prev=>({...prev,[activeSubject]:{...prev[activeSubject],title:val}}));
  const addModule = () => { const name=`New Module ${uid()}`; onUpdateSyllabus(prev=>({...prev,[activeSubject]:{...prev[activeSubject],modules:{...prev[activeSubject].modules,[name]:["New Topic"]}}})); };
  const renameModule = (oldName,newName) => {
    if(!newName||newName===oldName)return;
    onUpdateSyllabus(prev=>{
      const modules={...prev[activeSubject].modules};
      const topics=modules[oldName];
      const ordered=Object.keys(modules);
      const idx=ordered.indexOf(oldName);
      const newModules={};
      ordered.forEach((k,i)=>{newModules[i===idx?newName:k]=modules[k];});
      return{...prev,[activeSubject]:{...prev[activeSubject],modules:newModules}};
    });
  };
  const deleteModule = (moduleName) => onUpdateSyllabus(prev=>{ const modules={...prev[activeSubject].modules}; delete modules[moduleName]; return{...prev,[activeSubject]:{...prev[activeSubject],modules}}; });
  const addTopic = (moduleName) => { const topicName=`New Topic ${uid()}`; onUpdateSyllabus(prev=>({...prev,[activeSubject]:{...prev[activeSubject],modules:{...prev[activeSubject].modules,[moduleName]:[...prev[activeSubject].modules[moduleName],topicName]}}})); };
  const renameTopic = (moduleName,oldTopic,newTopic) => {
    if(!newTopic||newTopic===oldTopic)return;
    onUpdateSyllabus(prev=>({...prev,[activeSubject]:{...prev[activeSubject],modules:{...prev[activeSubject].modules,[moduleName]:prev[activeSubject].modules[moduleName].map(t=>t===oldTopic?newTopic:t)},topicContent:(()=>{ const tc={...prev[activeSubject].topicContent}; if(tc[oldTopic]){tc[newTopic]=tc[oldTopic];delete tc[oldTopic];} return tc; })()}}));
  };
  const deleteTopic = (moduleName,topic) => onUpdateSyllabus(prev=>({...prev,[activeSubject]:{...prev[activeSubject],modules:{...prev[activeSubject].modules,[moduleName]:prev[activeSubject].modules[moduleName].filter(t=>t!==topic)}}}));
  const moveTopic = (moduleName,topicIdx,dir) => onUpdateSyllabus(prev=>{ const topics=[...prev[activeSubject].modules[moduleName]]; const to=topicIdx+dir; if(to<0||to>=topics.length)return prev; [topics[topicIdx],topics[to]]=[topics[to],topics[topicIdx]]; return{...prev,[activeSubject]:{...prev[activeSubject],modules:{...prev[activeSubject].modules,[moduleName]:topics}}}; });

  return (
    <div className="syl-trainer-panel">
      {confirm&&<ConfirmModal message={confirm.message} onConfirm={()=>{confirm.action();setConfirm(null);}} onCancel={()=>setConfirm(null)}/>}
      <div className="syl-tp-header">
        <span style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',fontWeight:700,color:'#ffa500'}}>⚙️ Syllabus Editor</span>
        <button className="syl-tp-close" onClick={onClose}>✕</button>
      </div>
      <div className="syl-tp-body">
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
          <span style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',whiteSpace:'nowrap'}}>Course Title</span>
          <InlineEdit value={subject.title} onSave={updateSubjectTitle} className="syl-tp-title-edit"/>
        </div>
        <div style={{height:'1px',background:'rgba(255,255,255,0.06)',margin:'4px 0 12px'}}/>
        {Object.entries(subject.modules).map(([moduleName,topics])=>(
          <div key={moduleName} className="syl-tp-module">
            <div className="syl-tp-module-header">
              <span style={{color:'rgba(255,255,255,0.2)',fontSize:'14px'}}>⠿</span>
              <InlineEdit value={moduleName} onSave={val=>renameModule(moduleName,val)} className="syl-tp-module-name" placeholder="Module name..."/>
              <div style={{display:'flex',gap:'4px'}}>
                <button className="syl-tp-btn syl-tp-add" onClick={()=>addTopic(moduleName)}>+</button>
                <button className="syl-tp-btn syl-tp-del" onClick={()=>setConfirm({message:`Delete module "${moduleName}" and all its topics?`,action:()=>deleteModule(moduleName)})}>🗑</button>
              </div>
            </div>
            <div className="syl-tp-topics">
              {topics.map((topic,tIdx)=>(
                <div key={topic+tIdx} className="syl-tp-topic-row">
                  <span style={{color:'rgba(255,255,255,0.2)',fontSize:'10px',flexShrink:0}}>◇</span>
                  <InlineEdit value={topic} onSave={val=>renameTopic(moduleName,topic,val)} className="syl-tp-topic-name" placeholder="Topic name..."/>
                  <div style={{display:'flex',gap:'3px'}}>
                    <button className="syl-tp-sm" onClick={()=>moveTopic(moduleName,tIdx,-1)} disabled={tIdx===0}>↑</button>
                    <button className="syl-tp-sm" onClick={()=>moveTopic(moduleName,tIdx,1)} disabled={tIdx===topics.length-1}>↓</button>
                    <button className="syl-tp-sm syl-tp-del-sm" onClick={()=>setConfirm({message:`Delete topic "${topic}"?`,action:()=>deleteTopic(moduleName,topic)})}>✕</button>
                  </div>
                </div>
              ))}
              <button className="syl-tp-add-topic" onClick={()=>addTopic(moduleName)}>+ Add Topic</button>
            </div>
          </div>
        ))}
        <button className="syl-tp-add-module" onClick={addModule}>+ Add New Module</button>
      </div>
    </div>
  );
};

// ── Course Card ──
const CourseCard = ({ course, onClick, isActive }) => {
  const topicCount = course.modules?.reduce((acc,mod)=>acc+(mod.topics?.length||0),0)||0;
  return (
    <div className={`syl-course-card${isActive?' active':''}`} onClick={onClick} style={{'--card-color':course.color}}>
      <div className="syl-course-card-glow"/>
      <div className="syl-course-icon">{course.icon}</div>
      <div className="syl-course-info">
        <h3 className="syl-course-title">{course.title}</h3>
        <p className="syl-course-desc">{course.description||'Learn with hands-on projects'}</p>
        <div className="syl-course-meta">
          <span className="syl-course-chip">{course.modules?.length||0} modules</span>
          <span className="syl-course-chip">{topicCount} topics</span>
        </div>
      </div>
      {isActive && <div className="syl-card-active-badge">Selected</div>}
    </div>
  );
};

// ── Main Page ──
export default function SyllabusPage() {
  const [trainerMode, setTrainerMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isMasterUser, setIsMasterUser] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syllabusData, setSyllabusData] = useState(()=>loadSyllabusData());
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [viewMode, setViewMode] = useState('courses');
  const [activeSubject, setActiveSubject] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [activeTopic, setActiveTopic] = useState('');
  const [content, setContent] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [completedModules, setCompletedModules] = useState(new Set());
  const [showCelebration, setShowCelebration] = useState(false);
  const [showModuleComplete, setShowModuleComplete] = useState(false);
  const [currentModuleComplete, setCurrentModuleComplete] = useState('');
  const [trainerPanelOpen, setTrainerPanelOpen] = useState(false);
  const [contentEditorOpen, setContentEditorOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingContent, setEditingContent] = useState(null);
  const [orbOpen, setOrbOpen] = useState(false);
  const [quizOrbOpen, setQuizOrbOpen] = useState(false);

  useEffect(()=>{
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://django-react-ml-app.onrender.com/api/ml/syllabus/courses/');
        setCourses(response.data);
      } catch(err) {
        const localData = loadSyllabusData();
        const fallback = Object.entries(localData).map(([id,data])=>({
          id, ...data,
          modules: Object.entries(data.modules||{}).map(([title,topics],idx)=>({id:idx,title,order:idx,topics:topics.map((t,tIdx)=>({id:tIdx,title:t,order:tIdx}))}))
        }));
        setCourses(fallback);
      } finally { setLoading(false); }
    };
    fetchCourses();
  },[]);

  useEffect(()=>{
    const check = () => {
      const trainer = isTrainer();
      const master = checkMaster();
      setTrainerMode(trainer);
      setIsMasterUser(master);
      setUserRole(trainer?'trainer':getLoggedInUser()?'learner':'guest');
    };
    check();
    window.addEventListener('storage', check);
    localStorage.removeItem('cosmos_syllabus_data');
    return ()=>window.removeEventListener('storage', check);
  },[]);

  const updateSyllabus = useCallback((updater)=>{
    setSyllabusData(prev=>{
      const next = typeof updater==='function'?updater(prev):updater;
      saveSyllabusData(next);
      setSavedIndicator(true);
      setTimeout(()=>setSavedIndicator(false),2000);
      return next;
    });
  },[]);

  const currentSubject = activeSubject ? syllabusData[activeSubject] : null;
  const allModules = currentSubject ? Object.keys(currentSubject.modules) : [];
  const allTopics = currentSubject ? allModules.flatMap(m=>currentSubject.modules[m]) : [];

  const getTopicContent = useCallback((topic)=>{
    if (!currentSubject) return null;
    return currentSubject.topicContent?.[topic] || generateDefaultContent(topic);
  },[currentSubject]);

  const saveTopicContent = (topic,newContent) => {
    updateSyllabus(prev=>({...prev,[activeSubject]:{...prev[activeSubject],topicContent:{...(prev[activeSubject].topicContent||{}),[topic]:newContent}}}));
    setContent(newContent);
  };

  const getCurrentPosition = () => {
    if (!currentSubject) return null;
    for (const module of allModules) {
      const topics = currentSubject.modules[module];
      const idx = topics.indexOf(activeTopic);
      if (idx!==-1) return {module,moduleIndex:allModules.indexOf(module),topicIndex:idx,topics};
    }
    return null;
  };

  const handleNext = () => {
    const pos = getCurrentPosition();
    if (!pos) return;
    const {module,moduleIndex,topicIndex,topics} = pos;
    const newCompleted = new Set(completedTopics);
    newCompleted.add(activeTopic);
    setCompletedTopics(newCompleted);
    if (topicIndex===topics.length-1) {
      const newCompletedModules = new Set(completedModules);
      newCompletedModules.add(module);
      setCompletedModules(newCompletedModules);
      if (newCompletedModules.size===allModules.length){setShowCelebration(true);return;}
      setCurrentModuleComplete(module);
      setShowModuleComplete(true);
      setActiveModule(null);setActiveTopic('');setContent(null);
      return;
    }
    const nextTopic = topics[topicIndex+1];
    setActiveTopic(nextTopic);
    setContent(getTopicContent(nextTopic));
  };

  const handlePrevious = () => {
    const pos = getCurrentPosition();
    if (!pos||pos.topicIndex===0) return;
    const prevTopic = pos.topics[pos.topicIndex-1];
    setActiveTopic(prevTopic);
    setContent(getTopicContent(prevTopic));
  };

  const handleNextModule = () => {
    const pos = getCurrentPosition();
    const nextModuleIndex = pos?pos.moduleIndex+1:0;
    if (nextModuleIndex<allModules.length){
      const nextModule = allModules[nextModuleIndex];
      setActiveModule(nextModule);
      const firstTopic = currentSubject.modules[nextModule][0];
      setActiveTopic(firstTopic);
      setContent(getTopicContent(firstTopic));
      setShowModuleComplete(false);
    }
  };

  const progress = allTopics.length>0?Math.round((completedTopics.size/allTopics.length)*100):0;
  const canGoNext = !!(activeTopic&&completedTopics.size<allTopics.length);
  const canGoPrevious = !!(activeTopic&&getCurrentPosition()?.topicIndex>0);

  const handleCourseSelect = (courseId) => {
    setActiveSubject(courseId);
    const selectedCourse = courses.find(c=>c.id===courseId);
    if (selectedCourse){
      const modules={};
      selectedCourse.modules?.forEach(mod=>{ modules[mod.title]=mod.topics?.map(t=>t.title)||[]; });
      setSyllabusData(prev=>({...prev,[courseId]:{title:selectedCourse.title,icon:selectedCourse.icon,color:selectedCourse.color,description:selectedCourse.description,modules,topicContent:prev[courseId]?.topicContent||{}}}));
    }
    setActiveModule(null);setActiveTopic('');setContent(null);
    setCompletedTopics(new Set());setCompletedModules(new Set());
    setShowCelebration(false);setShowModuleComplete(false);
  };

  const handleTopicClick = (topic,moduleName)=>{
    setActiveTopic(topic);setActiveModule(moduleName);
    setContent(getTopicContent(topic));setShowModuleComplete(false);
    if(window.innerWidth<768)setSidebarCollapsed(true);
  };

  const handleResetSyllabus = ()=>{
    if(window.confirm("Reset all syllabus changes to default?")){ const reset=resetSyllabusData(); setSyllabusData(reset); setActiveModule(null);setActiveTopic('');setContent(null); }
  };

  const toolTabs = [
    {id:'ml-visuals',label:'ML Visuals',icon:'🤖',color:'#a855f7'},
    {id:'py-visuals',label:'Python Visuals',icon:'🐍',color:'#22d3ee'},
    {id:'whiteboard',label:'Whiteboard',icon:'🖊️',color:'#f59e0b'},
  ];
  const topTabs = [
    {id:'courses',label:'📚 Courses',icon:'📚'},
    {id:'quiz-python',label:'🐍 Python Quiz',icon:'🐍'},
    {id:'quiz-mysql',label:'🗄️ MySQL Quiz',icon:'🗄️'},
  ];

  return (
    <div className="syl-page">
      <ThreeBackground/>

      {/* Content Editor Modal */}
      {isMasterUser&&contentEditorOpen&&editingTopic&&(
        <ContentEditorModal topic={editingTopic} content={editingContent} onSave={nc=>saveTopicContent(editingTopic,nc)} onClose={()=>{setContentEditorOpen(false);setEditingTopic(null);setEditingContent(null);}}/>
      )}

      {/* Mode Tabs */}
      <div className="syl-mode-tabs">
        {topTabs.map(tab=>(
          <button key={tab.id} className={`syl-mode-tab${viewMode===tab.id?' active':''}`} onClick={()=>setViewMode(tab.id)}>
            <span>{tab.icon}</span><span>{tab.label}</span>
          </button>
        ))}
        {(trainerMode||isMasterUser)&&viewMode==='courses'&&(
          <div className="syl-trainer-toolbar">
            <span className="syl-trainer-badge">⚙️ Trainer</span>
            <button className={`syl-trainer-edit-btn${trainerPanelOpen?' active':''}`} onClick={()=>setTrainerPanelOpen(p=>!p)}>
              {trainerPanelOpen?'✕ Close':'✏️ Edit'}
            </button>
            <button className="syl-reset-btn" onClick={handleResetSyllabus}>↺</button>
            {savedIndicator&&<span className="syl-saved">✓ Saved</span>}
          </div>
        )}
      </div>

      {/* Tool Views */}
      {viewMode==='quiz-python'&&<QuizPlatform quizType="python"/>}
      {viewMode==='quiz-mysql'&&<QuizPlatform quizType="mysql"/>}
      {viewMode==='ml-visuals'&&<MLVisuals/>}
      {viewMode==='py-visuals'&&<PythonVisuals/>}
      {viewMode==='whiteboard'&&<WhiteBoard/>}

      {/* Courses View */}
      {viewMode==='courses'&&(
        <div className="syl-courses-view">
          {/* Hero Header */}
          {!activeSubject&&(
            <div className="syl-hero">
              <div className="syl-hero-badge">✦ LEARNING PATHS</div>
              <h1 className="syl-hero-title">Master Your Skills</h1>
              <p className="syl-hero-sub">Choose a course and start your journey from beginner to expert</p>
            </div>
          )}

          {/* Course Grid */}
          {loading?(
            <div className="syl-loading">
              <div className="syl-spinner"/>
              <p>Loading courses...</p>
            </div>
          ):(
            <div className={`syl-courses-grid${activeSubject?' syl-courses-grid--compact':''}`}>
              {courses.map(course=>(
                <CourseCard key={course.id} course={course} isActive={activeSubject===course.id} onClick={()=>handleCourseSelect(course.id)}/>
              ))}
              {courses.length===0&&(
                <div className="syl-no-courses">
                  <span style={{fontSize:'48px'}}>📚</span>
                  <p>No courses available yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Trainer Panel */}
          {(trainerMode||isMasterUser)&&trainerPanelOpen&&activeSubject&&(
            <div className="syl-trainer-panel-wrap">
              <TrainerSyllabusPanel syllabusData={syllabusData} activeSubject={activeSubject} onUpdateSyllabus={updateSyllabus} onClose={()=>setTrainerPanelOpen(false)}/>
            </div>
          )}

          {/* Detailed Course View */}
          {activeSubject&&currentSubject&&(
            <>
              {showCelebration&&<Celebration onClose={()=>setShowCelebration(false)}/>}

              {/* Subject Tabs */}
              <div className="syl-subject-tabs">
                {courses.map(course=>(
                  <button key={course.id} className={`syl-subject-tab${activeSubject===course.id?' active':''}`} onClick={()=>handleCourseSelect(course.id)} style={{'--sc':course.color}}>
                    <span>{course.icon}</span><span className="syl-tab-text">{course.title}</span>
                    {activeSubject===course.id&&<div className="syl-tab-line"/>}
                  </button>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="syl-prog-strip">
                <div className="syl-prog-strip-fill" style={{width:`${progress}%`}}/>
                <span className="syl-prog-strip-text">{progress}% Complete</span>
              </div>

              {/* Layout */}
              <div className="syl-layout-root">
                {/* Sidebar */}
                {!sidebarCollapsed&&(
                  <aside className="syl-sidebar">
                    <div className="syl-sidebar-head">
                      <div className="syl-sidebar-title">
                        <span style={{fontSize:'18px'}}>{currentSubject.icon}</span>
                        <span>{currentSubject.title}</span>
                      </div>
                      <button className="syl-collapse-btn" onClick={()=>setSidebarCollapsed(true)}>‹</button>
                    </div>
                    <div className="syl-modules-list">
                      {Object.entries(currentSubject.modules).map(([moduleName,topics])=>{
                        const isModuleComplete = completedModules.has(moduleName);
                        const isModuleActive = activeModule===moduleName;
                        const moduleDone = topics.filter(t=>completedTopics.has(t)).length;
                        return (
                          <div key={moduleName} className="syl-module-group">
                            <button className={`syl-module-btn${isModuleActive?' active':''}${isModuleComplete?' done':''}`} onClick={()=>setActiveModule(isModuleActive?null:moduleName)}>
                              <span className="syl-mod-icon">{isModuleComplete?'✓':isModuleActive?'▾':'▸'}</span>
                              <span className="syl-mod-name">{moduleName}</span>
                              <span className={`syl-mod-count${isModuleComplete?' done':''}`}>
                                {isModuleComplete?'Done':`${moduleDone}/${topics.length}`}
                              </span>
                            </button>
                            {isModuleActive&&(
                              <div className="syl-topics-list">
                                {topics.map((topic,idx)=>{
                                  const isCompleted=completedTopics.has(topic);
                                  const isActive=activeTopic===topic;
                                  const hasCustom=!!currentSubject.topicContent?.[topic];
                                  return (
                                    <button key={topic} className={`syl-topic-btn${isActive?' active':''}${isCompleted?' done':''}`} onClick={()=>handleTopicClick(topic,moduleName)} style={{animationDelay:`${idx*0.04}s`}}>
                                      {isActive&&<div className="syl-topic-active-bar"/>}
                                      <span className="syl-topic-dot">{isCompleted?'✓':isActive?'◆':'◇'}</span>
                                      <span className="syl-topic-text">{topic}</span>
                                      {isMasterUser&&hasCustom&&<span className="syl-custom-dot" title="Custom content">●</span>}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="syl-sidebar-foot">
                      <span style={{fontSize:'11px',color:'rgba(255,255,255,0.35)'}}>Progress</span>
                      <div className="syl-mini-prog"><div style={{width:`${progress}%`,height:'100%',background:'linear-gradient(90deg,#00d9ff,#a855f7)',transition:'width 0.5s'}}/></div>
                      <span style={{fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>{progress}%</span>
                    </div>
                  </aside>
                )}
                {sidebarCollapsed&&(
                  <button className="syl-expand-btn" onClick={()=>setSidebarCollapsed(false)}>›</button>
                )}

                {/* Content Area */}
                <main className="syl-content-area">
                  {showModuleComplete?(
                    <ModuleComplete moduleName={currentModuleComplete} onNext={handleNextModule}/>
                  ):!content?(
                    <div className="syl-welcome">
                      <div className="syl-welcome-icon">{currentSubject.icon}</div>
                      <h1 className="syl-welcome-title">{currentSubject.title}</h1>
                      <p className="syl-welcome-sub">Select a topic from the sidebar to begin</p>
                      <div className="syl-stats-row">
                        <div className="syl-stat"><span className="syl-stat-val">{allTopics.length}</span><span className="syl-stat-lbl">Topics</span></div>
                        <div className="syl-stat"><span className="syl-stat-val">{allModules.length}</span><span className="syl-stat-lbl">Modules</span></div>
                        <div className="syl-stat"><span className="syl-stat-val">{completedTopics.size}</span><span className="syl-stat-lbl">Completed</span></div>
                      </div>
                      <div className="syl-welcome-hint"><span style={{animation:'sylBounce 1.5s ease-in-out infinite',display:'inline-block'}}>‹</span> Choose a module to begin</div>
                    </div>
                  ):(
                    <div className="syl-content-display">
                      {/* Content Header */}
                      <div className="syl-content-header">
                        <div className="syl-breadcrumb">
                          <span>{currentSubject.title}</span>
                          <span className="syl-bc-sep">›</span>
                          <span>{activeModule}</span>
                          <span className="syl-bc-sep">›</span>
                          <span className="syl-bc-active">{activeTopic}</span>
                        </div>
                        <div className="syl-content-actions">
                          <button className={`syl-action-btn${completedTopics.has(activeTopic)?' done':''}`} title="Mark Complete" onClick={()=>{const s=new Set(completedTopics);s.add(activeTopic);setCompletedTopics(s);}}>
                            {completedTopics.has(activeTopic)?'✓ Done':'○ Mark'}
                          </button>
                          <button className="syl-action-btn" title="Bookmark">🔖</button>
                          <button className="syl-action-btn" title="Share">↗</button>
                          {isMasterUser&&(
                            <button className="syl-edit-content-btn" onClick={()=>{setEditingTopic(activeTopic);setEditingContent(getTopicContent(activeTopic));setContentEditorOpen(true);}}>
                              ✏️ Edit
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="syl-content-body">
                        <h1 className="syl-content-title">{content.title}</h1>
                        <p className="syl-content-desc">{content.description}</p>
                        {content.sections.map((section,idx)=>(
                          <section key={idx} className="syl-content-section">
                            <h3 className="syl-section-heading">{section.heading}</h3>
                            <p className="syl-section-text">{section.text}</p>
                          </section>
                        ))}
                        <div className="syl-playground-teaser">
                          <div className="syl-teaser-header"><span>💻</span><span>Practice Code</span></div>
                          <div className="syl-teaser-body">
                            <p style={{color:'rgba(255,255,255,0.5)',fontSize:'13px',margin:0}}>Interactive Python compiler coming soon...</p>
                            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                              <button className="syl-btn-primary">Open IDE</button>
                              <button className="syl-quiz-orb-inline" onClick={()=>setViewMode('quiz-python')} title="Take Quiz">🧠 Quiz</button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Footer */}
                      <div className="syl-content-footer">
                        <button className="syl-nav-btn" onClick={handlePrevious} disabled={!canGoPrevious}>← Previous</button>
                        <div className="syl-footer-prog">
                          <span>{completedTopics.size}/{allTopics.length} completed</span>
                          <div className="syl-mini-prog"><div style={{width:`${progress}%`,height:'100%',background:'linear-gradient(90deg,#00d9ff,#a855f7)',transition:'width 0.5s'}}/></div>
                        </div>
                        <button className="syl-nav-btn syl-nav-next" onClick={handleNext} disabled={!canGoNext}>
                          {completedTopics.size===allTopics.length-1?'Finish 🎉':'Next →'}
                        </button>
                      </div>
                    </div>
                  )}
                </main>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating Tool Orb */}
      <div className="syl-orb-wrap">
        <div className={`syl-orb-fan${orbOpen?' open':''}`}>
          {toolTabs.map(t=>(
            <div key={t.id} className={`syl-orb-item${viewMode===t.id?' orb-active':''}`} style={{'--oc':t.color}} onClick={()=>{setViewMode(viewMode===t.id?'courses':t.id);setOrbOpen(false);}}>
              <span className="syl-orb-label">{t.label}</span>
              <div className="syl-orb-btn">{t.icon}</div>
            </div>
          ))}
        </div>
        <button className={`syl-main-orb${orbOpen?' open':''}`} onClick={()=>setOrbOpen(o=>!o)}>
          {orbOpen?'✕':'🔮'}
        </button>
      </div>

      {/* Quiz Orb */}
      <div className="syl-quiz-orb-wrap">
        <div className={`syl-quiz-fan${quizOrbOpen?' open':''}`}>
          {[{id:'quiz-python',label:'Python Quiz',icon:'🐍',color:'#22d3ee'},{id:'quiz-mysql',label:'MySQL Quiz',icon:'🗄️',color:'#a855f7'}].map(t=>(
            <div key={t.id} className={`syl-quiz-fan-item${viewMode===t.id?' q-active':''}`} style={{'--qc':t.color}} onClick={()=>{setViewMode(viewMode===t.id?'courses':t.id);setQuizOrbOpen(false);}}>
              <div className="syl-quiz-fan-btn">{t.icon}</div>
              <span className="syl-quiz-fan-label">{t.label}</span>
            </div>
          ))}
        </div>
        <button className={`syl-quiz-orb${quizOrbOpen?' open':''}${(viewMode==='quiz-python'||viewMode==='quiz-mysql')?' q-active':''}`} onClick={()=>setQuizOrbOpen(o=>!o)}>
          {quizOrbOpen?'✕':(viewMode==='quiz-python'||viewMode==='quiz-mysql')?'❓':'🧠'}
        </button>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════════════════════
           SyllabusPage — Production CSS
           Desktop-first. Sidebar + content always visible at ≥769px.
           Mobile stacks vertically.
        ═══════════════════════════════════════════════════════════ */

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Page Root ── */
        .syl-page {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 100vh;
          background: #06001a;
          color: white;
          font-family: 'Segoe UI', system-ui, sans-serif;
          overflow-x: hidden;
        }
        .syl-page > * { position: relative; z-index: 1; }

        /* ── Mode Tabs ── */
        .syl-mode-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: rgba(0,0,0,0.5);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
          flex-wrap: wrap;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 200;
        }
        .syl-mode-tab {
          display: flex; align-items: center; gap: 7px;
          padding: 7px 15px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.65);
          cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all 0.2s; white-space: nowrap;
        }
        .syl-mode-tab:hover { background: rgba(255,255,255,0.09); color: white; border-color: rgba(255,255,255,0.25); }
        .syl-mode-tab.active {
          background: linear-gradient(135deg, rgba(0,217,255,0.18), rgba(168,85,247,0.18));
          border-color: #00d9ff; color: #00d9ff;
          box-shadow: 0 0 12px rgba(0,217,255,0.15);
        }
        .syl-trainer-toolbar {
          margin-left: auto;
          display: flex; align-items: center; gap: 7px;
          padding: 4px 10px;
          background: rgba(255,165,0,0.07);
          border: 1px solid rgba(255,165,0,0.2);
          border-radius: 8px;
        }
        .syl-trainer-badge { font-size: 11px; font-weight: 700; color: #ffa500; white-space: nowrap; }
        .syl-trainer-edit-btn { padding: 4px 12px; border-radius: 6px; border: 1px solid rgba(0,217,255,0.35); background: rgba(0,217,255,0.08); color: #00d9ff; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .syl-trainer-edit-btn:hover, .syl-trainer-edit-btn.active { background: rgba(0,217,255,0.18); }
        .syl-reset-btn { padding: 4px 9px; border-radius: 6px; border: 1px solid rgba(255,107,107,0.25); background: rgba(255,107,107,0.07); color: #ff6b6b; font-size: 12px; cursor: pointer; }
        .syl-saved { font-size: 11px; color: #00ff88; animation: sylFade 2s ease forwards; }
        @keyframes sylFade { 0%,15%{opacity:1} 85%,100%{opacity:0} }

        /* ── Courses View ── */
        .syl-courses-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }

        /* ── Hero ── */
        .syl-hero {
          text-align: center;
          padding: 48px 24px 32px;
          flex-shrink: 0;
        }
        .syl-hero-badge {
          display: inline-block;
          font-size: 11px; font-weight: 800; letter-spacing: 2px;
          color: #00d9ff;
          background: rgba(0,217,255,0.08);
          border: 1px solid rgba(0,217,255,0.2);
          padding: 4px 14px; border-radius: 20px;
          margin-bottom: 16px;
        }
        .syl-hero-title {
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 900;
          background: linear-gradient(135deg, #ffffff 0%, #00d9ff 50%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
          line-height: 1.2;
        }
        .syl-hero-sub { font-size: 16px; color: rgba(255,255,255,0.5); max-width: 500px; margin: 0 auto; }

        /* ── Course Grid ── */
        .syl-courses-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          padding: 16px 24px 24px;
          flex-shrink: 0;
        }
        .syl-courses-grid--compact {
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          padding: 10px 16px;
          gap: 12px;
        }

        /* ── Course Card ── */
        .syl-course-card {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(15,10,35,0.85);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
          overflow: hidden;
          backdrop-filter: blur(12px);
        }
        .syl-course-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--card-color, #00d9ff) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
          border-radius: 16px;
        }
        .syl-course-card:hover { transform: translateY(-4px) scale(1.02); border-color: var(--card-color, rgba(255,255,255,0.3)); box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 30px color-mix(in srgb, var(--card-color, #00d9ff) 20%, transparent); }
        .syl-course-card:hover::before { opacity: 0.06; }
        .syl-course-card.active { border-color: var(--card-color, #00d9ff); background: rgba(15,10,35,0.95); box-shadow: 0 0 25px color-mix(in srgb, var(--card-color, #00d9ff) 30%, transparent); }
        .syl-course-card.active::before { opacity: 0.1; }
        .syl-course-card-glow { position: absolute; bottom: -20px; right: -20px; width: 100px; height: 100px; border-radius: 50%; background: var(--card-color, #00d9ff); opacity: 0.05; filter: blur(20px); pointer-events: none; }
        .syl-course-icon { font-size: 36px; flex-shrink: 0; filter: drop-shadow(0 0 8px var(--card-color, #00d9ff)); }
        .syl-course-info { flex: 1; min-width: 0; }
        .syl-course-title { font-size: 16px; font-weight: 700; color: white; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .syl-course-desc { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .syl-course-meta { display: flex; gap: 6px; flex-wrap: wrap; }
        .syl-course-chip { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px; }
        .syl-card-active-badge { position: absolute; top: 10px; right: 10px; font-size: 10px; font-weight: 700; color: var(--card-color, #00d9ff); background: rgba(0,0,0,0.5); padding: 2px 8px; border-radius: 10px; border: 1px solid var(--card-color, #00d9ff); }

        /* ── Loading ── */
        .syl-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; gap: 16px; color: rgba(255,255,255,0.5); }
        .syl-spinner { width: 36px; height: 36px; border: 2px solid rgba(0,217,255,0.15); border-top-color: #00d9ff; border-radius: 50%; animation: sylSpin 0.8s linear infinite; }
        @keyframes sylSpin { to { transform: rotate(360deg); } }
        .syl-no-courses { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px; color: rgba(255,255,255,0.4); grid-column: 1/-1; }

        /* ── Subject Tabs ── */
        .syl-subject-tabs {
          display: flex;
          gap: 4px;
          padding: 8px 16px 0;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
          flex-wrap: wrap;
          overflow-x: auto;
        }
        .syl-subject-tab {
          position: relative;
          display: flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 9px 9px 0 0;
          border: 1px solid rgba(255,255,255,0.08); border-bottom: none;
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.55);
          cursor: pointer; font-size: 12px; font-weight: 600;
          transition: all 0.2s; white-space: nowrap; overflow: hidden;
        }
        .syl-subject-tab:hover { background: rgba(255,255,255,0.07); color: white; }
        .syl-subject-tab.active { background: rgba(255,255,255,0.08); color: white; border-color: var(--sc, rgba(255,255,255,0.2)); }
        .syl-tab-text { max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
        .syl-tab-line { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--sc, #00d9ff); }

        /* ── Progress Strip ── */
        .syl-prog-strip { height: 3px; background: rgba(255,255,255,0.05); position: relative; flex-shrink: 0; }
        .syl-prog-strip-fill { height: 100%; background: linear-gradient(90deg, #00d9ff, #a855f7); transition: width 0.6s ease; }
        .syl-prog-strip-text { position: absolute; right: 12px; top: 4px; font-size: 10px; color: rgba(255,255,255,0.35); white-space: nowrap; }

        /* ── Layout Root — THE KEY SECTION ──
           On desktop (≥769px): full remaining height, flex-row,
           sidebar and content share the space side-by-side.
           Each scrolls independently.
        ── */
        .syl-layout-root {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          /* Fill remaining viewport height */
          height: calc(100vh - 52px - 44px - 3px);
          /* 52px navbar + 44px mode-tabs + ~44px subject-tabs + 3px progress + course grid above */
          min-height: 400px;
          overflow: hidden;
          flex: 1;
        }

        /* ── Sidebar ── */
        .syl-sidebar {
          width: 268px;
          min-width: 268px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-right: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(8px);
        }
        .syl-sidebar-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 14px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink: 0;
          background: rgba(0,0,0,0.2);
        }
        .syl-sidebar-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; color: white;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          flex: 1; min-width: 0;
        }
        .syl-collapse-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); padding: 4px 8px; border-radius: 6px;
          cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.2s; flex-shrink: 0;
          line-height: 1;
        }
        .syl-collapse-btn:hover { background: rgba(255,255,255,0.12); color: white; }
        .syl-modules-list { flex: 1; overflow-y: auto; overflow-x: hidden; padding: 6px 0; }
        .syl-modules-list::-webkit-scrollbar { width: 3px; }
        .syl-modules-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .syl-module-group { margin-bottom: 1px; }
        .syl-module-btn {
          width: 100%; display: flex; align-items: center; gap: 8px;
          padding: 9px 14px; border: none; background: transparent;
          color: rgba(255,255,255,0.65); cursor: pointer; text-align: left;
          font-size: 12px; font-weight: 600; transition: all 0.15s;
        }
        .syl-module-btn:hover { background: rgba(255,255,255,0.05); color: white; }
        .syl-module-btn.active { background: rgba(0,217,255,0.07); color: #00d9ff; }
        .syl-module-btn.done { color: rgba(0,255,136,0.7); }
        .syl-mod-icon { font-size: 10px; color: rgba(255,255,255,0.3); flex-shrink: 0; }
        .syl-module-btn.active .syl-mod-icon { color: #00d9ff; }
        .syl-mod-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .syl-mod-count { font-size: 10px; color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06); padding: 1px 6px; border-radius: 10px; flex-shrink: 0; }
        .syl-mod-count.done { color: #00ff88; background: rgba(0,255,136,0.1); }
        .syl-topics-list { padding: 2px 0 4px 0; }
        .syl-topic-btn {
          width: 100%; position: relative; display: flex; align-items: center; gap: 8px;
          padding: 7px 14px 7px 26px; border: none; background: transparent;
          color: rgba(255,255,255,0.5); cursor: pointer; text-align: left;
          font-size: 11px; transition: all 0.12s;
        }
        .syl-topic-btn:hover { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.8); }
        .syl-topic-btn.active { background: rgba(0,217,255,0.09); color: #00d9ff; }
        .syl-topic-btn.done { color: rgba(0,255,136,0.45); }
        .syl-topic-active-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #00d9ff; border-radius: 0 2px 2px 0; }
        .syl-topic-dot { font-size: 9px; flex-shrink: 0; }
        .syl-topic-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .syl-custom-dot { color: #00ff88; font-size: 7px; flex-shrink: 0; }
        .syl-sidebar-foot { padding: 10px 14px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .syl-mini-prog { flex: 1; height: 3px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
        .syl-expand-btn {
          width: 26px; min-width: 26px; flex-shrink: 0;
          border: none; border-right: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.2); color: rgba(255,255,255,0.4);
          cursor: pointer; font-size: 16px; font-weight: bold; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .syl-expand-btn:hover { background: rgba(255,255,255,0.06); color: white; }

        /* ── Content Area ── */
        .syl-content-area {
          flex: 1;
          min-width: 0;
          min-height: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* Welcome Screen */
        .syl-welcome {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 48px 40px; text-align: center; overflow-y: auto;
        }
        .syl-welcome-icon { font-size: 60px; margin-bottom: 20px; filter: drop-shadow(0 0 20px rgba(0,217,255,0.4)); }
        .syl-welcome-title { font-size: clamp(22px, 3vw, 32px); font-weight: 800; margin-bottom: 10px; }
        .syl-welcome-sub { color: rgba(255,255,255,0.45); font-size: 15px; margin-bottom: 32px; }
        .syl-stats-row { display: flex; gap: 32px; margin-bottom: 32px; }
        .syl-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .syl-stat-val { font-size: 30px; font-weight: 900; color: white; }
        .syl-stat-lbl { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; }
        .syl-welcome-hint { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.25); font-size: 13px; }
        @keyframes sylBounce { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-5px)} }

        /* Content Display — flex column, pinned footer */
        .syl-content-display {
          display: flex;
          flex-direction: column;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }
        .syl-content-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 11px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(6,0,26,0.97);
          flex-shrink: 0;
          flex-wrap: wrap; gap: 8px;
          backdrop-filter: blur(12px);
          z-index: 10;
        }
        .syl-breadcrumb { display: flex; align-items: center; gap: 5px; font-size: 11px; color: rgba(255,255,255,0.4); flex-wrap: wrap; }
        .syl-bc-sep { color: rgba(255,255,255,0.2); }
        .syl-bc-active { color: white; font-weight: 600; }
        .syl-content-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .syl-action-btn {
          padding: 5px 11px; border: 1px solid rgba(255,255,255,0.13); border-radius: 7px;
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.55);
          cursor: pointer; font-size: 11px; transition: all 0.2s;
        }
        .syl-action-btn:hover { background: rgba(255,255,255,0.09); color: white; }
        .syl-action-btn.done { border-color: rgba(0,255,136,0.35); color: #00ff88; background: rgba(0,255,136,0.07); }
        .syl-edit-content-btn {
          padding: 5px 13px; border-radius: 6px; border: 1px solid rgba(0,217,255,0.3);
          background: rgba(0,217,255,0.09); color: #00d9ff;
          cursor: pointer; font-size: 11px; font-weight: 700; transition: all 0.2s; white-space: nowrap;
        }
        .syl-edit-content-btn:hover { background: rgba(0,217,255,0.18); }

        /* Content Body — ONLY scrollable zone */
        .syl-content-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 28px 36px 32px;
        }
        .syl-content-body::-webkit-scrollbar { width: 4px; }
        .syl-content-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .syl-content-title { font-size: clamp(20px, 2.5vw, 28px); font-weight: 800; color: white; margin-bottom: 12px; line-height: 1.3; }
        .syl-content-desc { font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.65; margin-bottom: 28px; }
        .syl-content-section { margin-bottom: 26px; }
        .syl-section-heading { font-size: 16px; font-weight: 700; color: #00d9ff; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid rgba(0,217,255,0.12); }
        .syl-section-text { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.7; }
        .syl-playground-teaser { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; overflow: hidden; margin-top: 28px; }
        .syl-teaser-header { display: flex; align-items: center; gap: 8px; padding: 11px 14px; background: rgba(0,0,0,0.25); font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.65); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .syl-teaser-body { padding: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .syl-quiz-orb-inline { padding: 8px 16px; border-radius: 8px; border: 1px solid rgba(34,211,238,0.35); background: rgba(34,211,238,0.08); color: #22d3ee; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .syl-quiz-orb-inline:hover { background: rgba(34,211,238,0.15); }

        /* Content Footer — pinned, never scrolls */
        .syl-content-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 24px;
          border-top: 1px solid rgba(0,217,255,0.1);
          background: rgba(6,0,26,0.98);
          flex-shrink: 0;
          flex-wrap: wrap; gap: 10px;
          backdrop-filter: blur(14px);
          box-shadow: 0 -4px 20px rgba(0,0,0,0.45);
        }
        .syl-nav-btn {
          padding: 9px 20px; border: 1px solid rgba(255,255,255,0.14); border-radius: 8px;
          background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.75);
          cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s;
        }
        .syl-nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: white; transform: translateY(-1px); }
        .syl-nav-btn:disabled { opacity: 0.28; cursor: not-allowed; }
        .syl-nav-next { background: linear-gradient(135deg, rgba(0,217,255,0.14), rgba(168,85,247,0.14)); border-color: rgba(0,217,255,0.28); color: #00d9ff; }
        .syl-nav-next:hover:not(:disabled) { background: linear-gradient(135deg, rgba(0,217,255,0.24), rgba(168,85,247,0.24)); box-shadow: 0 4px 15px rgba(0,217,255,0.2); }
        .syl-footer-prog { display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 11px; color: rgba(255,255,255,0.35); }

        /* Shared button */
        .syl-btn-primary { display: inline-flex; align-items: center; justify-content: center; padding: 10px 22px; border: none; border-radius: 8px; background: linear-gradient(135deg, #00d9ff, #9d4edd); color: #000; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .syl-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,217,255,0.3); }

        /* ── Trainer Panel ── */
        .syl-trainer-panel-wrap {
          position: fixed;
          top: 56px; right: 16px;
          width: 320px; max-width: calc(100vw - 32px);
          max-height: calc(100vh - 80px);
          z-index: 500;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.7);
          animation: sylSlideIn 0.25s ease;
        }
        @keyframes sylSlideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .syl-trainer-panel { display: flex; flex-direction: column; height: 100%; background: rgba(10,5,25,0.97); border: 1px solid rgba(255,165,0,0.2); border-radius: 12px; }
        .syl-tp-header { display: flex; align-items: center; justify-content: space-between; padding: 13px 15px; border-bottom: 1px solid rgba(255,165,0,0.15); background: rgba(255,165,0,0.05); flex-shrink: 0; }
        .syl-tp-close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 16px; }
        .syl-tp-close:hover { color: white; }
        .syl-tp-body { flex: 1; overflow-y: auto; padding: 13px; display: flex; flex-direction: column; gap: 8px; }
        .syl-tp-module { border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; overflow: hidden; background: rgba(255,255,255,0.02); }
        .syl-tp-module-header { display: flex; align-items: center; gap: 6px; padding: 8px 10px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); }
        .syl-tp-module-name { flex: 1; font-size: 12px; font-weight: 700; color: white; }
        .syl-tp-btn { padding: 2px 7px; border-radius: 4px; border: none; cursor: pointer; font-size: 12px; font-weight: 700; }
        .syl-tp-add { background: rgba(0,217,255,0.12); color: #00d9ff; }
        .syl-tp-del { background: rgba(255,107,107,0.1); color: #ff6b6b; }
        .syl-tp-topics { padding: 5px 8px; display: flex; flex-direction: column; gap: 2px; }
        .syl-tp-topic-row { display: flex; align-items: center; gap: 5px; padding: 4px 5px; border-radius: 5px; }
        .syl-tp-topic-row:hover { background: rgba(255,255,255,0.03); }
        .syl-tp-topic-name { flex: 1; font-size: 11px; color: rgba(255,255,255,0.65); }
        .syl-tp-sm { padding: 1px 5px; border-radius: 3px; border: none; background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.45); cursor: pointer; font-size: 10px; }
        .syl-tp-sm:hover:not(:disabled) { background: rgba(255,255,255,0.12); color: white; }
        .syl-tp-sm:disabled { opacity: 0.2; cursor: not-allowed; }
        .syl-tp-del-sm:hover { background: rgba(255,107,107,0.15) !important; color: #ff6b6b !important; }
        .syl-tp-add-topic { display: flex; align-items: center; gap: 5px; padding: 4px 7px; margin-top: 3px; border: 1px dashed rgba(0,217,255,0.15); border-radius: 5px; background: none; color: rgba(0,217,255,0.5); cursor: pointer; font-size: 10px; width: 100%; transition: all 0.2s; }
        .syl-tp-add-topic:hover { border-color: rgba(0,217,255,0.35); color: #00d9ff; }
        .syl-tp-add-module { display: flex; align-items: center; gap: 7px; padding: 9px; margin-top: 4px; border: 1px dashed rgba(255,165,0,0.25); border-radius: 8px; background: none; color: rgba(255,165,0,0.6); cursor: pointer; font-size: 12px; font-weight: 600; width: 100%; transition: all 0.2s; }
        .syl-tp-add-module:hover { border-color: rgba(255,165,0,0.4); color: #ffa500; }
        .syl-tp-title-edit { font-size: 13px; font-weight: 700; color: white; }
        .syl-editable { display: inline-flex; align-items: center; gap: 4px; cursor: pointer; border-radius: 4px; padding: 1px 4px; transition: background 0.15s; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .syl-editable:hover { background: rgba(0,217,255,0.07); }
        .syl-edit-hint { font-size: 10px; opacity: 0; transition: opacity 0.2s; flex-shrink: 0; }
        .syl-editable:hover .syl-edit-hint { opacity: 0.6; }
        .syl-inline-input { background: rgba(0,0,0,0.4); border: 1px solid #00d9ff; border-radius: 4px; color: white; padding: 2px 7px; font-size: inherit; width: 100%; outline: none; font-family: inherit; }
        .syl-inline-input.multiline { resize: vertical; min-height: 60px; }

        /* ── Confirm Modal ── */
        .syl-confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .syl-confirm-modal { background: #1a1a2e; border: 1px solid rgba(255,107,107,0.3); border-radius: 12px; padding: 28px 32px; text-align: center; max-width: 320px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
        .syl-confirm-cancel { padding: 7px 18px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 13px; }
        .syl-confirm-delete { padding: 7px 18px; border-radius: 6px; border: none; background: #ff6b6b; color: white; cursor: pointer; font-size: 13px; font-weight: 700; }

        /* ── Content Editor Modal ── */
        .syl-cem-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.82); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; }
        .syl-cem-modal { background: #12121f; border: 1px solid rgba(0,217,255,0.2); border-radius: 16px; width: 100%; max-width: 680px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 30px 80px rgba(0,0,0,0.7); animation: sylSlideIn 0.25s ease; }
        .syl-cem-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .syl-cem-close { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-size: 18px; }
        .syl-cem-body { flex: 1; overflow-y: auto; padding: 18px 22px; display: flex; flex-direction: column; gap: 13px; }
        .syl-cem-field { display: flex; flex-direction: column; gap: 5px; }
        .syl-cem-field label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; }
        .syl-cem-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 9px 11px; color: white; font-size: 13px; outline: none; font-family: inherit; }
        .syl-cem-input:focus { border-color: #00d9ff; }
        .syl-cem-textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 9px 11px; color: white; font-size: 13px; outline: none; resize: vertical; font-family: inherit; line-height: 1.5; }
        .syl-cem-textarea:focus { border-color: #00d9ff; }
        .syl-cem-add-section { padding: 3px 11px; border-radius: 6px; border: 1px solid rgba(0,217,255,0.28); background: rgba(0,217,255,0.07); color: #00d9ff; cursor: pointer; font-size: 11px; }
        .syl-cem-section-block { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07); border-radius: 8px; padding: 11px; display: flex; flex-direction: column; gap: 7px; }
        .syl-cem-move { padding: 2px 7px; background: rgba(255,255,255,0.06); border: none; color: rgba(255,255,255,0.5); border-radius: 4px; cursor: pointer; font-size: 11px; }
        .syl-cem-remove { padding: 2px 7px; background: rgba(255,107,107,0.1); border: none; color: #ff6b6b; border-radius: 4px; cursor: pointer; font-size: 11px; }
        .syl-cem-footer { padding: 13px 22px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; justify-content: flex-end; gap: 10px; }
        .syl-cem-cancel { padding: 8px 18px; border-radius: 7px; border: 1px solid rgba(255,255,255,0.13); background: transparent; color: rgba(255,255,255,0.6); cursor: pointer; font-size: 13px; }
        .syl-cem-save { padding: 8px 20px; border-radius: 7px; border: none; background: linear-gradient(135deg, #00d9ff, #00a8cc); color: #000; font-weight: 700; cursor: pointer; font-size: 13px; }

        /* ── Quiz Platform ── */
        .syl-quiz-platform { display: flex; flex-direction: column; min-height: calc(100vh - 60px); }
        .syl-quiz-header { padding: 18px 22px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
        .syl-quiz-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .syl-quiz-h1 { font-size: 22px; font-weight: 700; color: white; margin: 0; }
        .syl-quiz-badge { font-size: 11px; color: #00d9ff; background: rgba(0,217,255,0.09); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(0,217,255,0.28); }
        .syl-overall-prog { display: flex; align-items: center; gap: 10px; font-size: 12px; color: rgba(255,255,255,0.65); }
        .syl-prog-bar { flex: 1; max-width: 180px; height: 5px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
        .syl-prog-fill { height: 100%; background: linear-gradient(90deg, #00d9ff, #a855f7); transition: width 0.5s; }
        .syl-level-tabs { display: flex; gap: 7px; padding: 10px 22px; border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; flex-wrap: wrap; }
        .syl-level-tab { display: flex; align-items: center; gap: 7px; padding: 7px 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(255,255,255,0.03); color: rgba(255,255,255,0.6); cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }
        .syl-level-tab:hover { background: rgba(255,255,255,0.07); color: white; }
        .syl-level-tab.active { background: rgba(168,85,247,0.13); border-color: #a855f7; color: white; }
        .syl-lv-count { font-size: 10px; background: rgba(255,255,255,0.09); padding: 1px 6px; border-radius: 10px; }
        .syl-quiz-layout { display: flex; flex: 1; overflow: hidden; min-height: 0; }
        .syl-quiz-sidebar { width: 250px; min-width: 250px; border-right: 1px solid rgba(255,255,255,0.07); overflow-y: auto; background: rgba(0,0,0,0.2); flex-shrink: 0; }
        .syl-qsidebar-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 14px 7px; font-size: 12px; font-weight: 700; color: white; }
        .syl-quiz-list { display: flex; flex-direction: column; }
        .syl-qlist-item { display: flex; align-items: center; gap: 7px; padding: 8px 14px; border: none; border-bottom: 1px solid rgba(255,255,255,0.03); background: transparent; color: rgba(255,255,255,0.6); cursor: pointer; text-align: left; transition: all 0.13s; }
        .syl-qlist-item:hover { background: rgba(255,255,255,0.05); color: white; }
        .syl-qlist-item.active { background: rgba(0,217,255,0.09); color: #00d9ff; border-left: 2px solid #00d9ff; }
        .syl-qlist-item.done { color: rgba(255,255,255,0.37); }
        .syl-qnum { width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .syl-qlist-item.active .syl-qnum { background: rgba(0,217,255,0.25); }
        .syl-qinfo { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
        .syl-qtitle { font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .syl-qtag { font-size: 10px; color: #00d9ff; opacity: 0.7; }
        .syl-quiz-main { flex: 1; overflow-y: auto; padding: 18px 20px; min-width: 0; }
        .syl-quiz-nav { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; margin-top: 12px; }
        .syl-qnav-btn { padding: 7px 16px; border: 1px solid rgba(255,255,255,0.18); border-radius: 7px; background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.75); cursor: pointer; font-size: 12px; transition: all 0.2s; }
        .syl-qnav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: white; }
        .syl-qnav-btn:disabled { opacity: 0.28; cursor: not-allowed; }
        .syl-quiz-card { background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; overflow: hidden; transition: border-color 0.3s; }
        .syl-quiz-card.q-correct { border-color: rgba(0,255,136,0.38); }
        .syl-quiz-card.q-incorrect { border-color: rgba(255,107,107,0.38); }
        .syl-quiz-card-header { padding: 14px 18px 11px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .syl-quiz-meta { display: flex; align-items: center; gap: 7px; margin-bottom: 7px; }
        .syl-quiz-tag { padding: 2px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; color: #000; }
        .syl-quiz-level { font-size: 10px; color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.07); padding: 2px 8px; border-radius: 10px; }
        .syl-quiz-solved { font-size: 10px; color: #00ff88; background: rgba(0,255,136,0.09); padding: 2px 8px; border-radius: 10px; border: 1px solid rgba(0,255,136,0.25); }
        .syl-quiz-title { font-size: 18px; font-weight: 700; color: white; margin: 0; }
        .syl-quiz-question { padding: 14px 18px; background: rgba(0,0,0,0.2); }
        .syl-question-pre { font-family: 'Courier New', monospace; font-size: 12px; color: rgba(255,255,255,0.82); line-height: 1.6; white-space: pre-wrap; margin: 0; }
        .syl-quiz-workspace { padding: 14px 18px; display: flex; flex-direction: column; gap: 11px; }
        .syl-code-editor { border: 1px solid rgba(255,255,255,0.1); border-radius: 9px; overflow: hidden; }
        .syl-editor-toolbar { display: flex; justify-content: space-between; align-items: center; padding: 7px 12px; background: rgba(0,0,0,0.4); border-bottom: 1px solid rgba(255,255,255,0.07); }
        .syl-editor-lang { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.55); }
        .syl-clear-btn { font-size: 10px; padding: 2px 8px; border: 1px solid rgba(255,255,255,0.13); border-radius: 4px; background: transparent; color: rgba(255,255,255,0.45); cursor: pointer; }
        .syl-code-textarea { width: 100%; min-height: 180px; padding: 12px; background: #1a1a2e; color: #e0e0e0; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.6; border: none; outline: none; resize: vertical; tab-size: 4; }
        .syl-quiz-controls { display: flex; align-items: center; gap: 11px; }
        .syl-loading-badge { font-size: 11px; color: #ffd43b; background: rgba(255,212,59,0.09); padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(255,212,59,0.25); }
        .syl-run-btn { padding: 9px 22px; background: linear-gradient(135deg, #00d9ff, #00a8cc); border: none; border-radius: 7px; color: #000; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; }
        .syl-run-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,217,255,0.35); }
        .syl-run-btn:disabled { opacity: 0.48; cursor: not-allowed; }
        .syl-output-panel { border-radius: 9px; overflow: hidden; border: 1px solid rgba(255,255,255,0.09); }
        .syl-output-panel.correct { border-color: rgba(0,255,136,0.35); }
        .syl-output-panel.incorrect { border-color: rgba(255,107,107,0.25); }
        .syl-output-header { display: flex; justify-content: space-between; align-items: center; padding: 7px 12px; background: rgba(0,0,0,0.28); font-size: 11px; font-weight: 600; }
        .syl-output-panel.correct .syl-output-header { color: #00ff88; }
        .syl-output-panel.incorrect .syl-output-header { color: #ff6b6b; }
        .syl-show-expected { font-size: 10px; padding: 2px 8px; border: 1px solid rgba(255,212,59,0.35); border-radius: 4px; background: rgba(255,212,59,0.09); color: #ffd43b; cursor: pointer; }
        .syl-output-text { padding: 11px 12px; font-family: monospace; font-size: 12px; color: #e0e0e0; background: rgba(0,0,0,0.18); margin: 0; white-space: pre-wrap; line-height: 1.5; }
        .syl-correct-banner { padding: 12px 18px; background: linear-gradient(135deg, rgba(0,255,136,0.13), rgba(0,200,100,0.08)); border-top: 1px solid rgba(0,255,136,0.25); color: #00ff88; font-weight: 700; font-size: 14px; text-align: center; }
        .syl-hint-banner { padding: 10px 18px; background: rgba(255,212,59,0.07); border-top: 1px solid rgba(255,212,59,0.17); color: #ffd43b; font-size: 12px; text-align: center; }
        .syl-achievement { position: fixed; top: 76px; right: 18px; z-index: 9999; cursor: pointer; animation: sylSlideRight 0.4s ease, sylFadeOut 0.3s ease 3.7s forwards; }
        .syl-achievement-inner { display: flex; align-items: center; gap: 11px; padding: 12px 18px; background: rgba(0,0,0,0.92); border: 1px solid rgba(255,212,59,0.45); border-radius: 12px; min-width: 240px; }
        @keyframes sylSlideRight { from{transform:translateX(120%);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes sylFadeOut { to{opacity:0;transform:translateX(120%)} }

        /* Celebration */
        .syl-celebration { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 10000; overflow: hidden; }
        .syl-celebrate-box { background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; text-align: center; position: relative; z-index: 2; animation: sylPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275); }
        @keyframes sylPop { 0%{transform:scale(0)} 100%{transform:scale(1)} }
        @keyframes sylConfetti { 0%{top:-10px;transform:rotate(0deg)} 100%{top:110%;transform:rotate(720deg)} }

        /* ── Floating Orbs ── */
        .syl-orb-wrap { position: fixed; bottom: 28px; right: 28px; z-index: 9999; display: flex; flex-direction: column; align-items: center; }
        .syl-orb-fan { position: absolute; bottom: 68px; right: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 9px; pointer-events: none; }
        .syl-orb-fan.open { pointer-events: all; }
        .syl-orb-item { display: flex; align-items: center; gap: 9px; opacity: 0; transform: translateY(18px) scale(0.75); transition: all 0.25s; cursor: pointer; }
        .syl-orb-fan.open .syl-orb-item:nth-child(1) { opacity:1; transform:translateY(0) scale(1); transition-delay:0.05s; }
        .syl-orb-fan.open .syl-orb-item:nth-child(2) { opacity:1; transform:translateY(0) scale(1); transition-delay:0.11s; }
        .syl-orb-fan.open .syl-orb-item:nth-child(3) { opacity:1; transform:translateY(0) scale(1); transition-delay:0.17s; }
        .syl-orb-label { font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; background: rgba(0,0,0,0.75); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.13); color: white; white-space: nowrap; transition: all 0.2s; }
        .syl-orb-item:hover .syl-orb-label { border-color: var(--oc); color: var(--oc); }
        .syl-orb-btn { width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--oc); background: rgba(0,0,0,0.65); display: flex; align-items: center; justify-content: center; font-size: 19px; box-shadow: 0 0 12px var(--oc); cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
        .syl-orb-item:hover .syl-orb-btn { transform: scale(1.12); }
        .syl-orb-item.orb-active .syl-orb-btn { background: var(--oc); }
        .syl-main-orb { width: 58px; height: 58px; border-radius: 50%; background: conic-gradient(from 0deg, #a855f7, #22d3ee, #f59e0b, #a855f7); border: none; cursor: pointer; box-shadow: 0 0 0 4px rgba(168,85,247,0.2), 0 0 28px rgba(168,85,247,0.45), 0 0 55px rgba(34,211,238,0.25); animation: sylOrbSpin 4s linear infinite, sylOrbPulse 2.5s ease-in-out infinite alternate; transition: transform 0.3s; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .syl-main-orb:hover { transform: scale(1.1); }
        .syl-main-orb.open { animation: sylOrbSpin 1.2s linear infinite; transform: scale(1.08) rotate(45deg); }
        @keyframes sylOrbSpin { from{filter:hue-rotate(0deg)} to{filter:hue-rotate(360deg)} }
        @keyframes sylOrbPulse { from{box-shadow:0 0 0 4px rgba(168,85,247,0.2),0 0 28px rgba(168,85,247,0.4),0 0 55px rgba(34,211,238,0.2)} to{box-shadow:0 0 0 8px rgba(168,85,247,0.32),0 0 45px rgba(168,85,247,0.65),0 0 80px rgba(34,211,238,0.38)} }

        .syl-quiz-orb-wrap { position: fixed; bottom: 28px; right: 100px; z-index: 9999; display: flex; flex-direction: column; align-items: center; perspective: 1000px; }
        .syl-quiz-fan { position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: flex-start; gap: 10px; pointer-events: none; }
        .syl-quiz-fan.open { pointer-events: all; }
        .syl-quiz-fan-item { display: flex; align-items: center; gap: 10px; opacity: 0; transform: translateX(-24px); transition: all 0.35s cubic-bezier(0.175,0.885,0.32,1.275); cursor: pointer; }
        .syl-quiz-fan.open .syl-quiz-fan-item:nth-child(1) { opacity:1; transform:translateX(0); transition-delay:0.07s; }
        .syl-quiz-fan.open .syl-quiz-fan-item:nth-child(2) { opacity:1; transform:translateX(0); transition-delay:0.14s; }
        .syl-quiz-fan-btn { width: 48px; height: 48px; border-radius: 50%; border: 2px solid var(--qc); background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%), rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 0 14px var(--qc); transition: all 0.3s; flex-shrink: 0; }
        .syl-quiz-fan-item:hover .syl-quiz-fan-btn { transform: scale(1.18) translateY(-2px); box-shadow: 0 0 24px var(--qc), 0 0 40px var(--qc); }
        .syl-quiz-fan-item.q-active .syl-quiz-fan-btn { background: var(--qc); }
        .syl-quiz-fan-label { font-size: 12px; font-weight: 700; padding: 7px 14px; border-radius: 24px; background: rgba(0,0,0,0.82); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.17); color: white; white-space: nowrap; transition: all 0.3s; }
        .syl-quiz-fan-item:hover .syl-quiz-fan-label { border-color: var(--qc); color: var(--qc); }
        .syl-quiz-orb { width: 66px; height: 66px; border-radius: 50%; position: relative; cursor: pointer; border: none; background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.7) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(34,211,238,0.6) 0%, rgba(168,85,247,0.4) 40%, transparent 100%), conic-gradient(from 180deg, #22d3ee, #a855f7, #06b6d4, #22d3ee); box-shadow: inset -8px -8px 16px rgba(0,0,0,0.45), inset 8px 8px 16px rgba(255,255,255,0.25), 0 0 0 4px rgba(34,211,238,0.25), 0 0 18px rgba(34,211,238,0.55), 0 0 36px rgba(168,85,247,0.35); animation: sylQuizFloat 3s ease-in-out infinite, sylOrbSpin 8s linear infinite, sylQuizPulse 2s ease-in-out infinite alternate; display: flex; align-items: center; justify-content: center; font-size: 26px; transition: all 0.3s; }
        .syl-quiz-orb::before { content:''; position:absolute; top:14%; left:19%; width:24%; height:24%; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,0.85) 0%,rgba(255,255,255,0.25) 40%,transparent 70%); pointer-events:none; }
        .syl-quiz-orb:hover { transform: scale(1.12) translateY(-4px); }
        .syl-quiz-orb.open { animation: sylOrbSpin 0.9s linear infinite; }
        .syl-quiz-orb.q-active { animation: sylQuizFloat 2s ease-in-out infinite, sylOrbSpin 6s linear infinite, sylQuizAlert 1.4s ease-in-out infinite; }
        @keyframes sylQuizFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes sylQuizPulse { from{box-shadow:inset -8px -8px 16px rgba(0,0,0,0.45),0 0 0 4px rgba(34,211,238,0.2),0 0 18px rgba(34,211,238,0.4),0 0 36px rgba(168,85,247,0.28)} to{box-shadow:inset -8px -8px 16px rgba(0,0,0,0.45),0 0 0 8px rgba(34,211,238,0.38),0 0 32px rgba(34,211,238,0.7),0 0 55px rgba(168,85,247,0.5)} }
        @keyframes sylQuizAlert { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }

        /* ══════════════════════════════════════════════════════
           RESPONSIVE — Tablet & Mobile
        ══════════════════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .syl-sidebar { width: 230px; min-width: 230px; }
          .syl-content-body { padding: 22px 24px 28px; }
        }

        @media (max-width: 768px) {
          .syl-layout-root {
            flex-direction: column;
            height: auto;
            overflow: visible;
          }
          .syl-sidebar {
            width: 100%;
            min-width: 0;
            max-height: 280px;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.08);
          }
          .syl-content-area {
            overflow: visible;
            min-height: 60vh;
          }
          .syl-content-display { height: auto; overflow: visible; }
          .syl-content-body { overflow: visible; padding: 18px 16px 24px; }
          .syl-content-footer {
            position: sticky;
            bottom: 0;
            z-index: 50;
          }
          .syl-quiz-layout {
            flex-direction: column;
          }
          .syl-quiz-sidebar { width: 100%; min-width: 0; max-height: 200px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.07); }
          .syl-quiz-orb-wrap { right: 95px; }
          .syl-trainer-toolbar { margin-left: 0; width: 100%; }
          .syl-courses-grid { grid-template-columns: 1fr; padding: 12px 14px; }
          .syl-hero { padding: 32px 16px 20px; }
          .syl-content-header { padding: 9px 14px; }
          .syl-content-footer { padding: 10px 14px; }
        }

        @media (max-width: 480px) {
          .syl-mode-tabs { padding: 6px 10px; gap: 4px; }
          .syl-mode-tab { padding: 6px 10px; font-size: 11px; }
          .syl-main-orb { width: 50px; height: 50px; font-size: 18px; }
          .syl-quiz-orb { width: 56px; height: 56px; font-size: 22px; }
          .syl-orb-wrap { bottom: 18px; right: 18px; }
          .syl-quiz-orb-wrap { bottom: 18px; right: 82px; }
          .syl-sidebar { max-height: 220px; }
          .syl-subject-tabs { padding: 6px 10px 0; }
          .syl-subject-tab { padding: 7px 10px; font-size: 11px; }
          .syl-tab-text { max-width: 80px; }
          .syl-content-title { font-size: 18px; }
          .syl-welcome-title { font-size: 22px; }
          .syl-stats-row { gap: 20px; }
          .syl-stat-val { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}