import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// PYTHON VISUALS — Animated visual explainers for Python & its major libraries
// Every concept shows WHAT is happening inside memory / execution
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg:     "#07071a",
  panel:  "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.09)",
  cyan:   "#00d9ff",
  yellow: "#ffd43b",
  green:  "#00ff88",
  orange: "#ff9500",
  red:    "#ff6b6b",
  purple: "#a855f7",
  pink:   "#ff2d9b",
  blue:   "#3b82f6",
  white:  "rgba(255,255,255,0.85)",
  dim:    "rgba(255,255,255,0.35)",
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
function useLog(max = 14) {
  const [logs, setLogs] = useState([]);
  const add = useCallback((msg, color = C.cyan) => {
    setLogs(p => [...p.slice(-(max - 1)), { msg, color, id: Date.now() + Math.random() }]);
  }, [max]);
  const clear = useCallback(() => setLogs([]), []);
  return [logs, add, clear];
}

function LogBox({ logs, h = 180 }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [logs]);
  return (
    <div ref={ref} style={{ height: h, overflowY: "auto", background: "rgba(0,0,0,0.45)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px" }}>
      {logs.length === 0 && <span style={{ color: C.dim, fontFamily: "monospace", fontSize: 11 }}>Press Play…</span>}
      {logs.map(l => (
        <div key={l.id} style={{ fontFamily: "monospace", fontSize: 11, color: l.color, marginBottom: 2, animation: "pyFadeIn .3s ease" }}>
          <span style={{ color: C.dim }}>› </span>{l.msg}
        </div>
      ))}
    </div>
  );
}

function Btn({ children, onClick, color = C.cyan, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "6px 14px", background: color, border: "none", borderRadius: 6,
      color: ["#00ff88", "#00d9ff", "#ffd43b"].includes(color) ? "#000" : "#fff",
      cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700,
      fontFamily: "monospace", opacity: disabled ? 0.5 : 1, transition: "opacity .2s"
    }}>{children}</button>
  );
}

function Tag({ children, color }) {
  return (
    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, fontFamily: "monospace", fontWeight: 700,
      background: color + "22", border: `1px solid ${color}55`, color }}>
      {children}
    </span>
  );
}

function Card({ title, color = C.cyan, children }) {
  return (
    <div style={{ background: C.panel, borderLeft: `3px solid ${color}`, border: `1px solid ${color}22`, borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 10, color, fontWeight: 700, fontFamily: "monospace", letterSpacing: 1, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 12, color: C.white, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 1. FOR LOOP — Memory model + iteration
// ═════════════════════════════════════════════════════════════════════════════
function ForLoopViz() {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [items] = useState([10, 20, 30, 40, 50]);
  const [acc, setAcc] = useState(0);
  const [logs, addLog, clearLog] = useLog();
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef(null);
  const stepRef = useRef(-1);
  const accRef = useRef(0);

  const reset = () => {
    setPlaying(false); clearInterval(timerRef.current);
    setStep(-1); setAcc(0); clearLog();
    stepRef.current = -1; accRef.current = 0;
    addLog("for item in [10, 20, 30, 40, 50]:", C.yellow);
    addLog("    total += item", C.dim);
  };

  useEffect(() => { reset(); }, []);

  const tick = useCallback(() => {
    const next = stepRef.current + 1;
    if (next >= items.length) {
      clearInterval(timerRef.current);
      setPlaying(false);
      addLog(`Loop finished! total = ${accRef.current}`, C.green);
      stepRef.current = items.length;
      setStep(items.length);
      return;
    }
    stepRef.current = next;
    accRef.current += items[next];
    setStep(next);
    setAcc(accRef.current);
    addLog(`Iteration ${next + 1}: item = ${items[next]}  →  total = ${accRef.current}`, next % 2 === 0 ? C.cyan : C.yellow);
  }, [items]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(tick, 900 / speed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, speed, tick]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Visual */}
      <div>
        <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, border: `1px solid ${C.border}`, padding: 16, marginBottom: 10 }}>
          {/* Iterable array */}
          <div style={{ fontSize: 11, color: C.dim, fontFamily: "monospace", marginBottom: 8 }}>list = [10, 20, 30, 40, 50]  — memory addresses</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {items.map((val, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 9, color: C.dim, fontFamily: "monospace", marginBottom: 3 }}>0x{(100 + i * 8).toString(16)}</div>
                <div style={{
                  padding: "10px 4px", borderRadius: 6, fontFamily: "monospace", fontWeight: 700, fontSize: 15,
                  background: step === i ? C.yellow + "33" : step > i ? C.green + "15" : "rgba(255,255,255,0.05)",
                  border: `2px solid ${step === i ? C.yellow : step > i ? C.green + "60" : "rgba(255,255,255,0.1)"}`,
                  color: step === i ? C.yellow : step > i ? C.green : C.dim,
                  transition: "all 0.3s",
                  boxShadow: step === i ? `0 0 16px ${C.yellow}55` : "none"
                }}>{val}</div>
                <div style={{ fontSize: 9, color: C.dim, fontFamily: "monospace", marginTop: 3 }}>[{i}]</div>
              </div>
            ))}
          </div>

          {/* Arrow iterator */}
          <div style={{ position: "relative", height: 28, marginBottom: 12 }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${C.cyan}00, ${C.cyan}60, ${C.cyan}00)` }} />
            {step >= 0 && step < items.length && (
              <div style={{
                position: "absolute", top: -4,
                left: `calc(${step * 20 + 10}% - 12px)`,
                transition: "left 0.35s cubic-bezier(.34,1.56,.64,1)",
                fontSize: 18, lineHeight: 1
              }}>▲</div>
            )}
            <div style={{ textAlign: "center", fontSize: 10, color: C.cyan, fontFamily: "monospace", paddingTop: 14 }}>
              iterator pointer
            </div>
          </div>

          {/* Loop variables */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "item", val: step >= 0 && step < items.length ? items[step] : "—", color: C.yellow },
              { label: "total", val: acc, color: C.green },
            ].map(v => (
              <div key={v.label} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: "10px 12px", border: `1px solid ${v.color}30` }}>
                <div style={{ fontSize: 10, color: C.dim, fontFamily: "monospace" }}>{v.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: v.color, fontFamily: "monospace", transition: "all 0.3s" }}>{v.val}</div>
              </div>
            ))}
          </div>

          {/* Call stack frame */}
          <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(0,217,255,0.05)", borderRadius: 6, border: `1px solid ${C.cyan}20` }}>
            <div style={{ fontSize: 10, color: C.cyan, fontFamily: "monospace", marginBottom: 4 }}>Call Stack Frame</div>
            <code style={{ fontSize: 11, color: C.white, display: "block" }}>
              for item in list: <span style={{ color: C.yellow }}>→ iter.__next__()</span>
              <br />i = {step >= 0 ? step : 0}, StopIteration @ i=5
            </code>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={reset} color={C.red + "99"}>↺ Reset</Btn>
          <Btn onClick={() => { if (!playing) { tick(); } }} color="rgba(255,255,255,0.1)" disabled={playing || step >= items.length}>Step</Btn>
          <Btn onClick={() => setPlaying(p => !p)} color={playing ? C.orange : C.green} disabled={step >= items.length}>
            {playing ? "⏸ Pause" : "▶ Play"}
          </Btn>
          {[0.5, 1, 2].map(s => (
            <Btn key={s} onClick={() => setSpeed(s)} color={speed === s ? C.cyan : "rgba(255,255,255,0.08)"}>
              {s}x
            </Btn>
          ))}
        </div>
      </div>
      {/* Explanation */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card title="What Python does internally" color={C.yellow}>
          Python calls <code style={{ color: C.yellow }}>iter(list)</code> to get an iterator object, then calls <code style={{ color: C.cyan }}>__next__()</code> on it each iteration. When the list is exhausted it raises <code style={{ color: C.red }}>StopIteration</code> — that's the signal to exit.
        </Card>
        <Card title="Enumerate & Range" color={C.cyan}>
          <code style={{ fontSize: 11, color: C.cyan }}>for i, v in enumerate(list):</code><br />
          Wraps the iterator, yielding (index, value) tuples. <code style={{ color: C.yellow }}>range(n)</code> is a lazy iterator — it never allocates the full list in memory.
        </Card>
        <Card title="List Comprehension = faster for loop" color={C.green}>
          <code style={{ fontSize: 11 }}>
            <span style={{ color: C.green }}>[x*2 for x in list if x &gt; 10]</span>
          </code><br />
          Executes in C-level loops — ~30% faster than a Python for loop + append.
        </Card>
        <LogBox logs={logs} h={140} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. FUNCTIONS — Stack frames, scope, closures
// ═════════════════════════════════════════════════════════════════════════════
function FunctionViz() {
  const [step, setStep] = useState(0);
  const [logs, addLog, clearLog] = useLog();

  const FRAMES = [
    { name: "Global scope", vars: { x: 10, result: "?" }, highlight: "x", code: "x = 10\nresult = add(x, 5)", color: C.cyan },
    { name: "add(a=10, b=5)", vars: { a: 10, b: 5, "_return": "?" }, highlight: "a,b", code: "def add(a, b):\n    return a + b", color: C.yellow },
    { name: "add() → returns 15", vars: { a: 10, b: 5, "_return": 15 }, highlight: "_return", code: "return 10 + 5  # = 15", color: C.green },
    { name: "Global scope", vars: { x: 10, result: 15 }, highlight: "result", code: "result = 15  ✓", color: C.green },
  ];

  const messages = [
    ["Global frame created. x=10 stored in global namespace.", C.cyan],
    ["Python pushes add() onto call stack. New local frame created.", C.yellow],
    ["add() computes 10+5=15. Return value set.", C.orange],
    ["add() frame POPPED. result=15 stored in global frame.", C.green],
  ];

  const advance = () => {
    const next = Math.min(step + 1, FRAMES.length - 1);
    setStep(next);
    addLog(...messages[next]);
  };

  const reset = () => { setStep(0); clearLog(); addLog(messages[0][0], messages[0][1]); };
  useEffect(() => { addLog(messages[0][0], messages[0][1]); }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, border: `1px solid ${C.border}`, padding: 16, marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: C.dim, fontFamily: "monospace", marginBottom: 12 }}>Call Stack (grows upward)</div>

          {/* Stack visualization */}
          <div style={{ display: "flex", flexDirection: "column-reverse", gap: 6, minHeight: 200 }}>
            {FRAMES.slice(0, step + 1).map((frame, i) => (
              <div key={i} style={{
                padding: "10px 14px", borderRadius: 8, border: `2px solid ${frame.color}`,
                background: i === step ? frame.color + "18" : "rgba(255,255,255,0.03)",
                transition: "all 0.4s",
                boxShadow: i === step ? `0 0 20px ${frame.color}30` : "none"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: frame.color, fontFamily: "monospace" }}>
                    {i === step ? "▶ " : ""}{frame.name}
                  </span>
                  {i === step && <Tag color={frame.color}>ACTIVE</Tag>}
                  {i < step && <Tag color={C.dim}>below</Tag>}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {Object.entries(frame.vars).map(([k, v]) => (
                    <div key={k} style={{
                      padding: "3px 8px", borderRadius: 4, fontFamily: "monospace", fontSize: 11,
                      background: frame.highlight.includes(k) && i === step ? frame.color + "40" : "rgba(255,255,255,0.06)",
                      border: `1px solid ${frame.highlight.includes(k) && i === step ? frame.color : "rgba(255,255,255,0.1)"}`,
                      color: frame.highlight.includes(k) && i === step ? frame.color : C.white
                    }}>
                      {k} = <b>{String(v)}</b>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 6, fontSize: 10, color: C.dim, fontFamily: "monospace" }}>
                  <code>{frame.code}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={reset} color={C.red + "99"}>↺ Reset</Btn>
          <Btn onClick={advance} color={C.green} disabled={step >= FRAMES.length - 1}>Next Step →</Btn>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card title="Scope: LEGB Rule" color={C.purple}>
          Python looks up names in order:<br />
          <b style={{ color: C.yellow }}>L</b>ocal → <b style={{ color: C.orange }}>E</b>nclosing → <b style={{ color: C.cyan }}>G</b>lobal → <b style={{ color: C.purple }}>B</b>uilt-in<br />
          Each function call creates a new <b>frame object</b> with its own local namespace dict.
        </Card>
        <Card title="Closures" color={C.yellow}>
          <code style={{ fontSize: 10 }}>
            <span style={{ color: C.yellow }}>def make_adder(n):</span><br />
            {"    "}<span style={{ color: C.cyan }}>def adder(x): return x + n</span><br />
            {"    "}return adder
          </code><br />
          <code style={{ color: C.green }}>adder</code> captures <code style={{ color: C.yellow }}>n</code> in a <b>cell object</b> — even after <code>make_adder</code> exits.
        </Card>
        <Card title="*args and **kwargs" color={C.cyan}>
          <code style={{ fontSize: 11, color: C.cyan }}>*args</code> → tuple of positional args<br />
          <code style={{ fontSize: 11, color: C.yellow }}>**kwargs</code> → dict of keyword args<br />
          Both use the same stack frame but different namespaces.
        </Card>
        <LogBox logs={logs} h={130} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. NUMPY — Array operations visual
// ═════════════════════════════════════════════════════════════════════════════
function NumpyViz() {
  const [op, setOp] = useState("broadcast");
  const [logs, addLog, clearLog] = useLog();
  const canvasRef = useRef(null);
  const W = 480, H = 300;

  const OPS = {
    broadcast: {
      label: "Broadcasting",
      desc: "A(3×1) + B(1×3) → C(3×3)",
      color: C.cyan,
      draw: drawBroadcast,
    },
    slice: {
      label: "Fancy Indexing",
      desc: "arr[1:3, ::2] — rows 1-2, every other col",
      color: C.yellow,
      draw: drawSlice,
    },
    matmul: {
      label: "Matrix Multiply",
      desc: "A(2×3) @ B(3×2) → C(2×2)",
      color: C.green,
      draw: drawMatmul,
    },
    reshape: {
      label: "Reshape / Strides",
      desc: "Same data buffer, different view",
      color: C.orange,
      draw: drawReshape,
    },
    ufunc: {
      label: "Universal Functions",
      desc: "np.sqrt applied element-wise in C",
      color: C.purple,
      draw: drawUfunc,
    },
  };

  function cellRect(ctx, x, y, w, h, fill, stroke, text, textColor = "white") {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    if (text !== undefined) {
      ctx.fillStyle = textColor;
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(String(text), x + w / 2, y + h / 2 + 4);
      ctx.textAlign = "left";
    }
  }

  function drawBroadcast(ctx) {
    const A = [[1], [2], [3]];
    const B = [[10, 20, 30]];
    const CW = 30, CH = 30;
    const pad = 30;

    ctx.fillStyle = C.cyan + "22";
    ctx.fillRect(pad - 5, pad - 5, CW + 10, CH * 3 + 10);
    ctx.fillStyle = C.yellow + "22";
    ctx.fillRect(pad + CW + 40 - 5, pad - 5, CW * 3 + 10, CH + 10);

    // A column
    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("A (3×1)", pad, pad - 12);
    A.forEach((row, r) => row.forEach((v, c) => {
      cellRect(ctx, pad + c * CW, pad + r * CH, CW, CH, C.cyan + "40", C.cyan, v, C.cyan);
    }));

    // + sign
    ctx.fillStyle = "white"; ctx.font = "bold 20px monospace"; ctx.textAlign = "center";
    ctx.fillText("+", pad + CW + 20, pad + CH + 4);
    ctx.textAlign = "left";

    // B row
    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("B (1×3)", pad + CW + 40, pad - 12);
    B.forEach((row, r) => row.forEach((v, c) => {
      cellRect(ctx, pad + CW + 40 + c * CW, pad + r * CH, CW, CH, C.yellow + "40", C.yellow, v, C.yellow);
    }));

    // = sign
    ctx.fillStyle = "white"; ctx.font = "bold 20px monospace"; ctx.textAlign = "center";
    ctx.fillText("=", pad + CW + 40 + CW * 3 + 20, pad + CH + 4);
    ctx.textAlign = "left";

    // Result C(3×3)
    const rx = pad + CW + 40 + CW * 3 + 45;
    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("C (3×3)", rx, pad - 12);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const val = A[r][0] + B[0][c];
      cellRect(ctx, rx + c * CW, pad + r * CH, CW, CH, C.green + "40", C.green, val, C.green);
    }

    // Broadcast arrows
    ctx.strokeStyle = C.cyan + "50"; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
    [0, 1, 2].forEach(c => {
      ctx.beginPath(); ctx.moveTo(pad, pad + CH * 0 + CH / 2);
      ctx.lineTo(pad, pad + CH * c + CH / 2); ctx.stroke();
    });
    ctx.setLineDash([]);

    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "10px monospace";
    ctx.fillText("NumPy stretches A across columns,", pad, H - 48);
    ctx.fillText("B across rows — no memory copied!", pad, H - 34);
    ctx.fillStyle = C.green; ctx.font = "bold 10px monospace";
    ctx.fillText("Zero extra memory allocated (strides trick)", pad, H - 18);
  }

  function drawSlice(ctx) {
    const data = Array.from({ length: 4 }, (_, r) => Array.from({ length: 5 }, (_, c) => r * 5 + c));
    const CW = 44, CH = 36;
    const pad = { x: 40, y: 50 };

    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("arr (4×5) — arr[1:3, ::2]", pad.x, pad.y - 18);

    data.forEach((row, r) => row.forEach((val, c) => {
      const inSlice = r >= 1 && r < 3 && c % 2 === 0;
      const fill = inSlice ? C.yellow + "50" : "rgba(255,255,255,0.05)";
      const stroke = inSlice ? C.yellow : "rgba(255,255,255,0.12)";
      cellRect(ctx, pad.x + c * CW, pad.y + r * CH, CW - 2, CH - 2, fill, stroke, val,
        inSlice ? C.yellow : C.dim);
    }));

    // Result
    const rx = pad.x + 5 * CW + 30;
    ctx.fillStyle = C.yellow; ctx.font = "bold 11px monospace";
    ctx.fillText("Result (2×3):", rx, pad.y - 18);
    [[0, 2, 4], [5, 7, 9]].forEach((row, r) => row.forEach((val, c) => {
      cellRect(ctx, rx + c * (CW - 2), pad.y + 36 + r * (CH - 2), CW - 4, CH - 4,
        C.yellow + "40", C.yellow, val, C.yellow);
    }));

    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "10px monospace";
    ctx.fillText("1:3 → rows 1,2   ::2 → every 2nd col", pad.x, H - 30);
    ctx.fillStyle = C.cyan; ctx.font = "10px monospace";
    ctx.fillText("Returns a VIEW — same memory, different strides", pad.x, H - 15);
  }

  function drawMatmul(ctx) {
    const A = [[1, 2, 3], [4, 5, 6]];
    const B = [[7, 8], [9, 10], [11, 12]];
    const CW = 36, CH = 30;
    const px = 30, py = 60;

    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("A (2×3)", px, py - 15);
    A.forEach((row, r) => row.forEach((v, c) => {
      cellRect(ctx, px + c * CW, py + r * CH, CW - 2, CH - 2, C.cyan + "35", C.cyan, v, C.cyan);
    }));

    ctx.fillStyle = "white"; ctx.font = "bold 18px monospace"; ctx.textAlign = "center";
    ctx.fillText("@", px + 3 * CW + 18, py + CH + 2);
    ctx.textAlign = "left";

    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("B (3×2)", px + 3 * CW + 35, py - 15);
    B.forEach((row, r) => row.forEach((v, c) => {
      cellRect(ctx, px + 3 * CW + 35 + c * CW, py + r * CH, CW - 2, CH - 2, C.yellow + "35", C.yellow, v, C.yellow);
    }));

    ctx.fillStyle = "white"; ctx.font = "bold 18px monospace"; ctx.textAlign = "center";
    ctx.fillText("=", px + 5 * CW + 60, py + CH + 2);
    ctx.textAlign = "left";

    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    const rx = px + 5 * CW + 78;
    ctx.fillText("C (2×2)", rx, py - 15);
    [[58, 64], [139, 154]].forEach((row, r) => row.forEach((v, c) => {
      cellRect(ctx, rx + c * (CW + 4), py + r * CH, CW + 2, CH - 2, C.green + "40", C.green, v, C.green);
    }));

    // Dot product illustration
    ctx.strokeStyle = C.cyan + "70"; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(px, py, 3 * (CW - 2) + 2, CH, 3);
    ctx.stroke();

    ctx.strokeStyle = C.yellow + "70";
    ctx.beginPath();
    ctx.roundRect(px + 3 * CW + 35, py, CW - 2, 3 * (CH - 2) + 2, 3);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "10px monospace";
    ctx.fillText("C[0][0] = 1×7 + 2×9 + 3×11 = 58", px, H - 40);
    ctx.fillText("Each cell = dot product of row × col", px, H - 26);
    ctx.fillStyle = C.green;
    ctx.fillText("Uses BLAS/LAPACK — highly optimised C/Fortran", px, H - 10);
  }

  function drawReshape(ctx) {
    const data = [1, 2, 3, 4, 5, 6];
    const CW = 38, CH = 34;
    const py = 60;

    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("Original: shape (6,)  — 1D array", 30, py - 15);

    // Buffer
    ctx.fillStyle = "rgba(255,165,0,0.08)";
    ctx.fillRect(28, py - 5, 6 * CW + 4, CH + 10);
    ctx.strokeStyle = C.orange + "40"; ctx.lineWidth = 1;
    ctx.strokeRect(28, py - 5, 6 * CW + 4, CH + 10);
    ctx.fillStyle = C.dim; ctx.font = "9px monospace";
    ctx.fillText("contiguous memory buffer", 30, py + CH + 18);

    data.forEach((v, i) => {
      cellRect(ctx, 30 + i * CW, py, CW - 2, CH, C.orange + "35", C.orange, v, C.orange);
    });

    // Reshape to 2×3
    const r1x = 30, r1y = py + CH + 40;
    ctx.fillStyle = C.yellow; ctx.font = "bold 11px monospace";
    ctx.fillText("reshape(2, 3)  →  same buffer, strides=(24,8)", r1x, r1y - 6);
    [[1, 2, 3], [4, 5, 6]].forEach((row, r) => row.forEach((v, c) => {
      cellRect(ctx, r1x + c * CW, r1y + r * CH, CW - 2, CH - 2, C.yellow + "35", C.yellow, v, C.yellow);
    }));

    // Reshape to 3×2
    const r2x = r1x + 3 * CW + 50, r2y = r1y;
    ctx.fillStyle = C.cyan; ctx.font = "bold 11px monospace";
    ctx.fillText("reshape(3, 2)", r2x, r2y - 6);
    [[1, 2], [3, 4], [5, 6]].forEach((row, r) => row.forEach((v, c) => {
      cellRect(ctx, r2x + c * CW, r2y + r * CH, CW - 2, CH - 2, C.cyan + "35", C.cyan, v, C.cyan);
    }));

    // Arrows from buffer
    ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(r1x + 1.5 * CW, py + CH + 5); ctx.lineTo(r1x + 1.5 * CW, r1y - 1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r2x + CW, py + CH + 5); ctx.lineTo(r2x + CW, r2y - 1); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = C.green; ctx.font = "bold 10px monospace";
    ctx.fillText("No copy made — just metadata (shape/strides) changes", 30, H - 12);
  }

  function drawUfunc(ctx) {
    const data = [1, 4, 9, 16, 25];
    const results = data.map(Math.sqrt);
    const CW = 54, CH = 38;
    const px = 30, py = 55;

    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("Input array", px, py - 15);
    data.forEach((v, i) => {
      cellRect(ctx, px + i * CW, py, CW - 3, CH, C.purple + "35", C.purple, v, C.purple);
    });

    // Function block
    const fx = px + 5 * CW / 2 - 50, fy = py + CH + 18;
    ctx.fillStyle = C.purple + "20";
    ctx.fillRect(fx, fy, 100, 34);
    ctx.strokeStyle = C.purple;
    ctx.lineWidth = 2;
    ctx.strokeRect(fx, fy, 100, 34);
    ctx.fillStyle = C.purple; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText("np.sqrt  (ufunc)", fx + 50, fy + 14);
    ctx.fillStyle = C.dim; ctx.font = "9px monospace";
    ctx.fillText("C loop — no Python overhead", fx + 50, fy + 27);
    ctx.textAlign = "left";

    // Arrows down
    data.forEach((_, i) => {
      ctx.strokeStyle = C.purple + "50"; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + i * CW + (CW - 3) / 2, py + CH);
      ctx.lineTo(fx + 50, fy);
      ctx.stroke();
    });

    const ry = fy + 34 + 18;
    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("Output array", px, ry - 6);
    results.forEach((v, i) => {
      cellRect(ctx, px + i * CW, ry, CW - 3, CH, C.green + "35", C.green, v.toFixed(1), C.green);
      ctx.strokeStyle = C.green + "50"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(fx + 50, fy + 34); ctx.lineTo(px + i * CW + (CW - 3) / 2, ry); ctx.stroke();
    });

    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "10px monospace";
    ctx.fillText("np.sqrt([1,4,9,16,25])  →  [1.0, 2.0, 3.0, 4.0, 5.0]", px, H - 12);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    OPS[op].draw(ctx);
    clearLog();
    const descs = {
      broadcast: ["np.broadcast: A(3×1) + B(1×3) stretches to (3×3)", "No extra memory allocated — strides make it virtual", "np.broadcast_to() does same without the +"],
      slice:     ["arr[1:3, ::2] selects rows 1,2 and every 2nd column", "Returns a VIEW — same memory block, different start/stride", "Copy with .copy() if you need independence"],
      matmul:    ["@ operator calls np.matmul → BLAS routine", "C[i,j] = sum(A[i,k] * B[k,j]) for k", "~100x faster than nested Python loops"],
      reshape:   ["reshape() changes shape metadata, not buffer", "Strides define bytes to skip per dimension step", "ravel() = flatten, reshape(-1) = infer dim"],
      ufunc:     ["Universal functions apply ops element-wise in C", "Supports broadcasting, type casting, out= argument", "Custom ufuncs via np.frompyfunc or Numba"],
    };
    descs[op].forEach((m, i) => setTimeout(() => addLog(m, [C.cyan, C.yellow, C.green][i]), i * 200));
  }, [op]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {Object.entries(OPS).map(([k, v]) => (
            <button key={k} onClick={() => setOp(k)} style={{
              padding: "5px 10px", borderRadius: 6, border: `1px solid ${op === k ? v.color : "rgba(255,255,255,0.1)"}`,
              background: op === k ? v.color + "20" : "transparent", color: op === k ? v.color : C.dim,
              cursor: "pointer", fontFamily: "monospace", fontSize: 11, fontWeight: op === k ? 700 : 400
            }}>{v.label}</button>
          ))}
        </div>
        <canvas ref={canvasRef} width={W} height={H} style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg }} />
        <div style={{ marginTop: 8, padding: "8px 12px", background: "rgba(0,0,0,0.3)", borderRadius: 6, fontSize: 11, color: OPS[op].color, fontFamily: "monospace" }}>
          {OPS[op].desc}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card title="NumPy Memory Model" color={C.orange}>
          Every ndarray = <b>data buffer</b> + <b>dtype</b> + <b>shape</b> + <b>strides</b>.<br />
          Strides tell numpy how many bytes to skip per step in each dimension. This makes reshape/transpose/slicing <b>zero-copy</b>.
        </Card>
        <Card title="Why NumPy is fast" color={C.cyan}>
          Python loops are ~100ns/iter. NumPy C loops are ~1ns/iter. The key: <b>contiguous typed arrays</b> + <b>vectorised SIMD</b> CPU instructions + <b>BLAS</b> for linear algebra.
        </Card>
        <Card title="Key NumPy functions" color={C.yellow}>
          <code style={{ fontSize: 10, lineHeight: 2, display: "block" }}>
            <span style={{ color: C.yellow }}>np.zeros/ones/eye/arange/linspace</span><br />
            <span style={{ color: C.cyan }}>np.dot / @ / np.linalg.inv/eig/svd</span><br />
            <span style={{ color: C.green }}>np.sum/mean/std/var/min/max/argmax</span><br />
            <span style={{ color: C.orange }}>np.stack/vstack/hstack/concatenate</span><br />
            <span style={{ color: C.purple }}>np.where/select/clip/sign</span>
          </code>
        </Card>
        <LogBox logs={logs} h={120} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. PANDAS — DataFrame operations
// ═════════════════════════════════════════════════════════════════════════════
function PandasViz() {
  const [op, setOp] = useState("groupby");
  const [logs, addLog, clearLog] = useLog();

  const df = [
    { name: "Alice",   dept: "Eng",  salary: 90000, yrs: 5 },
    { name: "Bob",     dept: "Eng",  salary: 80000, yrs: 3 },
    { name: "Carol",   dept: "HR",   salary: 65000, yrs: 7 },
    { name: "Dave",    dept: "HR",   salary: 60000, yrs: 2 },
    { name: "Eve",     dept: "Eng",  salary: 95000, yrs: 8 },
    { name: "Frank",   dept: "Mktg", salary: 70000, yrs: 4 },
  ];

  const ops = {
    groupby: {
      label: "groupby().agg()",
      code: "df.groupby('dept')['salary'].mean()",
      desc: "Split → Apply → Combine",
      color: C.cyan,
      result: [{ dept: "Eng", salary: 88333 }, { dept: "HR", salary: 62500 }, { dept: "Mktg", salary: 70000 }],
      highlight: r => r.dept,
    },
    filter: {
      label: "Boolean Mask",
      code: "df[df.salary > 70000]",
      desc: "Creates bool array, then fancy-indexes",
      color: C.yellow,
      result: df.filter(r => r.salary > 70000),
      highlight: r => r.salary > 70000,
    },
    merge: {
      label: "merge / join",
      code: "pd.merge(df, dept_info, on='dept')",
      desc: "Hash join — O(n+m)",
      color: C.green,
      result: df.slice(0, 4),
      highlight: r => r.dept === "Eng",
    },
    apply: {
      label: "apply / map",
      code: "df['salary'].apply(lambda x: x*1.1)",
      desc: "Applies function row/column-wise",
      color: C.orange,
      result: df.map(r => ({ ...r, salary: Math.round(r.salary * 1.1) })),
      highlight: () => true,
    },
  };

  useEffect(() => {
    clearLog();
    const op_ = ops[op];
    addLog(`df.${op_?.code ?? ""}`, op_.color);
    addLog(`▸ Operation: ${op_.desc}`, C.yellow);
    if (op === "groupby") {
      addLog("Step 1: SPLIT rows by 'dept' into 3 buckets", C.cyan);
      addLog("Step 2: APPLY mean() to each salary bucket", C.cyan);
      addLog("Step 3: COMBINE results into new DataFrame", C.green);
    }
    if (op === "filter") {
      addLog("▸ df.salary > 70000 → [T, T, F, F, T, F]", C.yellow);
      addLog("▸ df[bool_mask] → 3 matching rows returned", C.green);
    }
    if (op === "apply") {
      addLog("▸ Python-level loop (slower than vectorized)", C.orange);
      addLog("▸ Use df['salary'] * 1.1 instead for speed!", C.green);
    }
  }, [op]);

  const cfg = ops[op];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {Object.entries(ops).map(([k, v]) => (
            <button key={k} onClick={() => setOp(k)} style={{
              padding: "5px 10px", borderRadius: 6, border: `1px solid ${op === k ? v.color : "rgba(255,255,255,0.1)"}`,
              background: op === k ? v.color + "20" : "transparent", color: op === k ? v.color : C.dim,
              cursor: "pointer", fontFamily: "monospace", fontSize: 11, fontWeight: op === k ? 700 : 400
            }}>{v.label}</button>
          ))}
        </div>

        {/* Source DataFrame */}
        <DFTable title="Source DataFrame" rows={df} highlight={cfg.highlight} color={cfg.color} cols={["name", "dept", "salary", "yrs"]} />

        {/* Arrow */}
        <div style={{ textAlign: "center", padding: "6px 0", fontFamily: "monospace", fontSize: 13 }}>
          <span style={{ color: cfg.color }}>⬇ {cfg.code}</span>
        </div>

        {/* Result */}
        <DFTable title="Result" rows={cfg.result} highlight={() => true} color={C.green}
          cols={op === "groupby" ? ["dept", "salary"] : ["name", "dept", "salary", "yrs"]} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card title="Pandas Internals" color={C.cyan}>
          A DataFrame = dict of <b>Series</b> (backed by NumPy arrays). Column ops are vectorised. <code style={{ color: C.yellow }}>groupby</code> uses a hash map to split rows into buckets in O(n).
        </Card>
        <Card title="Performance Tips" color={C.orange}>
          <code style={{ fontSize: 10, lineHeight: 2 }}>
            <span style={{ color: C.green }}>✓ vectorised: df['x'] * 2</span><br />
            <span style={{ color: C.red }}>✗ slow: df.apply(lambda row: ...)</span><br />
            <span style={{ color: C.yellow }}>✓ use .loc/.iloc not chained []</span><br />
            <span style={{ color: C.cyan }}>✓ pd.concat vs loop of appends</span>
          </code>
        </Card>
        <Card title="Key Pandas ops" color={C.yellow}>
          <code style={{ fontSize: 10, lineHeight: 1.9, display: "block" }}>
            <span style={{ color: C.cyan }}>read_csv/json/sql/parquet</span><br />
            <span style={{ color: C.yellow }}>merge/join/concat/pivot_table</span><br />
            <span style={{ color: C.green }}>fillna/dropna/astype/rename</span><br />
            <span style={{ color: C.orange }}>value_counts/nunique/describe</span><br />
            <span style={{ color: C.purple }}>melt/explode/str.split/dt.month</span>
          </code>
        </Card>
        <LogBox logs={logs} h={120} />
      </div>
    </div>
  );
}

function DFTable({ title, rows, highlight, color, cols }) {
  return (
    <div style={{ border: `1px solid ${color}40`, borderRadius: 8, overflow: "hidden", marginBottom: 4 }}>
      <div style={{ padding: "5px 10px", background: color + "18", fontSize: 10, color, fontFamily: "monospace", fontWeight: 700 }}>{title}</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: 11 }}>
          <thead>
            <tr>{cols.map(c => <th key={c} style={{ padding: "4px 10px", borderBottom: `1px solid rgba(255,255,255,0.08)`, color: C.dim, textAlign: "left", whiteSpace: "nowrap" }}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: highlight(row) ? color + "14" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {cols.map(c => <td key={c} style={{ padding: "4px 10px", color: highlight(row) ? color : C.dim, whiteSpace: "nowrap" }}>
                  {typeof row[c] === "number" && c === "salary" ? `$${row[c].toLocaleString()}` : String(row[c] ?? "")}
                </td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 5. MATPLOTLIB — Chart gallery with live canvas rendering
// ═════════════════════════════════════════════════════════════════════════════
function MatplotlibViz() {
  const canvasRef = useRef(null);
  const [chart, setChart] = useState("line");
  const W = 480, H = 310;

  const charts = {
    line:     { label: "Line Plot",     color: C.cyan,   fn: drawLine },
    bar:      { label: "Bar Chart",     color: C.yellow, fn: drawBar },
    scatter:  { label: "Scatter Plot",  color: C.green,  fn: drawScatter },
    hist:     { label: "Histogram",     color: C.purple, fn: drawHist },
    heatmap:  { label: "Heatmap",       color: C.orange, fn: drawHeatmap },
    pie:      { label: "Pie Chart",     color: C.pink,   fn: drawPie },
  };

  function drawAxes(ctx, pad, xlabel, ylabel, title) {
    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(pad.l, pad.t); ctx.lineTo(pad.l, H - pad.b); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "10px monospace"; ctx.textAlign = "center";
    ctx.fillText(title, W / 2, 14);
    ctx.fillText(xlabel, W / 2, H - 4);
    ctx.save(); ctx.translate(12, H / 2); ctx.rotate(-Math.PI / 2);
    ctx.fillText(ylabel, 0, 0); ctx.restore(); ctx.textAlign = "left";
  }

  function drawLine(ctx) {
    const pad = { l: 45, r: 20, t: 22, b: 30 };
    const data = [2, 5, 3, 8, 6, 9, 4, 7, 10, 8];
    const [minV, maxV] = [0, 11];
    drawAxes(ctx, pad, "x", "y", "plt.plot(x, y)");
    const toX = i => pad.l + i * (W - pad.l - pad.r) / (data.length - 1);
    const toY = v => H - pad.b - (v - minV) / (maxV - minV) * (H - pad.t - pad.b);
    // Shaded area
    ctx.fillStyle = C.cyan + "18";
    ctx.beginPath(); ctx.moveTo(toX(0), H - pad.b);
    data.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
    ctx.lineTo(toX(data.length - 1), H - pad.b); ctx.closePath(); ctx.fill();
    // Line
    ctx.strokeStyle = C.cyan; ctx.lineWidth = 2.5; ctx.shadowColor = C.cyan; ctx.shadowBlur = 6;
    ctx.beginPath();
    data.forEach((v, i) => { if (i === 0) ctx.moveTo(toX(i), toY(v)); else ctx.lineTo(toX(i), toY(v)); });
    ctx.stroke(); ctx.shadowBlur = 0;
    // Dots
    data.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(toX(i), toY(v), 4, 0, Math.PI * 2);
      ctx.fillStyle = C.cyan; ctx.fill();
    });
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "10px monospace";
    ctx.fillText("plt.plot(x, y, color='cyan', linewidth=2)", 50, H - 10);
  }

  function drawBar(ctx) {
    const pad = { l: 45, r: 20, t: 22, b: 30 };
    const data = [{ l: "Jan", v: 12 }, { l: "Feb", v: 19 }, { l: "Mar", v: 8 }, { l: "Apr", v: 15 }, { l: "May", v: 22 }];
    drawAxes(ctx, pad, "Month", "Sales", "plt.bar(months, values)");
    const barW = (W - pad.l - pad.r) / data.length * 0.65;
    const gap = (W - pad.l - pad.r) / data.length;
    data.forEach((d, i) => {
      const bh = d.v / 25 * (H - pad.t - pad.b);
      const bx = pad.l + i * gap + (gap - barW) / 2;
      const by = H - pad.b - bh;
      const grad = ctx.createLinearGradient(bx, by, bx, H - pad.b);
      grad.addColorStop(0, C.yellow); grad.addColorStop(1, C.yellow + "55");
      ctx.fillStyle = grad; ctx.fillRect(bx, by, barW, bh);
      ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "10px monospace"; ctx.textAlign = "center";
      ctx.fillText(d.l, bx + barW / 2, H - pad.b + 12);
      ctx.fillStyle = C.yellow; ctx.fillText(d.v, bx + barW / 2, by - 4);
    });
    ctx.textAlign = "left";
  }

  function drawScatter(ctx) {
    const pad = { l: 45, r: 20, t: 22, b: 30 };
    drawAxes(ctx, pad, "Feature 1", "Feature 2", "plt.scatter(x, y, c=labels)");
    const rng = Math.PI; // seed
    const pts = Array.from({ length: 60 }, (_, i) => {
      const cls = i % 3;
      const cx = [0.25, 0.5, 0.75][cls], cy = [0.3, 0.7, 0.5][cls];
      return { x: cx + (Math.sin(i * 1.7) * 0.15), y: cy + (Math.cos(i * 2.3) * 0.12), cls };
    });
    const cols = [C.cyan, C.yellow, C.green];
    pts.forEach(p => {
      const px = pad.l + p.x * (W - pad.l - pad.r);
      const py = pad.t + (1 - p.y) * (H - pad.t - pad.b);
      ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2);
      ctx.fillStyle = cols[p.cls] + "cc"; ctx.shadowColor = cols[p.cls]; ctx.shadowBlur = 4;
      ctx.fill(); ctx.shadowBlur = 0;
    });
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "10px monospace";
    ctx.fillText("c=labels, cmap='viridis', alpha=0.8", 50, H - 10);
  }

  function drawHist(ctx) {
    const pad = { l: 45, r: 20, t: 22, b: 30 };
    drawAxes(ctx, pad, "Value", "Frequency", "plt.hist(data, bins=10)");
    const bins = [3, 8, 15, 22, 30, 25, 18, 10, 5, 2];
    const maxV = Math.max(...bins);
    const bW = (W - pad.l - pad.r) / bins.length;
    bins.forEach((v, i) => {
      const bh = v / maxV * (H - pad.t - pad.b);
      const bx = pad.l + i * bW;
      const by = H - pad.b - bh;
      const grad = ctx.createLinearGradient(bx, by, bx, H - pad.b);
      grad.addColorStop(0, C.purple); grad.addColorStop(1, C.purple + "40");
      ctx.fillStyle = grad; ctx.fillRect(bx + 1, by, bW - 2, bh);
      ctx.strokeStyle = C.purple + "40"; ctx.lineWidth = 1; ctx.strokeRect(bx + 1, by, bW - 2, bh);
    });
    // Normal curve overlay
    ctx.strokeStyle = C.yellow; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= bins.length; i += 0.1) {
      const norm = Math.exp(-0.5 * ((i - bins.length / 2) / (bins.length / 4)) ** 2);
      const px = pad.l + i * bW;
      const py = H - pad.b - norm * (H - pad.t - pad.b) * 0.95;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "10px monospace";
    ctx.fillText("bins=10, density=True, kde=True", 50, H - 10);
  }

  function drawHeatmap(ctx) {
    const pad = { l: 40, r: 10, t: 22, b: 40 };
    const data = [[1, 0.87, 0.3], [0.87, 1, 0.55], [0.3, 0.55, 1]];
    const labels = ["Age", "Salary", "Exp"];
    const n = data.length;
    const cellW = (W - pad.l - pad.r) / n;
    const cellH = (H - pad.t - pad.b) / n;
    ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.fillText("Correlation Heatmap  sns.heatmap(corr)", W / 2, 14);
    data.forEach((row, r) => row.forEach((v, c) => {
      const x = pad.l + c * cellW, y = pad.t + r * cellH;
      const t = (v + 1) / 2;
      const rgb = `rgb(${Math.round((1-t)*20)},${Math.round(t*180)},${Math.round(t*255)})`;
      ctx.fillStyle = rgb; ctx.fillRect(x, y, cellW - 1, cellH - 1);
      ctx.fillStyle = v > 0.5 ? "#000" : "#fff"; ctx.font = "bold 12px monospace";
      ctx.fillText(v.toFixed(2), x + cellW / 2, y + cellH / 2 + 4);
      ctx.fillStyle = C.dim; ctx.font = "10px monospace";
      ctx.fillText(labels[c], x + cellW / 2, H - pad.b + 14);
      ctx.fillText(labels[r], pad.l - 4, y + cellH / 2 + 4);
    }));
    ctx.textAlign = "left";
  }

  function drawPie(ctx) {
    const data = [{ l: "Eng", v: 45, c: C.cyan }, { l: "HR", v: 25, c: C.yellow }, { l: "Mktg", v: 30, c: C.green }];
    const total = data.reduce((s, d) => s + d.v, 0);
    const cx = W * 0.38, cy = H * 0.52, r = 95;
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText("plt.pie(sizes, labels=labels, autopct='%1.0f%%')", W / 2, 14);
    ctx.textAlign = "left";
    let startAngle = -Math.PI / 2;
    data.forEach(d => {
      const sweep = d.v / total * 2 * Math.PI;
      const explode = 0.08;
      const midAngle = startAngle + sweep / 2;
      const ex = cx + explode * r * Math.cos(midAngle), ey = cy + explode * r * Math.sin(midAngle);
      ctx.beginPath(); ctx.moveTo(ex, ey); ctx.arc(ex, ey, r, startAngle, startAngle + sweep); ctx.closePath();
      ctx.fillStyle = d.c + "cc"; ctx.shadowColor = d.c; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
      ctx.strokeStyle = C.bg; ctx.lineWidth = 2; ctx.stroke();
      const lx = ex + (r + 22) * Math.cos(midAngle), ly = ey + (r + 22) * Math.sin(midAngle);
      ctx.fillStyle = d.c; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
      ctx.fillText(`${d.l} ${d.v}%`, lx, ly);
      startAngle += sweep;
    });
    ctx.textAlign = "left";
    // Legend
    data.forEach((d, i) => {
      ctx.fillStyle = d.c; ctx.fillRect(W * 0.72, 60 + i * 28, 14, 14);
      ctx.fillStyle = C.white; ctx.font = "11px monospace"; ctx.fillText(d.l, W * 0.72 + 20, 73 + i * 28);
    });
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    charts[chart].fn(ctx);
  }, [chart]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <div style={{ display: "flex", gap: 5, marginBottom: 10, flexWrap: "wrap" }}>
          {Object.entries(charts).map(([k, v]) => (
            <button key={k} onClick={() => setChart(k)} style={{
              padding: "5px 10px", borderRadius: 6, border: `1px solid ${chart === k ? v.color : "rgba(255,255,255,0.1)"}`,
              background: chart === k ? v.color + "20" : "transparent", color: chart === k ? v.color : C.dim,
              cursor: "pointer", fontFamily: "monospace", fontSize: 11, fontWeight: chart === k ? 700 : 400
            }}>{v.label}</button>
          ))}
        </div>
        <canvas ref={canvasRef} width={W} height={H} style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card title="Matplotlib / Seaborn Anatomy" color={C.orange}>
          <code style={{ fontSize: 10, lineHeight: 2, display: "block" }}>
            <span style={{ color: C.yellow }}>fig, ax = plt.subplots(figsize=(8,5))</span><br />
            <span style={{ color: C.cyan }}>ax.plot(x, y, color, linewidth)</span><br />
            <span style={{ color: C.green }}>ax.set_xlabel / ylabel / title</span><br />
            <span style={{ color: C.orange }}>ax.legend / ax.grid / ax.annotate</span><br />
            <span style={{ color: C.purple }}>plt.tight_layout() / savefig()</span>
          </code>
        </Card>
        <Card title="Seaborn shortcuts" color={C.cyan}>
          <code style={{ fontSize: 10, lineHeight: 1.9, display: "block" }}>
            <span style={{ color: C.cyan }}>sns.heatmap(corr, annot=True)</span><br />
            <span style={{ color: C.yellow }}>sns.boxplot/violinplot/pairplot</span><br />
            <span style={{ color: C.green }}>sns.regplot (scatter + regression)</span><br />
            <span style={{ color: C.orange }}>sns.FacetGrid (multi-panel)</span>
          </code>
        </Card>
        <Card title="Plotly for interactivity" color={C.green}>
          Use <b>plotly.express</b> for one-line interactive charts. <b>Dash</b> for full dashboards. Both run in browser — ideal for ML result presentation.
        </Card>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 6. GENERATORS, DECORATORS, CONTEXT MANAGERS
// ═════════════════════════════════════════════════════════════════════════════
function AdvancedPythonViz() {
  const [topic, setTopic] = useState("generator");
  const [genStep, setGenStep] = useState(-1);
  const [logs, addLog, clearLog] = useLog();

  const GEN_STEPS = [
    { line: "def fib(): a,b = 0,1", state: { a: "—", b: "—" }, log: "Function object created. NOT executed yet.", color: C.dim },
    { line: "g = fib()  # generator object", state: { a: "—", b: "—" }, log: "Generator object created. Execution PAUSED at start.", color: C.yellow },
    { line: "next(g)  →  yield 0", state: { a: 0, b: 1 }, log: "Runs until yield 0. Returns 0. SUSPENDS here. Stack preserved!", color: C.cyan },
    { line: "next(g)  →  yield 1", state: { a: 1, b: 1 }, log: "Resumes from yield. a,b=1,1. Yields 1.", color: C.cyan },
    { line: "next(g)  →  yield 1", state: { a: 1, b: 2 }, log: "Resumes. a,b=1,2. Yields 1.", color: C.cyan },
    { line: "next(g)  →  yield 2", state: { a: 2, b: 3 }, log: "Resumes. a,b=2,3. Yields 2.", color: C.green },
    { line: "next(g)  →  yield 3", state: { a: 3, b: 5 }, log: "Resumes. Yields 3. Lazy — no list in memory!", color: C.green },
  ];

  const DEC_STEPS = [
    { stage: "Define decorator", code: "def timer(fn):\n    def wrapper(*a,**k):\n        t0 = time.time()\n        res = fn(*a,**k)\n        print(time.time()-t0)\n        return res\n    return wrapper", color: C.yellow },
    { stage: "@timer applied", code: "@timer\ndef slow_fn(): time.sleep(1)", color: C.cyan },
    { stage: "Call slow_fn()", code: "slow_fn()  # actually calls\n# timer(slow_fn)()", color: C.orange },
    { stage: "wrapper executes", code: "t0 = time.time()\nres = slow_fn_original()\nprint(time.time()-t0)  # ~1.0s\nreturn res", color: C.green },
  ];

  const CTX_STEPS = [
    { stage: "__enter__", code: "with open('data.csv') as f:\n    # __enter__ returns file handle", color: C.cyan },
    { stage: "Body executes", code: "    data = f.read()\n    process(data)", color: C.yellow },
    { stage: "__exit__ always runs", code: "# even if exception raised!\nf.close()  # guaranteed cleanup", color: C.green },
    { stage: "contextlib.contextmanager", code: "@contextmanager\ndef db_conn():\n    conn = connect()\n    try: yield conn\n    finally: conn.close()", color: C.purple },
  ];

  useEffect(() => {
    clearLog();
    if (topic === "generator") {
      addLog("Generator = lazy iterator. Yields one value at a time.", C.yellow);
      addLog("Saves memory vs list — infinite sequences possible.", C.cyan);
    } else if (topic === "decorator") {
      addLog("Decorator = function that wraps another function.", C.yellow);
      addLog("@dec is syntactic sugar for fn = dec(fn)", C.cyan);
    } else {
      addLog("Context manager = setup / cleanup pattern.", C.yellow);
      addLog("__exit__ always called even if exception raised.", C.cyan);
    }
  }, [topic]);

  const steps = topic === "generator" ? GEN_STEPS : topic === "decorator" ? DEC_STEPS : CTX_STEPS;
  const [step, setStep] = useState(0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[["generator", C.cyan], ["decorator", C.yellow], ["context", C.purple]].map(([k, col]) => (
            <button key={k} onClick={() => { setTopic(k); setStep(0); }} style={{
              padding: "5px 12px", borderRadius: 6, border: `1px solid ${topic === k ? col : "rgba(255,255,255,0.1)"}`,
              background: topic === k ? col + "22" : "transparent", color: topic === k ? col : C.dim,
              cursor: "pointer", fontFamily: "monospace", fontSize: 11, fontWeight: topic === k ? 700 : 400,
              textTransform: "capitalize"
            }}>{k}</button>
          ))}
        </div>

        {/* Step viewer */}
        <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, border: `1px solid ${C.border}`, padding: 14, marginBottom: 10, minHeight: 260 }}>
          {topic === "generator" && (
            <>
              <div style={{ fontSize: 11, color: C.dim, fontFamily: "monospace", marginBottom: 10 }}>
                def fib(): a,b = 0,1<br />
                {"    "}while True:<br />
                {"        "}yield a<br />
                {"        "}a,b = b, a+b
              </div>
              {GEN_STEPS.slice(0, Math.max(1, step + 1)).map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, padding: "6px 10px", borderRadius: 6, background: i === step ? s.color + "18" : "transparent", border: `1px solid ${i === step ? s.color : "transparent"}` }}>
                  <span style={{ fontSize: 10, color: s.color, fontFamily: "monospace", minWidth: 14 }}>{i === step ? "▶" : "✓"}</span>
                  <div>
                    <code style={{ fontSize: 11, color: s.color }}>{s.line}</code>
                    {i === step && (
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        {Object.entries(s.state).map(([k, v]) => (
                          <span key={k} style={{ fontSize: 11, fontFamily: "monospace", padding: "2px 8px", background: "rgba(0,0,0,0.3)", borderRadius: 4, color: C.yellow }}>
                            {k}={String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {(topic === "decorator" || topic === "context") && (
            <div>
              {steps.map((s, i) => (
                <div key={i} onClick={() => { setStep(i); addLog(s.stage, s.color); }} style={{
                  padding: "10px 12px", marginBottom: 8, borderRadius: 8, cursor: "pointer",
                  background: i === step ? s.color + "18" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${i === step ? s.color : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.2s"
                }}>
                  <div style={{ fontSize: 10, color: s.color, fontWeight: 700, fontFamily: "monospace", marginBottom: 5 }}>{s.stage}</div>
                  <pre style={{ margin: 0, fontSize: 11, color: i === step ? C.white : C.dim, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{s.code}</pre>
                </div>
              ))}
            </div>
          )}
        </div>

        {topic === "generator" && (
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => { setStep(0); clearLog(); addLog(GEN_STEPS[0].log, GEN_STEPS[0].color); }} color={C.red + "99"}>↺</Btn>
            <Btn onClick={() => {
              const next = Math.min(step + 1, GEN_STEPS.length - 1);
              setStep(next); addLog(GEN_STEPS[next].log, GEN_STEPS[next].color);
            }} color={C.cyan} disabled={step >= GEN_STEPS.length - 1}>next(g) →</Btn>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {topic === "generator" && (
          <>
            <Card title="Why generators?" color={C.cyan}>
              A list of 1M fibonacci numbers uses ~8MB. A generator uses <b>O(1) memory</b> — only the current state (a, b) is stored. Python suspends the frame at <code style={{ color: C.yellow }}>yield</code> and resumes exactly there on <code style={{ color: C.cyan }}>next()</code>.
            </Card>
            <Card title="Generator expressions" color={C.yellow}>
              <code style={{ fontSize: 11 }}>(x**2 for x in range(1000000))</code><br />
              Like list comp but lazy. Use with <code>sum()</code>, <code>any()</code>, <code>itertools</code>. Pipe generators for elegant data pipelines.
            </Card>
          </>
        )}
        {topic === "decorator" && (
          <>
            <Card title="Decorator internals" color={C.yellow}>
              <code>@timer</code> is equivalent to <code>fn = timer(fn)</code> executed at definition time. The original function is replaced by <code>wrapper</code>. <code>functools.wraps</code> preserves <code>__name__</code> and <code>__doc__</code>.
            </Card>
            <Card title="Common decorators" color={C.cyan}>
              <code style={{ fontSize: 10, lineHeight: 2, display: "block" }}>
                <span style={{ color: C.green }}>@staticmethod / @classmethod</span><br />
                <span style={{ color: C.yellow }}>@property  (getter/setter)</span><br />
                <span style={{ color: C.cyan }}>@functools.lru_cache(maxsize=128)</span><br />
                <span style={{ color: C.orange }}>@dataclass  (auto __init__/__repr__)</span><br />
                <span style={{ color: C.purple }}>@app.route  (Flask/Django)</span>
              </code>
            </Card>
          </>
        )}
        {topic === "context" && (
          <>
            <Card title="Context Manager Protocol" color={C.purple}>
              Implement <code style={{ color: C.cyan }}>__enter__</code> and <code style={{ color: C.yellow }}>__exit__</code>. The <code>with</code> statement calls <code>__enter__</code>, runs the body, then <b>always</b> calls <code>__exit__</code> — even if an exception occurs. Perfect for files, locks, DB connections.
            </Card>
            <Card title="contextlib helpers" color={C.cyan}>
              <code style={{ fontSize: 10, lineHeight: 2, display: "block" }}>
                <span style={{ color: C.green }}>@contextmanager — generator-based</span><br />
                <span style={{ color: C.yellow }}>contextlib.suppress(Exception)</span><br />
                <span style={{ color: C.cyan }}>contextlib.redirect_stdout</span><br />
                <span style={{ color: C.orange }}>ExitStack — dynamic context mgrs</span>
              </code>
            </Card>
          </>
        )}
        <LogBox logs={logs} h={130} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 7. SKLEARN — Pipeline & Model Selection
// ═════════════════════════════════════════════════════════════════════════════
function SklearnViz() {
  const [stage, setStage] = useState(0);
  const canvasRef = useRef(null);
  const W = 480, H = 320;

  const PIPELINE = [
    { name: "StandardScaler", type: "Transformer", in: "(n,3)", out: "(n,3) scaled", color: C.orange },
    { name: "PCA(n=2)", type: "Transformer", in: "(n,3)", out: "(n,2) reduced", color: C.yellow },
    { name: "LogisticRegression", type: "Estimator", in: "(n,2)", out: "predictions", color: C.cyan },
  ];

  const METHODS = ["fit_transform", "fit_transform", "fit + predict"];
  const CV_FOLDS = 5;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    const bw = 120, bh = 54, gap = 44;
    const totalW = PIPELINE.length * bw + (PIPELINE.length - 1) * gap;
    const startX = (W - totalW) / 2;
    const y = 90;

    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText("sklearn Pipeline(steps=[...])", W / 2, 22);

    PIPELINE.forEach((step, i) => {
      const x = startX + i * (bw + gap);
      const active = i <= stage;
      ctx.fillStyle = active ? step.color + "25" : "rgba(255,255,255,0.03)";
      ctx.strokeStyle = active ? step.color : "rgba(255,255,255,0.15)";
      ctx.lineWidth = active ? 2.5 : 1;
      if (active) { ctx.shadowColor = step.color; ctx.shadowBlur = 12; }
      ctx.beginPath(); ctx.roundRect(x, y, bw, bh, 8); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;

      ctx.fillStyle = active ? step.color : C.dim;
      ctx.font = `bold 11px monospace`; ctx.textAlign = "center";
      ctx.fillText(step.name, x + bw / 2, y + 18);
      ctx.fillStyle = active ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)";
      ctx.font = "9px monospace";
      ctx.fillText(step.type, x + bw / 2, y + 31);
      ctx.fillText(METHODS[i], x + bw / 2, y + 44);

      // Arrow
      if (i < PIPELINE.length - 1) {
        const ax = x + bw + 4, ay = y + bh / 2;
        ctx.strokeStyle = active && i < stage ? step.color : "rgba(255,255,255,0.15)";
        ctx.lineWidth = 1.5; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + gap - 8, ay); ctx.stroke();
        ctx.fillStyle = active && i < stage ? PIPELINE[i + 1].color : "rgba(255,255,255,0.15)";
        ctx.beginPath(); ctx.moveTo(ax + gap - 4, ay); ctx.lineTo(ax + gap - 12, ay - 5); ctx.lineTo(ax + gap - 12, ay + 5); ctx.closePath(); ctx.fill();
      }

      // I/O labels
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "9px monospace";
      ctx.fillText(`in: ${step.in}`, x + bw / 2, y - 8);
      ctx.fillText(`out: ${step.out}`, x + bw / 2, y + bh + 12);
    });

    // Cross-validation diagram
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText(`${CV_FOLDS}-Fold Cross Validation`, W / 2, y + bh + 50);

    const foldW = (W - 60) / CV_FOLDS, foldH = 22, fy = y + bh + 62;
    for (let f = 0; f < CV_FOLDS; f++) {
      const isVal = f === stage % CV_FOLDS;
      ctx.fillStyle = isVal ? C.red + "55" : C.green + "30";
      ctx.strokeStyle = isVal ? C.red : C.green + "80";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(30 + f * foldW, fy, foldW - 3, foldH, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = isVal ? C.red : C.green;
      ctx.font = "9px monospace";
      ctx.fillText(isVal ? "VAL" : "TR", 30 + f * foldW + foldW / 2, fy + 14);
    }

    // Metrics
    const scores = [0.88, 0.91, 0.86, 0.93, 0.89];
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    ctx.fillStyle = C.green; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText(`CV scores: [${scores.join(", ")}]  →  mean = ${mean.toFixed(3)} ± 0.025`, W / 2, H - 12);
    ctx.textAlign = "left";
  }, [stage]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <canvas ref={canvasRef} width={W} height={H}
          style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg }} />
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <Btn onClick={() => setStage(0)} color={C.red + "99"}>↺</Btn>
          {PIPELINE.map((s, i) => (
            <Btn key={i} onClick={() => setStage(i)} color={stage === i ? s.color : "rgba(255,255,255,0.08)"}>
              {i + 1}. {s.name.split("(")[0]}
            </Btn>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card title="sklearn Pipeline" color={C.cyan}>
          Pipeline chains transformers and an estimator. <code>fit(X_train)</code> calls each step's <code>fit_transform</code> then final <code>fit</code>. <code>predict(X_test)</code> calls <code>transform</code> through each step then final <code>predict</code>. <b>Prevents data leakage.</b>
        </Card>
        <Card title="GridSearchCV + Cross-Val" color={C.yellow}>
          <code style={{ fontSize: 10, lineHeight: 1.9, display: "block" }}>
            <span style={{ color: C.yellow }}>GridSearchCV(pipeline, params, cv=5)</span><br />
            <span style={{ color: C.cyan }}>param_grid = {`{'model__C': [0.1,1,10]}`}</span><br />
            <span style={{ color: C.green }}>best_params_, best_score_, cv_results_</span>
          </code>
        </Card>
        <Card title="Key sklearn modules" color={C.green}>
          <code style={{ fontSize: 10, lineHeight: 1.9, display: "block" }}>
            <span style={{ color: C.cyan }}>sklearn.preprocessing — scalers/encoders</span><br />
            <span style={{ color: C.yellow }}>sklearn.model_selection — train_test_split, CV</span><br />
            <span style={{ color: C.green }}>sklearn.metrics — accuracy, f1, roc_auc</span><br />
            <span style={{ color: C.orange }}>sklearn.feature_selection — RFE, SelectKBest</span><br />
            <span style={{ color: C.purple }}>sklearn.impute — SimpleImputer, KNNImputer</span>
          </code>
        </Card>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 8. OOP — Classes, Inheritance, Dunder Methods
// ═════════════════════════════════════════════════════════════════════════════
function OOPViz() {
  const [view, setView] = useState("class");
  const [step, setStep] = useState(0);
  const [logs, addLog, clearLog] = useLog();

  const CLASS_STEPS = [
    { label: "Define class", code: "class Animal:\n    species = \"unknown\"  # class attr\n    def __init__(self, name, sound):\n        self.name = name  # instance attr\n        self.sound = sound", mem: { "Animal.species": "unknown", "self.name": "—", "self.sound": "—" }, color: C.cyan },
    { label: "Instantiate", code: `dog = Animal("Rex", "Woof")\n# calls __new__ then __init__`, mem: { "id(dog)": "0x7f2a", "dog.name": "Rex", "dog.sound": "Woof", "dog.__class__": "Animal" }, color: C.yellow },
    { label: "Inheritance", code: "class Dog(Animal):\n    def speak(self):\n        return f\"{self.name}: {self.sound}!\"\n    def __repr__(self):\n        return f\"Dog({self.name})\"", mem: { "Dog.__mro__": "[Dog, Animal, object]", "Dog.speak": "method" }, color: C.green },
    { label: "Dunder methods", code: "class Vector:\n    def __init__(self, x, y): ...\n    def __add__(self, o): return Vector(self.x+o.x, self.y+o.y)\n    def __len__(self): return 2\n    def __repr__(self): return f\"V({self.x},{self.y})\"", mem: { "v1+v2": "__add__", "len(v)": "__len__", "str(v)": "__repr__" }, color: C.purple },
  ];

  useEffect(() => {
    clearLog();
    const s = CLASS_STEPS[step];
    addLog(s.label, s.color);
    Object.entries(s.mem).forEach(([k, v]) => addLog(`  ${k} = ${v}`, C.dim));
  }, [step, view]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {CLASS_STEPS.map((s, i) => (
            <Btn key={i} onClick={() => setStep(i)} color={step === i ? s.color : "rgba(255,255,255,0.08)"}>
              {i + 1}. {s.label.split(" ")[0]}
            </Btn>
          ))}
        </div>
        <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 10, border: `1px solid ${C.border}`, padding: 16, marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: CLASS_STEPS[step].color, fontFamily: "monospace", fontWeight: 700, marginBottom: 10 }}>
            {CLASS_STEPS[step].label}
          </div>
          <pre style={{ margin: 0, fontSize: 12, color: C.white, fontFamily: "monospace", background: "rgba(0,0,0,0.3)", padding: 12, borderRadius: 6, overflow: "auto", whiteSpace: "pre-wrap" }}>
            {CLASS_STEPS[step].code}
          </pre>
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(CLASS_STEPS[step].mem).map(([k, v]) => (
              <div key={k} style={{ padding: "4px 10px", background: CLASS_STEPS[step].color + "18", border: `1px solid ${CLASS_STEPS[step].color}40`, borderRadius: 6, fontFamily: "monospace", fontSize: 11 }}>
                <span style={{ color: C.dim }}>{k}</span>
                <span style={{ color: CLASS_STEPS[step].color }}> = {v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card title="Python Object Model" color={C.cyan}>
          Every object has <code style={{ color: C.yellow }}>__dict__</code> (instance attrs) and a pointer to its <code style={{ color: C.cyan }}>__class__</code>. Attribute lookup follows the <b>MRO chain</b>: instance → class → parent → object.
        </Card>
        <Card title="Key dunder methods" color={C.yellow}>
          <code style={{ fontSize: 10, lineHeight: 1.9, display: "block" }}>
            <span style={{ color: C.cyan }}>__init__, __new__, __del__</span><br />
            <span style={{ color: C.yellow }}>__str__, __repr__, __format__</span><br />
            <span style={{ color: C.green }}>__add__, __mul__, __eq__, __lt__</span><br />
            <span style={{ color: C.orange }}>__len__, __iter__, __getitem__</span><br />
            <span style={{ color: C.purple }}>__enter__, __exit__  (context mgr)</span>
          </code>
        </Card>
        <Card title="@dataclass and Pydantic" color={C.green}>
          <code style={{ color: C.green }}>@dataclass</code> auto-generates <code>__init__</code>, <code>__repr__</code>, <code>__eq__</code> from type-annotated fields. <b>Pydantic</b> adds runtime validation — essential for ML configs and API schemas.
        </Card>
        <LogBox logs={logs} h={110} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// 9. DATA STRUCTURES — lists, dicts, sets, tuples memory layout
// ═════════════════════════════════════════════════════════════════════════════
function DataStructuresViz() {
  const [ds, setDs] = useState("list");
  const canvasRef = useRef(null);
  const W = 480, H = 310;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);

    if (ds === "list") drawList(ctx);
    else if (ds === "dict") drawDict(ctx);
    else if (ds === "set") drawSet(ctx);
    else drawTuple(ctx);
  }, [ds]);

  function drawList(ctx) {
    const data = [42, "hello", 3.14, True, [1, 2]];
    const vals = [42, '"hello"', "3.14", "True", "[1,2]"];
    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("list — dynamic array of PyObject* pointers", 20, 22);

    const CW = 70, CH = 42, py = 45;
    vals.forEach((v, i) => {
      const x = 20 + i * (CW + 8);
      ctx.fillStyle = C.cyan + "25"; ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(x, py, CW, CH, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.cyan; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
      ctx.fillText(v, x + CW / 2, py + 18);
      ctx.fillStyle = C.dim; ctx.font = "9px monospace";
      ctx.fillText(`ptr[${i}]`, x + CW / 2, py + 32);
      // Arrow to object
      const oy = py + CH + 20;
      ctx.strokeStyle = C.dim; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x + CW / 2, py + CH); ctx.lineTo(x + CW / 2, oy); ctx.stroke();
      ctx.setLineDash([]);
      const types = ["int", "str", "float", "bool", "list"];
      ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x + 2, oy, CW - 4, 32, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "9px monospace";
      ctx.fillText(types[i], x + CW / 2, oy + 14);
      ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.fillText("PyObject", x + CW / 2, oy + 25);
      ctx.textAlign = "left";
    });

    ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = "10px monospace";
    ctx.fillText("✓ Dynamic resize: doubles capacity when full (amortized O(1) append)", 20, H - 54);
    ctx.fillText("✓ Heterogeneous: each slot is a pointer to any PyObject", 20, H - 38);
    ctx.fillStyle = C.red; ctx.fillText("✗ O(n) insert/delete in middle, O(n) search", 20, H - 22);
    ctx.fillStyle = C.green; ctx.fillText("✓ O(1) index access, O(1) append", 280, H - 22);
  }

  function drawDict(ctx) {
    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("dict — hash table (open addressing since CPython 3.6+)", 20, 22);

    const entries = [["name", "Alice"], ["age", 30], ["dept", "Eng"]];
    const buckets = 8;
    const CW = 52, CH = 36, px = 20, py = 38;

    // Hash table
    ctx.fillStyle = C.dim; ctx.font = "9px monospace"; ctx.textAlign = "center";
    ctx.fillText("Hash Table (8 slots)", px + buckets * (CW / 2), py - 6);
    for (let i = 0; i < buckets; i++) {
      const entry = entries.find(([k]) => (k.split("").reduce((h, c) => h * 31 + c.charCodeAt(0), 5381)) % buckets === i);
      ctx.fillStyle = entry ? C.yellow + "25" : "rgba(255,255,255,0.04)";
      ctx.strokeStyle = entry ? C.yellow : "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(px + i * (CW + 2), py, CW, CH, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = entry ? C.yellow : C.dim; ctx.font = entry ? "bold 9px monospace" : "9px monospace";
      ctx.fillText(entry ? entry[0] : "empty", px + i * (CW + 2) + CW / 2, py + 14);
      if (entry) { ctx.fillStyle = C.green; ctx.fillText(entry[1], px + i * (CW + 2) + CW / 2, py + 27); }
    }
    ctx.textAlign = "left";

    // Lookup animation
    const ky = py + CH + 28;
    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("Lookup: d['age']  →  hash('age') % 8  =  slot", 20, ky);
    const hashVal = "age".split("").reduce((h, c) => h * 31 + c.charCodeAt(0), 5381) % 8;
    const sx = px + hashVal * (CW + 2) + CW / 2;
    ctx.strokeStyle = C.cyan + "60"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(100, ky + 10); ctx.lineTo(sx, py + CH + 5); ctx.stroke();
    ctx.fillStyle = C.cyan; ctx.font = "bold 11px monospace";
    ctx.fillText(` ${hashVal} → "30"  O(1)!`, 228, ky);

    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "10px monospace";
    ctx.fillText("✓ O(1) avg get/set/delete   ✓ Ordered (insertion order) since Py 3.7", 20, H - 38);
    ctx.fillStyle = C.red; ctx.fillText("✗ O(n) worst case on hash collision", 20, H - 22);
    ctx.fillStyle = C.green; ctx.fillText("✓ Compact dict uses less memory", 280, H - 22);
  }

  function drawSet(ctx) {
    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("set — hash set (dict without values)", 20, 22);

    const setA = [1, 2, 3, 4, 5], setB = [3, 4, 5, 6, 7];
    const radius = 80, cx1 = 140, cx2 = 240, cy = 150;
    const overlap = (cx1 + cx2) / 2;

    // Venn
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = C.cyan;
    ctx.beginPath(); ctx.arc(cx1, cy, radius, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.yellow;
    ctx.beginPath(); ctx.arc(cx2, cy, radius, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    ctx.strokeStyle = C.cyan; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx1, cy, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.yellow;
    ctx.beginPath(); ctx.arc(cx2, cy, radius, 0, Math.PI * 2); ctx.stroke();

    ctx.fillStyle = "white"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
    ctx.fillText("A", cx1 - 35, cy); ctx.fillText("B", cx2 + 35, cy);
    ctx.fillText("{1,2}", cx1 - 35, cy + 16); ctx.fillText("{6,7}", cx2 + 35, cy + 16);
    ctx.fillStyle = C.green; ctx.fillText("{3,4,5}", overlap, cy + 4);
    ctx.fillStyle = C.dim; ctx.font = "9px monospace"; ctx.fillText("A∩B", overlap, cy + 16);

    const rx = 340, ry = 55;
    ctx.textAlign = "left";
    const ops = [
      { op: "A | B (union)", result: "{1,2,3,4,5,6,7}", color: C.cyan },
      { op: "A & B (intersection)", result: "{3,4,5}", color: C.green },
      { op: "A - B (difference)", result: "{1,2}", color: C.yellow },
      { op: "A ^ B (sym. diff)", result: "{1,2,6,7}", color: C.orange },
    ];
    ops.forEach((o, i) => {
      ctx.fillStyle = o.color; ctx.font = "10px monospace";
      ctx.fillText(o.op, rx, ry + i * 38);
      ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "bold 10px monospace";
      ctx.fillText(o.result, rx, ry + i * 38 + 14);
    });

    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "10px monospace"; ctx.textAlign = "center";
    ctx.fillText("O(1) avg add/remove/contains  |  O(n) union/intersection", W / 2, H - 12);
    ctx.textAlign = "left";
  }

  function drawTuple(ctx) {
    ctx.fillStyle = C.dim; ctx.font = "11px monospace";
    ctx.fillText("tuple — immutable sequence (fixed-size PyObject array)", 20, 22);

    const vals = ["Alice", 30, "Eng", 90000];
    const CW = 88, CH = 45, py = 50;

    ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(18, py - 4, vals.length * (CW + 6) + 4, CH + 8, 6); ctx.fill(); ctx.stroke();

    vals.forEach((v, i) => {
      const x = 22 + i * (CW + 6);
      ctx.fillStyle = C.purple + "25"; ctx.strokeStyle = C.purple + "60"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x, py, CW, CH, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.purple; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
      ctx.fillText(typeof v === "string" ? `"${v}"` : String(v), x + CW / 2, py + 18);
      ctx.fillStyle = C.dim; ctx.font = "9px monospace";
      ctx.fillText(`[${i}]`, x + CW / 2, py + 32);
    });
    ctx.textAlign = "left";

    // Named tuple
    const ny = py + CH + 45;
    ctx.fillStyle = C.yellow; ctx.font = "bold 11px monospace";
    ctx.fillText("Named Tuple:", 22, ny);
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "11px monospace";
    ctx.fillText('Employee = namedtuple("Employee", ["name","age","dept","salary"])', 22, ny + 16);
    ctx.fillText('e = Employee("Alice", 30, "Eng", 90000)', 22, ny + 32);
    ctx.fillStyle = C.green; ctx.font = "bold 10px monospace";
    ctx.fillText('e.name → "Alice"   e[0] → "Alice"   e._asdict() → {...}', 22, ny + 48);

    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "10px monospace";
    ctx.fillText("✓ Immutable = hashable = usable as dict key / set member", 22, H - 38);
    ctx.fillText("✓ ~20% smaller memory than list  ✓ O(1) index  ✓ Destructuring", 22, H - 22);
  }

  const dsConf = { list: C.cyan, dict: C.yellow, set: C.orange, tuple: C.purple };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {Object.entries(dsConf).map(([k, col]) => (
            <Btn key={k} onClick={() => setDs(k)} color={ds === k ? col : "rgba(255,255,255,0.08)"}>
              {k}
            </Btn>
          ))}
        </div>
        <canvas ref={canvasRef} width={W} height={H}
          style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Card title="Complexity Cheat Sheet" color={C.cyan}>
          <code style={{ fontSize: 10, lineHeight: 1.9, display: "block" }}>
            <span style={{ color: C.cyan }}>list:  append O(1)  insert O(n)  index O(1)</span><br />
            <span style={{ color: C.yellow }}>dict:  get/set O(1) avg  O(n) worst</span><br />
            <span style={{ color: C.orange }}>set:   add/contains O(1) avg</span><br />
            <span style={{ color: C.purple }}>tuple: index O(1)  immutable</span><br />
            <span style={{ color: C.green }}>deque: append/pop both ends O(1)</span>
          </code>
        </Card>
        <Card title="When to use what" color={C.yellow}>
          <b style={{ color: C.cyan }}>list</b> — ordered, needs mutability<br />
          <b style={{ color: C.yellow }}>dict</b> — fast lookup by key<br />
          <b style={{ color: C.orange }}>set</b> — deduplication, membership test<br />
          <b style={{ color: C.purple }}>tuple</b> — immutable record, dict key<br />
          <b style={{ color: C.green }}>deque</b> — queue/stack needing O(1) both ends
        </Card>
        <Card title="Collections module" color={C.green}>
          <code style={{ fontSize: 10, lineHeight: 1.9, display: "block" }}>
            <span style={{ color: C.green }}>Counter(words)  — word frequency</span><br />
            <span style={{ color: C.cyan }}>defaultdict(list)  — auto-init values</span><br />
            <span style={{ color: C.yellow }}>OrderedDict  — ordered before Py3.7</span><br />
            <span style={{ color: C.orange }}>deque(maxlen=100)  — sliding window</span>
          </code>
        </Card>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION DEFINITIONS + MAIN EXPORT
// ═════════════════════════════════════════════════════════════════════════════
const SECTIONS = [
  { id: "forloop",   icon: "🔄", label: "For Loop",           tag: "Fundamentals",  component: ForLoopViz },
  { id: "functions", icon: "📦", label: "Functions & Scope",   tag: "Fundamentals",  component: FunctionViz },
  { id: "ds",        icon: "🗂️", label: "Data Structures",     tag: "Fundamentals",  component: DataStructuresViz },
  { id: "oop",       icon: "🏗️", label: "OOP & Classes",       tag: "Fundamentals",  component: OOPViz },
  { id: "advanced",  icon: "⚡", label: "Gen/Dec/Context",      tag: "Advanced",      component: AdvancedPythonViz },
  { id: "numpy",     icon: "🔢", label: "NumPy",               tag: "Library",       component: NumpyViz },
  { id: "pandas",    icon: "🐼", label: "Pandas",              tag: "Library",       component: PandasViz },
  { id: "matplotlib",icon: "📊", label: "Matplotlib",          tag: "Library",       component: MatplotlibViz },
  { id: "sklearn",   icon: "🤖", label: "Scikit-learn",        tag: "Library",       component: SklearnViz },
];

const TAG_COLORS = {
  Fundamentals: C.cyan,
  Advanced: C.purple,
  Library: C.orange,
};

export default function PythonVisuals() {
  const [active, setActive] = useState("forloop");
  const ActiveComp = SECTIONS.find(s => s.id === active)?.component;
  const activeSection = SECTIONS.find(s => s.id === active);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Courier New', monospace", color: "white" }}>
      <style>{`
        @keyframes pyFadeIn { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:rgba(255,255,255,0.04); }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.18); border-radius:2px; }
      `}</style>

      {/* Header */}
      <div style={{ padding: "14px 24px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 26 }}>🐍</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, background: "linear-gradient(90deg,#ffd43b,#00d9ff,#00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Python Visual Reference
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              See inside Python & its major libraries — animated memory models
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {["Fundamentals", "Advanced", "Library"].map(t => (
              <span key={t} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: TAG_COLORS[t] + "20", border: `1px solid ${TAG_COLORS[t]}40`, color: TAG_COLORS[t], fontFamily: "monospace" }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 10, flexWrap: "wrap" }}>
          {SECTIONS.map(sec => (
            <button key={sec.id} onClick={() => setActive(sec.id)} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
              border: `1px solid ${active === sec.id ? TAG_COLORS[sec.tag] : "rgba(255,255,255,0.09)"}`,
              borderRadius: 8, background: active === sec.id ? TAG_COLORS[sec.tag] + "18" : "rgba(255,255,255,0.02)",
              color: active === sec.id ? TAG_COLORS[sec.tag] : "rgba(255,255,255,0.5)",
              cursor: "pointer", fontSize: 11, fontWeight: active === sec.id ? 700 : 400,
              whiteSpace: "nowrap", transition: "all 0.2s", fontFamily: "monospace"
            }}>
              <span>{sec.icon}</span><span>{sec.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        {ActiveComp && <ActiveComp key={active} />}
      </div>
    </div>
  );
}