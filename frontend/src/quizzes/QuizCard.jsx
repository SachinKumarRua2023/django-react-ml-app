import { useState, useEffect } from "react";
import { runPython, runMySQL, loadPyodide } from "./codeRunner";
import { CodeEditor } from "./CodeEditor";

// ============================================================
// QUIZ CARD — Individual quiz problem with code execution
// ============================================================
export const QuizCard = ({ quiz, quizType, onComplete, isCompleted }) => {
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
