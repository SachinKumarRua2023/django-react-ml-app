// ============================================================
// PYODIDE RUNNER — Python code execution in browser
// ============================================================

let pyodideInstance = null;
let pyodideLoading = false;
let pyodideCallbacks = [];

export const loadPyodide = () => new Promise((resolve, reject) => {
  if (pyodideInstance) { resolve(pyodideInstance); return; }
  pyodideCallbacks.push({ resolve, reject });
  if (pyodideLoading) return;
  pyodideLoading = true;
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
  script.onload = async () => {
    try {
      const py = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/' });
      pyodideInstance = py;
      pyodideCallbacks.forEach(cb => cb.resolve(py));
    } catch(e) { pyodideCallbacks.forEach(cb => cb.reject(e)); }
  };
  script.onerror = (e) => pyodideCallbacks.forEach(cb => cb.reject(e));
  document.head.appendChild(script);
});

export const runPython = async (code) => {
  const py = await loadPyodide();
  await py.runPythonAsync(`import sys\nfrom io import StringIO\n_stdout = StringIO()\nsys.stdout = _stdout`);
  try {
    await py.runPythonAsync(code);
    const output = await py.runPythonAsync(`sys.stdout.getvalue()`);
    return output.toString().trim();
  } finally {
    await py.runPythonAsync(`sys.stdout = sys.__stdout__`);
  }
};

export const runMySQL = (sql) => {
  const s = sql.trim().toLowerCase().replace(/\s+/g,' ');
  if (s.includes('create database')) return "Database 'school' created successfully.";
  if (s.includes('create table') && s.includes('students')) return "Table 'students' created successfully.";
  if (s.includes('inner join')) return "Alice | 90\nBob | 85\nCharlie | 92";
  if (s.includes('explain')) return "id|select_type|table|type|key|rows\n1|SIMPLE|students|ALL|NULL|3";
  return "Query executed successfully.";
};
