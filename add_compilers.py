import re

# Read the current file
with open('frontend/src/pages/SyllabusPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add new compiler functions after runMySQL
old_runmysql = '''const runMySQL = (sql) => {
  const s = sql.trim().toLowerCase().replace(/\\s+/g,' ');
  if (s.includes('create database')) return "Database 'school' created successfully.";
  if (s.includes('create table') && s.includes('students')) return "Table 'students' created successfully.";
'''

# Find where to insert the new compilers
insert_after = "// ============================================================\n// QUIZ PLATFORM"

new_compilers = '''
// ============================================================
// HTML/CSS/JS COMPILER (for Full Stack)
// ============================================================
const compileHTML = (code) => {
  // Wrap user code in a complete HTML document
  const fullHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 20px; 
      background: #1a1a2e;
      color: white;
    }
  </style>
</head>
<body>
  ${code}
  <script>
    // Capture console output
    const originalLog = console.log;
    const logs = [];
    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog.apply(console, args);
    };
    // Auto-run scripts
    try {
      const scripts = document.querySelectorAll('script:not([src])');
      scripts.forEach(s => {
        try { eval(s.textContent); } catch(e) { logs.push('Error: ' + e.message); }
      });
    } catch(e) { logs.push('Error: ' + e.message); }
  <\\/script>
</body>
</html>
  `;
  return fullHTML;
};

// ============================================================
// MOBILE GUI SIMULATOR (for React Native)
// ============================================================
const compileMobile = (code) => {
  // Convert React Native style to HTML for preview
  const mobileHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh; 
      background: #0f0f23;
    }
    .phone-frame {
      width: 375px;
      height: 667px;
      background: #000;
      border-radius: 40px;
      padding: 10px;
      box-shadow: 0 0 50px rgba(0,217,255,0.3);
      position: relative;
    }
    .phone-notch {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 150px;
      height: 30px;
      background: #000;
      border-radius: 0 0 20px 20px;
      z-index: 10;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      background: #1a1a2e;
      border-radius: 30px;
      overflow: hidden;
      position: relative;
    }
    .mobile-content {
      padding: 50px 20px 20px;
      height: 100%;
      overflow-y: auto;
    }
    /* React Native style mappings */
    .View { display: flex; flex-direction: column; }
    .Text { color: white; font-size: 16px; margin: 5px 0; }
    .Button { 
      background: #00d9ff; 
      color: black; 
      padding: 12px 24px; 
      border-radius: 8px; 
      border: none;
      margin: 10px 0;
      font-weight: bold;
      cursor: pointer;
    }
    .TextInput {
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      padding: 10px;
      border-radius: 8px;
      color: white;
      margin: 5px 0;
    }
    .ScrollView { overflow-y: auto; max-height: 100%; }
    .Image { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="phone-frame">
    <div class="phone-notch"></div>
    <div class="phone-screen">
      <div class="mobile-content">
        ${code}
      </div>
    </div>
  </div>
</body>
</html>
  `;
  return mobileHTML;
};

'''

# Find the position after runMySQL function
if old_runmysql in content:
    # Insert the new compilers after runMySQL
    content = content.replace(old_runmysql, old_runmysql + new_compilers)
    print('Added HTML and Mobile compilers')
else:
    print('Could not find insertion point')

# Write back
with open('frontend/src/pages/SyllabusPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
