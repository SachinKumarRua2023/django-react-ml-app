import re

with open('frontend/src/pages/SyllabusPage.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Read entire content
content = ''.join(lines)

# Fix multiline starterCode strings - replace with template literals
# Pattern for Python multiline strings with single quotes
content = content.replace(
    "starterCode: '# Create variables and print sum\na = 10\nb = 20\nprint(a + b)'",
    "starterCode: `# Create variables and print sum\\na = 10\\nb = 20\\nprint(a + b)`"
)

content = content.replace(
    'starterCode: "x = 3.14\n# Print the type of x\nprint(type(x))"',
    "starterCode: `x = 3.14\\n# Print the type of x\\nprint(type(x))`"
)

content = content.replace(
    "starterCode: 'import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint(arr)'",
    "starterCode: `import numpy as np\\narr = np.array([1, 2, 3, 4, 5])\\nprint(arr)`"
)

content = content.replace(
    "starterCode: 'import numpy as np\narr = np.array([10, 20, 30])\nprint(np.sum(arr))'",
    "starterCode: `import numpy as np\\narr = np.array([10, 20, 30])\\nprint(np.sum(arr))`"
)

# Fix HTML strings
content = content.replace(
    'starterCode: \'<h1>Hello World</h1>\'',
    'starterCode: `<h1>Hello World</h1>`'
)

content = content.replace(
    'starterCode: \'<p>This is a paragraph</p>\'',
    'starterCode: `<p>This is a paragraph</p>`'
)

content = content.replace(
    'starterCode: \'<script>alert(\\\"Hello!\\\")</script>\'',
    'starterCode: `<script>alert("Hello!")</script>`'
)

# Fix the mobile code string in the component
content = content.replace(
    "setCode('# Write your Python code here\\nprint(\"Hello Data Science!\")')",
    'setCode(`# Write your Python code here\\nprint("Hello Data Science!")`)'
)

content = content.replace(
    "setCode('<!-- Write your HTML here -->\\n<h1>Hello Web!</h1>')",
    'setCode(`<!-- Write your HTML here -->\\n<h1>Hello Web!</h1>`)'
)

content = content.replace(
    "setCode('<!-- React Native Style Mobile UI -->\\n<div class=\"View\">\\n  <div class=\"Text\">Hello Mobile!</div>\\n</div>')",
    'setCode(`<!-- React Native Style Mobile UI -->\\n<div class="View">\\n  <div class="Text">Hello Mobile!</div>\\n</div>`)'
)

with open('frontend/src/pages/SyllabusPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed all multiline string errors')
