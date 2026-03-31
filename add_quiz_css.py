import re

# Read the current file
with open('frontend/src/pages/SyllabusPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# CSS to add before the closing </style> tag
css_styles = '''

        /* ─────────────────────────────────────────────────────────
           COURSE QUIZ PLATFORM STYLES
        ───────────────────────────────────────────────────────── */
        .course-quiz-platform {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: #0a0a1a;
        }
        .quiz-header {
          padding: 16px 24px;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .quiz-header h2 {
          margin: 0;
          font-size: 18px;
          color: white;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .quiz-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .quiz-sidebar {
          width: 260px;
          min-width: 260px;
          background: rgba(0,0,0,0.2);
          border-right: 1px solid rgba(255,255,255,0.08);
          overflow-y: auto;
          padding: 12px;
        }
        .quiz-module {
          margin-bottom: 8px;
        }
        .quiz-module-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .quiz-module-header:hover {
          background: rgba(255,255,255,0.08);
        }
        .quiz-module-header.active {
          background: rgba(0,217,255,0.1);
          border-color: rgba(0,217,255,0.3);
          color: #00d9ff;
        }
        .quiz-topics {
          padding: 4px 0 4px 12px;
        }
        .quiz-topic {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          margin: 2px 0;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }
        .quiz-topic:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.9);
        }
        .quiz-topic.active {
          background: rgba(168,85,247,0.15);
          color: #a855f7;
        }
        .topic-icon {
          font-size: 14px;
        }
        .quiz-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .quiz-info {
          padding: 16px 24px;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .quiz-info h3 {
          margin: 0 0 8px 0;
          color: white;
          font-size: 16px;
        }
        .quiz-question {
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          line-height: 1.5;
        }
        .quiz-workspace {
          flex: 1;
          display: flex;
          overflow: hidden;
        }
        .code-panel, .output-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .code-panel {
          border-right: 1px solid rgba(255,255,255,0.08);
        }
        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-size: 13px;
          color: rgba(255,255,255,0.7);
        }
        .run-btn {
          padding: 6px 16px;
          background: linear-gradient(135deg, #00d9ff, #a855f7);
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .run-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,217,255,0.3);
        }
        .run-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .code-editor {
          flex: 1;
          width: 100%;
          padding: 16px;
          background: #0d0d1a;
          border: none;
          color: #00d9ff;
          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
          font-size: 14px;
          line-height: 1.6;
          resize: none;
          outline: none;
        }
        .code-editor:focus {
          background: #0f0f23;
        }
        .output-display {
          flex: 1;
          margin: 0;
          padding: 16px;
          background: #0d0d1a;
          color: rgba(255,255,255,0.9);
          font-family: 'Fira Code', monospace;
          font-size: 13px;
          line-height: 1.5;
          overflow-y: auto;
          white-space: pre-wrap;
        }
        .preview-container {
          flex: 1;
          background: #0d0d1a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .preview-frame {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        }
        .preview-placeholder {
          color: rgba(255,255,255,0.4);
          font-size: 14px;
          text-align: center;
          padding: 40px;
        }
        .quiz-welcome {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }
        .quiz-welcome .welcome-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .quiz-welcome h3 {
          color: white;
          font-size: 24px;
          margin: 0 0 12px 0;
        }
        .quiz-welcome p {
          color: rgba(255,255,255,0.6);
          font-size: 16px;
          margin: 0 0 24px 0;
        }
        .course-stats {
          display: flex;
          gap: 40px;
        }
        .course-stats .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .course-stats .stat-value {
          font-size: 32px;
          font-weight: 800;
          color: #00d9ff;
        }
        .course-stats .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

'''

# Find the closing style tag and insert before it
closing_style = '      </style>'
if closing_style in content:
    content = content.replace(closing_style, css_styles + closing_style)
    print('Added CourseQuizPlatform CSS styles')
else:
    print('Could not find closing style tag')

# Write back
with open('frontend/src/pages/SyllabusPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
