import re

with open('frontend/src/pages/SyllabusPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# New professional CSS styles
new_css = '''
        /* ============================================================
           PROFESSIONAL COURSE QUIZ PLATFORM STYLES
           45+ Years Experience UI/UX Design
        ============================================================ */
        .course-quiz-platform {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
          overflow: hidden;
        }
        
        /* Header */
        .quiz-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(0,0,0,0.4);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
        }
        .quiz-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .course-icon {
          font-size: 36px;
          filter: drop-shadow(0 0 20px rgba(0,217,255,0.5));
        }
        .quiz-header-info h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: white;
          letter-spacing: -0.5px;
        }
        .quiz-subtitle {
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Master Controls */
        .master-controls {
          display: flex;
          gap: 8px;
        }
        .master-btn {
          padding: 10px 20px;
          background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(0,217,255,0.2));
          border: 1px solid rgba(168,85,247,0.5);
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .master-btn:hover {
          background: linear-gradient(135deg, rgba(168,85,247,0.3), rgba(0,217,255,0.3));
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(168,85,247,0.3);
        }
        .master-btn.active {
          background: linear-gradient(135deg, #a855f7, #00d9ff);
          border-color: transparent;
        }
        
        /* Layout */
        .quiz-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        
        /* Professional Sidebar */
        .quiz-sidebar-pro {
          width: 300px;
          min-width: 300px;
          background: rgba(0,0,0,0.3);
          border-right: 1px solid rgba(255,255,255,0.08);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .sidebar-title {
          font-size: 14px;
          font-weight: 600;
          color: white;
        }
        .topic-count {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          background: rgba(0,217,255,0.1);
          padding: 4px 10px;
          border-radius: 20px;
        }
        .modules-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }
        .module-card {
          margin-bottom: 8px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          transition: all 0.3s ease;
        }
        .module-card:hover {
          border-color: rgba(255,255,255,0.1);
        }
        .module-card.expanded {
          background: rgba(0,217,255,0.05);
          border-color: rgba(0,217,255,0.2);
        }
        .module-header {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.85);
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
          text-align: left;
        }
        .module-icon {
          font-size: 12px;
          color: #00d9ff;
          transition: transform 0.3s;
        }
        .module-card.expanded .module-icon {
          transform: rotate(90deg);
        }
        .module-name {
          flex: 1;
        }
        .module-badge {
          font-size: 11px;
          background: rgba(0,217,255,0.15);
          color: #00d9ff;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 600;
        }
        .topics-list {
          padding: 4px 8px 12px 40px;
        }
        .topic-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          margin: 2px 0;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
          text-align: left;
        }
        .topic-item:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.9);
        }
        .topic-item.active {
          background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(0,217,255,0.2));
          color: white;
          border: 1px solid rgba(168,85,247,0.3);
        }
        .topic-type-icon {
          font-size: 14px;
        }
        .topic-name {
          flex: 1;
        }
        .quiz-indicator {
          font-size: 12px;
        }
        
        /* Main Workspace */
        .quiz-workspace-pro {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(0,0,0,0.1);
        }
        
        /* Workspace Header */
        .workspace-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .topic-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .topic-type-badge {
          font-size: 11px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #00d9ff, #a855f7);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .topic-info h3 {
          margin: 0;
          font-size: 18px;
          color: white;
          font-weight: 600;
        }
        .quiz-selector {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .quiz-selector select {
          padding: 8px 16px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          color: white;
          font-size: 13px;
          min-width: 200px;
        }
        .add-quiz-btn {
          padding: 8px 16px;
          background: linear-gradient(135deg, #00d9ff, #a855f7);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-quiz-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,217,255,0.3);
        }
        
        /* Quiz Editor Panel */
        .quiz-editor-panel {
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 16px 24px;
        }
        .quiz-editor-panel h4 {
          margin: 0 0 12px 0;
          color: #00d9ff;
          font-size: 14px;
        }
        .quiz-edit-input, .quiz-edit-textarea {
          width: 100%;
          padding: 10px 14px;
          margin-bottom: 10px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-family: inherit;
        }
        .quiz-edit-textarea {
          resize: vertical;
          min-height: 60px;
        }
        .quiz-edit-textarea.code {
          font-family: 'Fira Code', monospace;
          color: #00d9ff;
        }
        .quiz-edit-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        .save-quiz-btn, .cancel-quiz-btn, .delete-quiz-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .save-quiz-btn {
          background: linear-gradient(135deg, #00d9ff, #a855f7);
          color: white;
        }
        .cancel-quiz-btn {
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
        }
        .delete-quiz-btn {
          background: rgba(255,71,87,0.2);
          color: #ff4757;
          margin-left: auto;
        }
        .save-quiz-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,217,255,0.3);
        }
        
        /* Question Panel */
        .question-panel {
          padding: 16px 24px;
          background: rgba(0,217,255,0.05);
          border-bottom: 1px solid rgba(0,217,255,0.1);
        }
        .question-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .question-label {
          font-size: 12px;
          font-weight: 700;
          color: #00d9ff;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .question-box p {
          margin: 0;
          color: rgba(255,255,255,0.85);
          font-size: 15px;
          line-height: 1.5;
        }
        
        /* Editor & Preview Split */
        .editor-preview-split {
          flex: 1;
          display: flex;
          overflow: hidden;
          gap: 1px;
          background: rgba(255,255,255,0.08);
        }
        .editor-section, .preview-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #0a0a1a;
          overflow: hidden;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: rgba(0,0,0,0.3);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .section-icon {
          font-size: 16px;
        }
        .section-title {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,0.8);
        }
        .run-btn-pro {
          padding: 10px 24px;
          background: linear-gradient(135deg, #00d9ff, #a855f7);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .run-btn-pro:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(0,217,255,0.4);
        }
        .run-btn-pro:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .editor-container {
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        .code-editor-pro {
          width: 100%;
          height: 100%;
          padding: 20px;
          background: #0d0d1a;
          border: none;
          color: #00d9ff;
          font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
          font-size: 15px;
          line-height: 1.7;
          resize: none;
          outline: none;
        }
        .code-editor-pro:focus {
          background: #0f0f23;
        }
        .code-editor-pro::placeholder {
          color: rgba(255,255,255,0.3);
        }
        
        /* Preview Container */
        .preview-container-pro {
          flex: 1;
          overflow: hidden;
          position: relative;
          background: #0d0d1a;
        }
        .terminal-output {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 20px;
          background: #0d0d1a;
          color: #00ff88;
          font-family: 'Fira Code', monospace;
          font-size: 14px;
          line-height: 1.6;
          overflow-y: auto;
          white-space: pre-wrap;
        }
        .live-preview-frame {
          width: 100%;
          height: 100%;
          border: none;
          background: white;
        }
        .preview-placeholder-pro {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          text-align: center;
          padding: 40px;
        }
        .placeholder-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .preview-placeholder-pro p {
          margin: 0 0 8px 0;
          font-size: 16px;
        }
        .placeholder-hint {
          font-size: 13px !important;
          color: rgba(255,255,255,0.3) !important;
        }
        
        /* Welcome Screen */
        .welcome-screen {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        .welcome-content {
          text-align: center;
          max-width: 500px;
        }
        .welcome-icon-large {
          font-size: 80px;
          margin-bottom: 24px;
          filter: drop-shadow(0 0 40px rgba(0,217,255,0.5));
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .welcome-content h2 {
          margin: 0 0 12px 0;
          font-size: 28px;
          color: white;
          font-weight: 700;
        }
        .welcome-content > p {
          margin: 0 0 32px 0;
          color: rgba(255,255,255,0.6);
          font-size: 16px;
        }
        .course-overview {
          display: flex;
          justify-content: center;
          gap: 40px;
        }
        .overview-stat {
          text-align: center;
        }
        .stat-number {
          display: block;
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #00d9ff, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }
        .stat-label {
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        /* Scrollbars */
        .quiz-sidebar-pro::-webkit-scrollbar,
        .modules-list::-webkit-scrollbar,
        .code-editor-pro::-webkit-scrollbar,
        .terminal-output::-webkit-scrollbar {
          width: 6px;
        }
        .quiz-sidebar-pro::-webkit-scrollbar-track,
        .modules-list::-webkit-scrollbar-track,
        .code-editor-pro::-webkit-scrollbar-track,
        .terminal-output::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .quiz-sidebar-pro::-webkit-scrollbar-thumb,
        .modules-list::-webkit-scrollbar-thumb,
        .code-editor-pro::-webkit-scrollbar-thumb,
        .terminal-output::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 3px;
        }
        .quiz-sidebar-pro::-webkit-scrollbar-thumb:hover,
        .modules-list::-webkit-scrollbar-thumb:hover,
        .code-editor-pro::-webkit-scrollbar-thumb:hover,
        .terminal-output::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.25);
        }

'''

# Find the existing CSS and add the new styles before the closing style tag
closing_style = '      </style>'
if closing_style in content:
    content = content.replace(closing_style, new_css + closing_style)
    print('Added professional CSS styles')
else:
    print('Could not find closing style tag')

with open('frontend/src/pages/SyllabusPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
