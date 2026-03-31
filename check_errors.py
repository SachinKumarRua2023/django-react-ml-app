import re
import json

# Read the file
with open('frontend/src/pages/SyllabusPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

errors = []

# Check 1: Missing closing braces in template literals
style_sections = re.findall(r'```\s*css\s*\n(.*?)\n```', content, re.DOTALL)
css_in_js = re.findall(r'style=\{\{([^}]+)\}\}', content)

# Check for unclosed template literals in CSS
if '`}' in content:
    # Find lines with potential issues
    lines = content.split('\n')
    for i, line in enumerate(lines, 1):
        if '`}' in line and i > 3300:
            errors.append(f"Line {i}: Potential unclosed template literal - {line[:50]}")

# Check 2: Count opening and closing braces
lines = content.split('\n')
for i, line in enumerate(lines, 1):
    if i > 3250 and i < 3350:  # Focus on the problem area
        open_braces = line.count('{')
        close_braces = line.count('}')
        if '```' in line or 'css' in line or '@keyframes' in line:
            pass  # Skip CSS lines
        else:
            # Check for JSX in CSS template literals
            if '{' in line and '}' not in line and i < 3324:
                errors.append(f"Line {i}: Unmatched opening brace - {line[:60]}")

# Check 3: Check for JSX expressions in CSS template literals
jsx_in_css_pattern = r'```\s*css\s*\n(.*?)(```|\Z)'
for match in re.finditer(jsx_in_css_pattern, content, re.DOTALL):
    css_content = match.group(1)
    if '${' in css_content or '{' in css_content:
        # Check if there's JSX expression syntax in CSS
        lines_in_match = css_content.split('\n')
        for j, css_line in enumerate(lines_in_match):
            if '${' in css_line:
                line_num = content[:match.start()].count('\n') + j + 1
                errors.append(f"Line {line_num}: JSX expression ${'{...}'} found in CSS template literal")

# Check 4: Verify CSS template literal is properly closed
if '```css' in content:
    css_sections = re.findall(r'```css\n(.*?)```', content, re.DOTALL)
    if not css_sections:
        errors.append("CSS template literal may not be properly closed")

# Check 5: Check for common JSX issues around line 3318
if 'display: flex;' in content:
    # Find the context around display: flex
    idx = content.find('display: flex;')
    if idx > 0:
        context = content[idx-100:idx+100]
        if '{' in context and '${' not in context:
            # Check if this is inside a template literal
            before_context = content[:idx]
            last_backtick = before_context.rfind('`')
            if last_backtick > 0:
                # Check if we're inside a template literal
                template_start = before_context.find('```css', last_backtick-50)
                if template_start > 0:
                    errors.append(f"CSS property found in JSX expression context around line {before_context.count(chr(10)) + 1}")

# Print errors
if errors:
    print("POTENTIAL ERRORS FOUND:")
    for err in errors[:20]:
        print(f"  - {err}")
else:
    print("No obvious syntax errors detected by pattern matching")
    
# Check line count
print(f"\nTotal lines: {len(lines)}")

# Check the specific area around line 3318
print("\n--- Lines 3310-3325 ---")
for i in range(3309, min(3325, len(lines))):
    print(f"{i+1}: {lines[i][:80]}")
