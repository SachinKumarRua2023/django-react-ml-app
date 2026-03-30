import { useState } from "react";
import { pythonQuizzes, mysqlQuizzes } from "./quizData";
import { QuizCard } from "./QuizCard";

// ============================================================
// ACHIEVEMENT — Popup notification for milestones
// ============================================================
const Achievement = ({ message, icon, onClose }) => (
  <div className="achievement-popup" onClick={onClose}>
    <div className="achievement-content">
      <div className="achievement-icon">{icon}</div>
      <div className="achievement-text">{message}</div>
    </div>
  </div>
);

// ============================================================
// QUIZ PLATFORM — Main quiz interface with levels and progress
// ============================================================
export const QuizPlatform = ({ quizType }) => {
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

  const levels = ['basics', 'intermediate', 'advanced'];
  const levelIcons = { basics: '🌱', intermediate: '⚡', advanced: '🔥' };

  return (
    <div className="quiz-platform">
      {achievement && <Achievement icon={achievement.icon} message={achievement.msg} onClose={() => setAchievement(null)} />}
      <div className="quiz-header">
        <div className="quiz-title-row">
          <span className="quiz-platform-icon">{quizType === 'python' ? '🐍' : '🗄️'}</span>
          <h1 className="quiz-platform-title">{quizType === 'python' ? 'Python' : 'MySQL'} Challenges</h1>
          <span className="quiz-subtitle">CodeChef-Style Practice</span>
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
                <button key={q.id} className={`quiz-list-item ${active?'active':''} ${done?'done':''}`} onClick={() => setCurrentIdx(idx)}>
                  <span className="qli-num">{idx+1}</span>
                  <div className="qli-info">
                    <span className="qli-title">{q.title}</span>
                    <span className="qli-tag" style={{color: q.tag==='DSA'?'#00d9ff':q.tag==='DATA'?'#a855f7':'#ff6b6b'}}>{q.tag}</span>
                  </div>
                  {done ? <span className="qli-done">✓</span> : active ? <span className="qli-active">►</span> : null}
                </button>
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
