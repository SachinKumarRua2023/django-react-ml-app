import re

# Read the current file
with open('frontend/src/pages/SyllabusPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the topTabs to replace old quiz tabs with new course-based ones
old_tabs = """  const topTabs = [
    { id: 'courses', label: '📚 Courses', icon: '📚' },
    { id: 'quiz-python', label: '🐍 Python Quiz', icon: '🐍' },
    { id: 'quiz-mysql', label: '🗄️ MySQL Quiz', icon: '🗄️' },
  ];"""

new_tabs = """  const topTabs = [
    { id: 'courses', label: '📚 Courses', icon: '📚' },
    { id: 'quiz-datascience', label: '🤖 Data Science Labs', icon: '🤖' },
    { id: 'quiz-fullstack', label: '💻 Full Stack Labs', icon: '💻' },
    { id: 'quiz-gaming', label: '🎮 Gaming & IoT Labs', icon: '🎮' },
  ];"""

content = content.replace(old_tabs, new_tabs)
print('Updated topTabs with course-based quiz tabs')

# Update the quiz rendering JSX
old_quiz_render = """      {viewMode === 'quiz-python' && <QuizPlatform quizType="python" isMasterUser={isMasterUser} />}
      {viewMode === 'quiz-mysql' && <QuizPlatform quizType="mysql" isMasterUser={isMasterUser} />}"""

new_quiz_render = """      {viewMode === 'quiz-datascience' && <CourseQuizPlatform courseId="datascience" isMasterUser={isMasterUser} />}
      {viewMode === 'quiz-fullstack' && <CourseQuizPlatform courseId="fullstack" isMasterUser={isMasterUser} />}
      {viewMode === 'quiz-gaming' && <CourseQuizPlatform courseId="gaming" isMasterUser={isMasterUser} />}"""

content = content.replace(old_quiz_render, new_quiz_render)
print('Updated quiz rendering to use CourseQuizPlatform')

# Write back
with open('frontend/src/pages/SyllabusPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('All updates completed!')
