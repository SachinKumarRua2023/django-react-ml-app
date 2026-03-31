import re

# Read file
with open('frontend/src/pages/SyllabusPage.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Join and fix
content = ''.join(lines)

# Replace actual newlines in template literals with escaped newlines
# We need to be careful to only replace within starterCode template literals

# Pattern to find starterCode template literals with actual newlines
import re

# Fix all starterCode template literals - replace actual newlines with \n
# This regex finds template literals after starterCode: and replaces internal newlines

def fix_template_literal(match):
    prefix = match.group(1)
    code = match.group(2)
    # Replace actual newlines with escaped newlines
    fixed_code = code.replace('\n', '\\n')
    return f'{prefix}`{fixed_code}`'

# Match starterCode: `...` patterns
content = re.sub(r'(starterCode: )`([^`]+)`', fix_template_literal, content, flags=re.DOTALL)

with open('frontend/src/pages/SyllabusPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed template literals')
