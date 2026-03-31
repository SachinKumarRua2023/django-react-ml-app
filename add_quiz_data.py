import re

# Read the current file
with open('frontend/src/pages/SyllabusPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the position after the mysqlQuizzes definition and before PYODIDE RUNNER
insert_marker = '// ============================================================\n// PYODIDE RUNNER'

# New course-based quiz data structure
new_quiz_data = '''
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
          { id: 'grouping', name: 'Grouping & Aggregation', type: 'python' },
          { id: 'merging', name: 'Merging Data', type: 'python' }
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
    name: 'Full Stack Development',
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

'''

# Insert the new quiz data before PYODIDE RUNNER
if insert_marker in content:
    content = content.replace(insert_marker, new_quiz_data + insert_marker)
    
# Write back
with open('frontend/src/pages/SyllabusPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added course-based quiz data structure')
