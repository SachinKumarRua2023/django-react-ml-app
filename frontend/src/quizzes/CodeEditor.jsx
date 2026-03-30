import { useState } from "react";

// ============================================================
// CODE EDITOR — Simple textarea with tab support
// ============================================================
export const CodeEditor = ({ value, onChange, language = 'python' }) => {
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
