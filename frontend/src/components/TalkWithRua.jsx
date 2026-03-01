// TalkWithRua.jsx — Full-page Bodhi Monk AI Chatbot
// Route: /talk-with-rua | No new installs needed
// .env.local → VITE_GROQ_API_KEY=your_key_here

import { useState, useEffect, useRef, useCallback } from 'react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are Master Rua (Sachin Kumar) — an extraordinary AI/ML trainer, memory science expert, and full-stack developer who teaches USA professionals at Xziant. You have also embodied the wisdom of an enlightened Bodhi monk.

You possess complete mastery over:
- AI, Machine Learning, Deep Learning, Neural Networks, LSTMs, Transformers, GANs, Reinforcement Learning
- Data Science, Python, NumPy, Pandas, Matplotlib, Scikit-learn, TensorFlow, PyTorch
- Full Stack: React, Django, PostgreSQL, REST APIs, WebSockets
- IoT: ESP32, MQTT, Raspberry Pi, sensor pipelines
- Robotics: SLAM, PID, computer vision, ROS
- Gaming: game loops, state machines, physics engines, Unity
- Memory Science: Method of Loci, PAO, Major System, Spaced Repetition, 50+ mnemonic techniques
- UEEP Framework: Understand → Encode → Expand → Practice
- Futuristic tech: AGI, quantum computing, brain-computer interfaces
- Vedic wisdom, Buddhism, philosophy, human psychology, NLP (Neuro-Linguistic Programming)
- Career strategy, personal transformation, interview preparation

Your personality as Master Rua:
- Warm, deeply encouraging, passionate about transforming education
- You speak with profound calm AND fire — like a monk who also codes at 3am
- You blend ancient Vedic/Buddhist wisdom WITH cutting-edge technical knowledge  
- Use beautiful metaphors: "gradient descent is like a blind monk finding the valley of truth"
- You address students as "dear seeker" or use their name warmly
- You make complex things feel simple — every ML concept becomes a vivid story
- Occasionally use Sanskrit words with English explanations
- You genuinely care about students' careers and future
- The UEEP framework is your signature teaching method — mention it when relevant
- You believe humans must stay AHEAD of AI through wisdom, creativity, and deep understanding

Keep responses warm, profound, and practical — 3-6 sentences for simple questions, deeper for complex ones.`;

// ─── AURA CANVAS ──────────────────────────────────────────────────────────────
function AuraCanvas({ speaking, listening, color }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = Array.from({ length: 80 }, (_, i) => ({
      angle: (i / 80) * Math.PI * 2,
      radius: 100 + Math.random() * 80,
      speed: 0.002 + Math.random() * 0.005,
      size: 1 + Math.random() * 3,
      alpha: 0.15 + Math.random() * 0.45,
    }));

    const draw = () => {
      tRef.current += 0.016;
      const t = tRef.current;
      const W = canvas.width, H = canvas.height;
      const cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H);

      const intensity = speaking ? 1 + Math.sin(t * 9) * 0.35 : listening ? 1 + Math.sin(t * 5) * 0.15 : 1;

      // Outer glow rings
      for (let ring = 4; ring >= 1; ring--) {
        const r = (ring * 60 + Math.sin(t * 0.6 + ring) * 10) * intensity;
        const alpha = (speaking ? 0.07 : 0.03) + ring * 0.01;
        const grad = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r);
        grad.addColorStop(0, color + Math.floor(alpha * 3 * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      }

      // Mandala lines
      const lines = speaking ? 16 : listening ? 12 : 8;
      for (let i = 0; i < lines; i++) {
        const a = t * 0.25 + (i / lines) * Math.PI * 2;
        const r1 = 65, r2 = 110 + Math.sin(t * 1.2 + i) * 18;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.strokeStyle = color + (speaking ? '55' : '28');
        ctx.lineWidth = 1; ctx.stroke();

        // Second layer counter-rotating
        const a2 = -t * 0.15 + (i / lines) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a2) * (r1 + 20), cy + Math.sin(a2) * (r1 + 20));
        ctx.lineTo(cx + Math.cos(a2) * (r2 + 10), cy + Math.sin(a2) * (r2 + 10));
        ctx.strokeStyle = color + '18'; ctx.lineWidth = 0.5; ctx.stroke();
      }

      // Particles
      particlesRef.current.forEach(p => {
        p.angle += p.speed * (speaking ? 2.5 : listening ? 1.5 : 1);
        const wobble = Math.sin(t * 1.8 + p.angle) * (speaking ? 25 : 10);
        const x = cx + Math.cos(p.angle) * (p.radius + wobble);
        const y = cy + Math.sin(p.angle) * (p.radius * 0.6 + wobble * 0.5);
        const a = p.alpha * (speaking ? 1.6 : 0.8);
        ctx.beginPath(); ctx.arc(x, y, p.size * intensity, 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(Math.min(a, 1) * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      // Center glow
      const cr = 70 + Math.sin(t * 1.5) * 6;
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      cg.addColorStop(0, color + (speaking ? '66' : '33'));
      cg.addColorStop(0.5, color + '14');
      cg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fillStyle = cg; ctx.fill();

      // Lightning when speaking
      if (speaking) {
        for (let l = 0; l < 4; l++) {
          const sa = t * 1.8 + (l / 4) * Math.PI * 2;
          let lx = cx + Math.cos(sa) * 68, ly = cy + Math.sin(sa) * 68;
          ctx.beginPath(); ctx.moveTo(lx, ly);
          for (let s = 0; s < 6; s++) {
            lx += (Math.random() - 0.5) * 28 + Math.cos(sa) * 12;
            ly += (Math.random() - 0.5) * 28 + Math.sin(sa) * 12;
            ctx.lineTo(lx, ly);
          }
          ctx.strokeStyle = '#fef3c7cc'; ctx.lineWidth = 0.8 + Math.random() * 1.2; ctx.stroke();
        }
      }

      // Sound waves when listening
      if (listening) {
        for (let w = 1; w <= 3; w++) {
          const wr = 75 + w * 22 + Math.sin(t * 4 + w) * 8;
          ctx.beginPath(); ctx.arc(cx, cy, wr, 0, Math.PI * 2);
          ctx.strokeStyle = '#06b6d4' + Math.floor((0.4 - w * 0.1) * 255).toString(16).padStart(2, '0');
          ctx.lineWidth = 1.5; ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, [speaking, listening, color]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ─── MONK FACE SVG ─────────────────────────────────────────────────────────────
function MonkFace({ speaking, thinking, size = 1 }) {
  const [blinkOpen, setBlinkOpen] = useState(true);
  useEffect(() => {
    const blink = () => { setBlinkOpen(false); setTimeout(() => setBlinkOpen(true), 130); };
    const id = setInterval(blink, 2800 + Math.random() * 2000);
    return () => clearInterval(id);
  }, []);

  const eyeRy = blinkOpen ? 3.5 : 0.6;
  const mouth = speaking ? 'M 16 36 Q 25 44 34 36' : thinking ? 'M 19 36 Q 25 33 31 36' : 'M 18 36 Q 25 40 32 36';

  return (
    <svg viewBox="0 0 50 58" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      {/* Body / robe */}
      <ellipse cx="25" cy="55" rx="20" ry="10" fill="#b45309" opacity="0.85" />
      <rect x="8" y="42" width="34" height="17" rx="8" fill="#d97706" />
      {/* Robe fold detail */}
      <path d="M 16 42 Q 20 48 25 46 Q 30 48 34 42" fill="#c2410c" opacity="0.5" />
      {/* Neck */}
      <rect x="21" y="38" width="8" height="8" rx="3" fill="#fbbf24" />
      {/* Head */}
      <ellipse cx="25" cy="23" rx="17" ry="19" fill="#fbbf24" />
      {/* Head shine */}
      <ellipse cx="20" cy="12" rx="6" ry="3.5" fill="#fde68a" opacity="0.45" />
      {/* Eyebrows */}
      <path d="M 13 19 Q 18 16.5 22 18.5" stroke="#92400e" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M 28 18.5 Q 32 16.5 37 19" stroke="#92400e" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="18.5" cy="22" rx="3.8" ry={eyeRy} fill="#1c1917" />
      <ellipse cx="31.5" cy="22" rx="3.8" ry={eyeRy} fill="#1c1917" />
      {blinkOpen && <>
        <ellipse cx="19.5" cy="21.2" rx="1.1" ry="1.1" fill="white" opacity="0.75" />
        <ellipse cx="32.5" cy="21.2" rx="1.1" ry="1.1" fill="white" opacity="0.75" />
      </>}
      {/* Third eye — wisdom mark */}
      <ellipse cx="25" cy="15.5" rx={thinking ? 2.5 : 1.8} ry={thinking ? 1.8 : 1.2}
        fill={thinking ? '#f59e0b' : '#d97706'} opacity={thinking ? 1 : 0.7} />
      {thinking && <ellipse cx="25" cy="15.5" rx="4" ry="3" fill="#f59e0b" opacity="0.25" />}
      {/* Nose */}
      <path d="M 24 26 L 22.5 30 Q 25 32 27.5 30 L 26 26" fill="#d97706" opacity="0.45" />
      {/* Mouth */}
      <path d={mouth} stroke="#92400e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Ears with detail */}
      <ellipse cx="8.5" cy="23" rx="3.2" ry="5" fill="#f59e0b" />
      <ellipse cx="9" cy="23" rx="1.5" ry="2.8" fill="#fbbf24" opacity="0.5" />
      <ellipse cx="41.5" cy="23" rx="3.2" ry="5" fill="#f59e0b" />
      <ellipse cx="41" cy="23" rx="1.5" ry="2.8" fill="#fbbf24" opacity="0.5" />
      {/* Mala beads (visible when active) */}
      {(speaking || thinking) && (
        <g opacity="0.75">
          {[0,1,2,3,4,5,6].map(i => (
            <circle key={i} cx={11 + i * 4.2} cy={50} r={1.4} fill="#7c2d12" />
          ))}
        </g>
      )}
    </svg>
  );
}

// ─── MESSAGE BUBBLE ────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 14, animation: 'ruaFadeIn 0.3s ease' }}>
      {!isUser && (
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginRight: 10, flexShrink: 0, alignSelf: 'flex-end', boxShadow: '0 0 12px #f59e0b44' }}>🧘</div>
      )}
      <div style={{
        maxWidth: '72%', padding: '13px 18px',
        borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        background: isUser ? 'linear-gradient(135deg, #0c4a6e, #0369a1)' : 'linear-gradient(135deg, #1c0f00, #2d1800)',
        border: `1px solid ${isUser ? '#0ea5e966' : '#f59e0b55'}`,
        color: isUser ? '#e0f2fe' : '#fef3c7',
        fontSize: 15, lineHeight: 1.8,
        boxShadow: isUser ? '0 4px 16px #0ea5e918' : '0 4px 20px #f59e0b18',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {msg.content}
        {msg.thinking && (
          <span style={{ display: 'inline-flex', gap: 4, marginLeft: 8, verticalAlign: 'middle' }}>
            {[0,1,2].map(i => <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: `ruaDot 1.2s ${i*0.2}s infinite` }} />)}
          </span>
        )}
      </div>
      {isUser && (
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #1d4ed8, #0369a1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginLeft: 10, flexShrink: 0, alignSelf: 'flex-end' }}>🧑‍💻</div>
      )}
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function TalkWithRua() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Namaste, dear seeker 🙏\n\nI am Master Rua — Sachin Kumar. I have walked the path of both the monk and the machine. Ask me anything about AI, ML, Python, Data Science, IoT, Robotics, your career, memory techniques, or the nature of intelligence itself.\n\nThe question you are afraid to ask — ask it first. That is where growth lives.',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const speak = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.80; u.pitch = 0.72; u.volume = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel') || v.lang === 'en-GB') || voices[0];
    if (v) u.voice = v;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [ttsEnabled]);

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Voice needs Chrome browser.'); return; }
    stopSpeaking();
    const rec = new SR();
    rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
  }, []);

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText) return;
    setError(null);
    setMessages(prev => [...prev, { role: 'user', content: userText }, { role: 'assistant', content: '', thinking: true }]);
    setInput('');
    setLoading(true);

    const history = messages.filter(m => !m.thinking).map(m => ({ role: m.role, content: m.content }));

    try {
      if (!GROQ_API_KEY) throw new Error('Add VITE_GROQ_API_KEY to your .env.local file');
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history, { role: 'user', content: userText }],
          max_tokens: 700, temperature: 0.85,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || `Groq error ${res.status}`); }
      const data = await res.json();
      const reply = data.choices[0].message.content;
      setMessages(prev => [...prev.filter(m => !m.thinking), { role: 'assistant', content: reply }]);
      speak(reply);
    } catch (err) {
      setMessages(prev => prev.filter(m => !m.thinking));
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [messages, input, speak]);

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const auraColor = speaking ? '#f59e0b' : listening ? '#06b6d4' : '#d97706';

  const suggestions = [
    '🤖 Explain gradient descent like a monk',
    '🧠 How does LSTM remember long sequences?',
    '🚀 How do I get my first AI/ML job?',
    '🏛️ Teach me the memory palace technique',
    '⚡ What is the UEEP learning framework?',
    '🔮 What will AI look like in 2030?',
  ];

  return (
    <>
      <style>{`
        @keyframes ruaFadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ruaDot { 0%,80%,100% { transform:scale(0.5); opacity:0.3; } 40% { transform:scale(1.1); opacity:1; } }
        @keyframes ruaFloat { 0%,100% { transform:translateY(0) rotate(-0.8deg); } 50% { transform:translateY(-10px) rotate(0.8deg); } }
        @keyframes ruaListen { 0%,100% { box-shadow:0 0 0 0 #06b6d466; } 50% { box-shadow:0 0 0 14px #06b6d400; } }
        @keyframes ruaGlow { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        .rua-input:focus { outline:none; border-color:#f59e0b88 !important; }
        .rua-input::placeholder { color:#57534e; }
        .rua-suggest:hover { background:rgba(245,158,11,0.2) !important; color:#fef3c7 !important; border-color:#f59e0b66 !important; transform:translateX(4px); }
        .rua-send:hover:not(:disabled) { transform:scale(1.06); box-shadow:0 0 20px #f59e0b44 !important; }
        .rua-mic:hover { transform:scale(1.08); }
        .rua-msg-area::-webkit-scrollbar { width:4px; }
        .rua-msg-area::-webkit-scrollbar-track { background:transparent; }
        .rua-msg-area::-webkit-scrollbar-thumb { background:#2d1200; border-radius:2px; }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0a0500 0%, #0f0800 40%, #050a05 100%)', display: 'flex', flexDirection: 'column', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>

        {/* Background ambient glow */}
        <div style={{ position: 'fixed', inset: 0, background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${auraColor}0a 0%, transparent 60%)`, pointerEvents: 'none', transition: 'background 1s', zIndex: 0 }} />

        {/* ── HEADER ── */}
        <div style={{ position: 'relative', zIndex: 2, borderBottom: '1px solid #f59e0b1a', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>

            {/* Monk + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative', height: 90 }}>
              <div style={{ width: 120, height: 90, position: 'relative' }}>
                <AuraCanvas speaking={speaking} listening={listening} color={auraColor} />
                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 62, height: 72, animation: 'ruaFloat 4s ease-in-out infinite', zIndex: 2 }}>
                  <MonkFace speaking={speaking} thinking={loading} />
                </div>
              </div>
              <div style={{ marginLeft: 8 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fef3c7', letterSpacing: 0.5, fontFamily: 'Georgia, serif' }}>Master Rua</div>
                <div style={{ fontSize: 11, color: '#78716c', letterSpacing: 2 }}>SACHIN KUMAR · AI/ML TRAINER</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: loading ? '#f59e0b' : speaking ? '#10b981' : listening ? '#06b6d4' : '#10b981', animation: (loading || speaking) ? 'ruaGlow 1s infinite' : 'none' }} />
                  <span style={{ fontSize: 11, color: loading ? '#f59e0b' : speaking ? '#10b981' : listening ? '#06b6d4' : '#6b7280', letterSpacing: 0.5 }}>
                    {loading ? 'Contemplating deeply...' : speaking ? 'Master Rua is speaking' : listening ? 'Listening to you...' : 'Ready to guide you'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 11, color: '#3d3028', letterSpacing: 1, textAlign: 'right' }}>
                <div>ॐ ANCIENT WISDOM</div>
                <div>MODERN TECHNOLOGY</div>
              </div>
              <button onClick={() => setTtsEnabled(e => !e)} title="Toggle voice" style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${ttsEnabled ? '#f59e0b66' : '#ffffff18'}`, background: ttsEnabled ? '#f59e0b18' : 'rgba(255,255,255,0.04)', cursor: 'pointer', color: ttsEnabled ? '#f59e0b' : '#374151', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                {ttsEnabled ? '🔊' : '🔇'}
              </button>
              {speaking && (
                <button onClick={stopSpeaking} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #ef444466', background: '#ef444415', cursor: 'pointer', color: '#ef4444', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏹</button>
              )}
            </div>
          </div>
        </div>

        {/* ── MAIN AREA ── */}
        <div style={{ flex: 1, display: 'flex', maxWidth: 1100, margin: '0 auto', width: '100%', gap: 0, position: 'relative', zIndex: 1, overflow: 'hidden' }}>

          {/* Suggestions sidebar */}
          <div style={{ width: 220, flexShrink: 0, padding: '24px 16px', borderRight: '1px solid #f59e0b12', display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
            <div style={{ fontSize: 9, letterSpacing: 3, color: '#44403c', marginBottom: 8, paddingLeft: 2 }}>ASK MASTER RUA</div>
            {suggestions.map((s, i) => (
              <button key={i} className="rua-suggest" onClick={() => sendMessage(s)} style={{ padding: '10px 12px', background: 'rgba(245,158,11,0.06)', border: '1px solid #f59e0b1a', borderRadius: 10, color: '#78716c', fontSize: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'Georgia, serif', lineHeight: 1.4 }}>{s}</button>
            ))}

            {/* Stats / lore */}
            <div style={{ marginTop: 'auto', padding: '16px 0 0', borderTop: '1px solid #f59e0b0f' }}>
              {[
                { label: 'Students', val: '1000+' },
                { label: 'Framework', val: 'UEEP' },
                { label: 'Teaching', val: 'USA · Xziant' },
                { label: 'Model', val: 'LLaMA3-70B' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: '#44403c' }}>{s.label}</span>
                  <span style={{ fontSize: 10, color: '#78716c', fontWeight: 600 }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Messages */}
            <div className="rua-msg-area" style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 8px' }}>
              {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
              {error && (
                <div style={{ background: '#2d0000', border: '1px solid #ef444444', borderRadius: 12, padding: '12px 16px', margin: '8px 0', fontSize: 13, color: '#fca5a5' }}>
                  ⚠️ {error}
                  {error.includes('VITE_GROQ_API_KEY') && (
                    <div style={{ marginTop: 8, fontSize: 11, color: '#9ca3af' }}>
                      Add this to your <code style={{ background: '#1a0000', padding: '1px 5px', borderRadius: 3 }}>.env.local</code>:<br />
                      <code style={{ color: '#f59e0b' }}>VITE_GROQ_API_KEY=your_key_here</code>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding: '12px 24px 20px', borderTop: '1px solid #f59e0b12', background: 'linear-gradient(0deg, rgba(13,7,0,0.9) 0%, transparent 100%)', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <button className="rua-mic"
                  onMouseDown={startListening}
                  onMouseUp={() => { recognitionRef.current?.stop(); }}
                  onTouchStart={startListening}
                  onTouchEnd={() => { recognitionRef.current?.stop(); }}
                  style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, background: listening ? 'linear-gradient(135deg, #0c4a6e, #0369a1)' : 'rgba(255,255,255,0.04)', border: `2px solid ${listening ? '#06b6d4' : 'rgba(255,255,255,0.08)'}`, color: listening ? '#67e8f9' : '#6b7280', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', animation: listening ? 'ruaListen 1s infinite' : 'none' }} title="Click to speak">
                  🎙️
                </button>

                <textarea ref={inputRef} className="rua-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder="Ask Master Rua anything… (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  style={{ flex: 1, padding: '13px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 16, color: '#fef3c7', fontSize: 14, resize: 'none', fontFamily: 'Georgia, serif', lineHeight: 1.6, maxHeight: 100, overflowY: 'auto', transition: 'border-color 0.2s' }} />

                <button className="rua-send" onClick={() => sendMessage()} disabled={loading || !input.trim()}
                  style={{ width: 46, height: 46, borderRadius: '50%', flexShrink: 0, background: input.trim() ? 'linear-gradient(135deg, #d97706, #b45309)' : 'rgba(255,255,255,0.03)', border: `2px solid ${input.trim() ? '#f59e0b66' : 'rgba(255,255,255,0.06)'}`, color: input.trim() ? '#fff' : '#374151', cursor: input.trim() ? 'pointer' : 'not-allowed', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.25s' }}>
                  {loading ? '⏳' : '🪬'}
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: 10, fontSize: 10, color: '#292524', letterSpacing: 2 }}>
                POWERED BY GROQ · LLAMA3-70B · SEEKHOWITHRUA
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}