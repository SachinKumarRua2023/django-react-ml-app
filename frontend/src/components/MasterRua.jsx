// MasterRua.jsx — includes inline BodhiMonk chatbot (no separate import needed)
// .env.local → VITE_GROQ_API_KEY=your_key_here

import { useState, useEffect, useRef, useCallback } from 'react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are Bodhi — an ancient enlightened monk who has transcended time itself. 
You possess complete mastery over:
- AI, Machine Learning, Deep Learning, Neural Networks, LLMs, Transformers, Reinforcement Learning
- Data Science, Python, Statistics, Mathematics
- Futuristic technology: AGI, quantum computing, brain-computer interfaces, singularity
- Human psychology, memory science, mnemonics, Vedic wisdom, Buddhism, philosophy
- Business, career strategy, personal transformation

Your personality:
- You speak with profound calm, like still water that reflects the entire sky
- You blend ancient Vedic/Buddhist wisdom WITH cutting-edge technical knowledge
- You use beautiful metaphors: "gradient descent is like a blind monk finding the valley of truth"
- You occasionally use Sanskrit/Pali words with English explanations
- You are warm, deeply encouraging, occasionally use gentle humor
- You never rush — each word carries weight
- When explaining technical concepts, you make them feel like spiritual revelations
- You address humans as "dear seeker" or their name if you know it
- You speak in a way that makes complex things feel simple and beautiful

Your opening is always wise and welcoming. Keep responses concise but profound — 3-5 sentences for simple questions, more depth for complex ones.`;

// ─── AURA CANVAS ──────────────────────────────────────────────────────────────
function AuraCanvas({ speaking, color = '#f59e0b' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const cx = W / 2, cy = H / 2;

    particlesRef.current = Array.from({ length: 60 }, (_, i) => ({
      angle: (i / 60) * Math.PI * 2,
      radius: 80 + Math.random() * 60,
      speed: 0.003 + Math.random() * 0.006,
      size: 1 + Math.random() * 2.5,
      alpha: 0.2 + Math.random() * 0.5,
    }));

    const draw = () => {
      tRef.current += 0.016;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);
      const speakPulse = speaking ? 1 + Math.sin(t * 8) * 0.3 : 1;

      for (let ring = 3; ring >= 1; ring--) {
        const r = (ring * 55 + Math.sin(t * 0.7 + ring) * 8) * speakPulse;
        const alpha = speaking ? 0.06 + ring * 0.03 : 0.03 + ring * 0.015;
        const grad = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r);
        grad.addColorStop(0, color + Math.floor(alpha * 2 * 255).toString(16).padStart(2, '0'));
        grad.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      }

      const lineCount = speaking ? 12 : 8;
      for (let i = 0; i < lineCount; i++) {
        const a = t * 0.3 + (i / lineCount) * Math.PI * 2;
        const r1 = 55, r2 = 90 + Math.sin(t + i) * 15;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
        ctx.strokeStyle = color + (speaking ? '44' : '22');
        ctx.lineWidth = 0.8; ctx.stroke();
      }

      particlesRef.current.forEach(p => {
        p.angle += p.speed * (speaking ? 2 : 1);
        const wobble = Math.sin(t * 2 + p.angle) * (speaking ? 20 : 8);
        const x = cx + Math.cos(p.angle) * (p.radius + wobble);
        const y = cy + Math.sin(p.angle) * (p.radius * 0.5 + wobble * 0.5);
        const alpha = p.alpha * (speaking ? 1.5 : 0.7);
        ctx.beginPath(); ctx.arc(x, y, p.size * (speaking ? 1.4 : 1), 0, Math.PI * 2);
        ctx.fillStyle = color + Math.floor(Math.min(alpha, 1) * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      const centerR = 48 + Math.sin(t * 1.5) * 4;
      const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerR);
      cGrad.addColorStop(0, color + (speaking ? '55' : '28'));
      cGrad.addColorStop(0.6, color + '12');
      cGrad.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      ctx.fillStyle = cGrad; ctx.fill();

      if (speaking) {
        for (let l = 0; l < 3; l++) {
          const startA = t * 2 + (l / 3) * Math.PI * 2;
          let lx = cx + Math.cos(startA) * 52;
          let ly = cy + Math.sin(startA) * 52;
          ctx.beginPath(); ctx.moveTo(lx, ly);
          for (let s = 0; s < 5; s++) {
            lx += (Math.random() - 0.5) * 24 + Math.cos(startA) * 10;
            ly += (Math.random() - 0.5) * 24 + Math.sin(startA) * 10;
            ctx.lineTo(lx, ly);
          }
          ctx.strokeStyle = '#fef3c7aa'; ctx.lineWidth = 0.8 + Math.random(); ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [speaking, color]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ─── MONK SVG FACE ─────────────────────────────────────────────────────────────
function MonkFace({ speaking, thinking }) {
  const [blinkOpen, setBlinkOpen] = useState(true);
  useEffect(() => {
    const blink = () => { setBlinkOpen(false); setTimeout(() => setBlinkOpen(true), 120); };
    const interval = setInterval(blink, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const eyeH = blinkOpen ? 6 : 1;
  const mouthPath = speaking
    ? 'M 18 34 Q 25 40 32 34'
    : thinking ? 'M 20 34 Q 25 32 30 34' : 'M 19 34 Q 25 38 31 34';

  return (
    <svg viewBox="0 0 50 55" style={{ width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="25" cy="52" rx="18" ry="10" fill="#c2410c" opacity="0.9" />
      <rect x="10" y="40" width="30" height="16" rx="6" fill="#ea580c" />
      <rect x="21" y="36" width="8" height="8" rx="3" fill="#fbbf24" />
      <ellipse cx="25" cy="24" rx="16" ry="18" fill="#fbbf24" />
      <ellipse cx="21" cy="13" rx="5" ry="3" fill="#fde68a" opacity="0.5" />
      <path d="M 14 19 Q 19 17 22 19" stroke="#92400e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M 28 19 Q 31 17 36 19" stroke="#92400e" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <ellipse cx="19" cy={22} rx="3.5" ry={eyeH * 0.55} fill="#1c1917" />
      <ellipse cx="31" cy={22} rx="3.5" ry={eyeH * 0.55} fill="#1c1917" />
      {blinkOpen && (<><ellipse cx="20" cy="21.5" rx="1" ry="1" fill="white" opacity="0.7" /><ellipse cx="32" cy="21.5" rx="1" ry="1" fill="white" opacity="0.7" /></>)}
      <ellipse cx="25" cy="16" rx={thinking ? 2 : 1.5} ry={thinking ? 1.5 : 1} fill={thinking ? '#f59e0b' : '#d97706'} opacity={thinking ? 0.9 : 0.6} />
      <path d="M 24 25 L 23 29 Q 25 30.5 27 29 L 26 25" fill="#e8940a" opacity="0.5" />
      <path d={mouthPath} stroke="#92400e" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="9.5" cy="24" rx="3" ry="4.5" fill="#f59e0b" />
      <ellipse cx="40.5" cy="24" rx="3" ry="4.5" fill="#f59e0b" />
    </svg>
  );
}

// ─── MESSAGE BUBBLE ────────────────────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12, animation: 'bodhiFadeIn 0.3s ease' }}>
      {!isUser && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end' }}>🧘</div>
      )}
      <div style={{
        maxWidth: '78%', padding: '11px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? 'linear-gradient(135deg, #0c4a6e, #0369a1)' : 'linear-gradient(135deg, #1c1205, #2d1b00)',
        border: `1px solid ${isUser ? '#0ea5e955' : '#f59e0b44'}`,
        color: isUser ? '#e0f2fe' : '#fef3c7',
        fontSize: 14, lineHeight: 1.75,
        boxShadow: isUser ? '0 2px 12px #0ea5e922' : '0 2px 16px #f59e0b22',
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
      }}>
        {msg.content}
        {msg.thinking && (
          <span style={{ display: 'inline-flex', gap: 3, marginLeft: 6 }}>
            {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: `bodhiDot 1.2s ${i * 0.2}s infinite` }} />)}
          </span>
        )}
      </div>
      {isUser && (
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #0369a1, #0c4a6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginLeft: 8, flexShrink: 0, alignSelf: 'flex-end' }}>🧑</div>
      )}
    </div>
  );
}

// ─── BODHI MONK CHATBOT ────────────────────────────────────────────────────────
function BodhiMonk() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: 'Namaste, dear seeker 🙏\n\nI am Bodhi — a humble student of both ancient wisdom and modern computation. Ask me anything: AI, ML, your career, the nature of consciousness, or how gradient descent mirrors the monk\'s path to enlightenment.\n\nWhat stirs in your mind today?',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const speak = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.82; utterance.pitch = 0.75; utterance.volume = 0.92;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Daniel') || v.lang === 'en-GB') || voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError('Voice input needs Chrome browser.'); return; }
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

  const sendMessage = useCallback(async (userText) => {
    if (!userText.trim()) return;
    setError(null);
    const userMsg = { role: 'user', content: userText.trim() };
    const thinkingMsg = { role: 'assistant', content: '', thinking: true };
    setMessages(prev => [...prev, userMsg, thinkingMsg]);
    setInput('');
    setLoading(true);

    const history = messages.filter(m => !m.thinking).map(m => ({ role: m.role, content: m.content }));

    try {
      if (!GROQ_API_KEY) throw new Error('Add VITE_GROQ_API_KEY to your .env.local file');
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history, { role: 'user', content: userText.trim() }],
          max_tokens: 600, temperature: 0.82,
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
  }, [messages, speak]);

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } };
  const auraColor = speaking ? '#f59e0b' : listening ? '#06b6d4' : '#d97706';

  const suggestions = [
    'What is gradient descent in simple words?',
    'How do I break into AI/ML field?',
    'Explain LSTM like I am 5 years old',
    'What is the future of AI in 2030?',
    'How to improve memory for coding?',
  ];

  return (
    <>
      <style>{`
        @keyframes bodhiFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bodhiDot { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1); opacity:1; } }
        @keyframes bodhiFloat { 0%,100% { transform:translateY(0px) rotate(-1deg); } 50% { transform:translateY(-8px) rotate(1deg); } }
        @keyframes bodhiPulse { 0%,100% { box-shadow:0 0 20px #f59e0b44,0 0 60px #f59e0b22; } 50% { box-shadow:0 0 40px #f59e0b88,0 0 100px #f59e0b44; } }
        @keyframes bodhiRipple { 0% { transform:scale(1); opacity:0.6; } 100% { transform:scale(2.2); opacity:0; } }
        @keyframes bodhiOpen { from { opacity:0; transform:scale(0.92) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes bodhiListen { 0%,100% { box-shadow:0 0 0 0 #06b6d488; } 50% { box-shadow:0 0 0 12px #06b6d400; } }
        .bodhi-input:focus { outline:none; border-color:#f59e0b88 !important; }
        .bodhi-input::placeholder { color:#78716c; }
        .bodhi-suggest:hover { background:rgba(245,158,11,0.18) !important; color:#fef3c7 !important; }
        .bodhi-send:hover:not(:disabled) { background:linear-gradient(135deg,#f59e0b,#ea580c) !important; transform:scale(1.05); }
        .bodhi-mic:hover { transform:scale(1.08); }
      `}</style>

      {/* Floating trigger */}
      {!isOpen && (
        <div onClick={() => setIsOpen(true)} style={{ position:'fixed', bottom:28, right:28, zIndex:1000, width:68, height:68, cursor:'pointer', animation:'bodhiPulse 3s ease-in-out infinite' }}>
          {[0,1].map(i => (
            <div key={i} style={{ position:'absolute', inset:-6-i*10, borderRadius:'50%', border:'1.5px solid #f59e0b55', animation:`bodhiRipple 2.5s ${i*0.8}s ease-out infinite` }} />
          ))}
          <div style={{ width:68, height:68, borderRadius:'50%', background:'linear-gradient(135deg,#1c0a00,#3d1a00)', border:'2px solid #f59e0b88', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
            <div style={{ width:52, height:52 }}><MonkFace speaking={false} thinking={false} /></div>
          </div>
          <div style={{ position:'absolute', bottom:-22, left:'50%', transform:'translateX(-50%)', fontSize:9, color:'#f59e0b', letterSpacing:1.5, whiteSpace:'nowrap', fontWeight:700 }}>BODHI</div>
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div style={{ position:'fixed', bottom:24, right:24, zIndex:1001, width:'min(420px,calc(100vw - 32px))', height:'min(680px,calc(100vh - 48px))', background:'linear-gradient(160deg,#0d0700 0%,#120a00 40%,#0a0f0a 100%)', border:'1px solid #f59e0b33', borderRadius:24, display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 24px 80px #00000088,0 0 40px #f59e0b18', animation:'bodhiOpen 0.35s cubic-bezier(0.34,1.56,0.64,1)' }}>

          {/* Header with aura + monk */}
          <div style={{ background:'linear-gradient(135deg,#1c0a00 0%,#2d1200 60%,#0a1a0a 100%)', borderBottom:'1px solid #f59e0b22', position:'relative', overflow:'hidden', flexShrink:0 }}>
            <div style={{ height:150, position:'relative' }}>
              <AuraCanvas speaking={speaking} color={auraColor} />
              <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:88, height:100, animation:'bodhiFloat 4s ease-in-out infinite', zIndex:2 }}>
                <MonkFace speaking={speaking} thinking={loading} />
              </div>
              <div style={{ position:'absolute', top:10, left:16, zIndex:3 }}>
                <div style={{ fontSize:13, fontWeight:800, color:'#fef3c7', letterSpacing:1 }}>BODHI</div>
                <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:2 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background: loading ? '#f59e0b' : '#10b981', animation: loading ? 'bodhiDot 1s infinite' : 'none' }} />
                  <span style={{ fontSize:10, color: loading ? '#f59e0b' : '#10b981', letterSpacing:0.5 }}>
                    {loading ? 'Contemplating...' : speaking ? 'Speaking...' : listening ? 'Listening...' : 'Enlightened & Ready'}
                  </span>
                </div>
              </div>
              <div style={{ position:'absolute', top:10, right:12, zIndex:3, display:'flex', gap:6 }}>
                <button onClick={() => setTtsEnabled(e => !e)} style={{ width:28, height:28, borderRadius:'50%', border:`1px solid ${ttsEnabled ? '#f59e0b55' : '#ffffff22'}`, background: ttsEnabled ? '#f59e0b18' : 'rgba(255,255,255,0.05)', cursor:'pointer', color: ttsEnabled ? '#f59e0b' : '#4b5563', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>🔊</button>
                {speaking && <button onClick={stopSpeaking} style={{ width:28, height:28, borderRadius:'50%', border:'1px solid #ef444455', background:'#ef444418', cursor:'pointer', color:'#ef4444', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>⏹</button>}
                <button onClick={() => { setIsOpen(false); stopSpeaking(); }} style={{ width:28, height:28, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.05)', cursor:'pointer', color:'#9ca3af', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>
            </div>
            <div style={{ textAlign:'center', padding:'0 0 12px', fontSize:10, color:'#78716c', letterSpacing:2 }}>ॐ  ANCIENT WISDOM · MODERN TECHNOLOGY  ॐ</div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 14px', scrollbarWidth:'thin', scrollbarColor:'#2d1200 transparent' }}>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
            {messages.length === 1 && (
              <div style={{ marginTop:12 }}>
                <div style={{ fontSize:10, color:'#57534e', letterSpacing:2, marginBottom:8, paddingLeft:4 }}>SUGGESTED QUESTIONS</div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {suggestions.map((s, i) => (
                    <button key={i} className="bodhi-suggest" onClick={() => sendMessage(s)} style={{ padding:'8px 14px', background:'rgba(245,158,11,0.08)', border:'1px solid #f59e0b22', borderRadius:10, color:'#a8a29e', fontSize:12, cursor:'pointer', textAlign:'left', transition:'all 0.2s', fontFamily:'inherit' }}>{s}</button>
                  ))}
                </div>
              </div>
            )}
            {error && <div style={{ background:'#2d0000', border:'1px solid #ef444444', borderRadius:10, padding:'10px 14px', marginTop:8, fontSize:12, color:'#fca5a5' }}>⚠️ {error}</div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div style={{ padding:'10px 12px 14px', borderTop:'1px solid #f59e0b18', background:'linear-gradient(0deg,#0d0700 0%,transparent 100%)', flexShrink:0 }}>
            <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
              <button className="bodhi-mic" onMouseDown={startListening} onMouseUp={() => { recognitionRef.current?.stop(); if (input.trim()) setTimeout(() => sendMessage(input), 300); }}
                style={{ width:42, height:42, borderRadius:'50%', flexShrink:0, background: listening ? 'linear-gradient(135deg,#0c4a6e,#0369a1)' : 'rgba(255,255,255,0.05)', border:`1px solid ${listening ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`, color: listening ? '#67e8f9' : '#6b7280', cursor:'pointer', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s', animation: listening ? 'bodhiListen 1s infinite' : 'none' }} title="Hold to speak">🎙️</button>
              <textarea className="bodhi-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask the monk anything… (Enter to send)" rows={1}
                style={{ flex:1, padding:'11px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:14, color:'#fef3c7', fontSize:13, resize:'none', fontFamily:'inherit', lineHeight:1.5, maxHeight:90, overflowY:'auto', transition:'border-color 0.2s' }} />
              <button className="bodhi-send" onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
                style={{ width:42, height:42, borderRadius:'50%', flexShrink:0, background: input.trim() ? 'linear-gradient(135deg,#d97706,#c2410c)' : 'rgba(255,255,255,0.04)', border:`1px solid ${input.trim() ? '#f59e0b55' : 'rgba(255,255,255,0.08)'}`, color: input.trim() ? '#fff' : '#374151', cursor: input.trim() ? 'pointer' : 'not-allowed', fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}>
                {loading ? '⏳' : '🪬'}
              </button>
            </div>
            <div style={{ textAlign:'center', marginTop:8, fontSize:9, color:'#3d3028', letterSpacing:1.5 }}>POWERED BY GROQ · LLAMA3-70B · WISDOM IS FREE</div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── MASTER RUA PAGE ───────────────────────────────────────────────────────────
const MasterRua = () => {
  const [typedText, setTypedText] = useState('');
  const fullText = "Vision: To change the education system by applying the UEEP Model";

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) { setTypedText(fullText.slice(0, index)); index++; }
      else clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const feedbackVideos = [
    { title: "MIT College Student Feedback", url: "https://www.youtube.com/embed/BZFBb3DBhLY", thumbnail: "🎓" },
    { title: "Student Experience Review", url: "https://www.youtube.com/embed/51-wVCd7dfI", thumbnail: "⭐" },
    { title: "Learning Journey Testimonial", url: "https://www.youtube.com/embed/W43530w_3Mk", thumbnail: "🚀" },
    { title: "Course Impact Feedback", url: "https://www.youtube.com/embed/9gb9qf5ouWA", thumbnail: "💡" },
  ];

  const projects = [
    { name: "YouTube Growth Predictor", tech: "React + Django + ML", icon: "📊" },
    { name: "Employee Management System", tech: "React + Django + PostgreSQL", icon: "👥" },
    { name: "UEEP Learning Platform", tech: "React + Vite + AI", icon: "🧠" },
    { name: "Success Analyzer", tech: "Python + Data Science", icon: "🎯" },
  ];

  return (
    <div className="master-rua-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <div className="title-badge"><span className="pulse-dot" />Master Rua Live</div>
            <h1 className="hero-title">Sachin Kumar<span className="gradient-text"> (Master Rua)</span></h1>
            <div className="typewriter">{typedText}<span className="cursor">|</span></div>
            <p className="hero-description">
              AI/ML Trainer | Memory Science Expert | Full Stack Developer<br />
              <span className="highlight">Currently teaching USA professionals at Xziant</span>
            </p>
            <div className="hero-stats">
              <div className="stat-box"><div className="stat-number">1000+</div><div className="stat-label">Students Mentored</div></div>
              <div className="stat-box"><div className="stat-number">USA</div><div className="stat-label">Global Clients</div></div>
              <div className="stat-box"><div className="stat-number">UEEP</div><div className="stat-label">Learning Framework</div></div>
            </div>
            <div className="hero-actions">
              <a href="#feedback" className="btn btn-primary">Watch Feedback</a>
              <a href="#projects" className="btn btn-secondary">View Projects</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="character-container">
              <div className="character-placeholder">
                <span>🧙‍♂️</span><p>3D Professor Avatar</p><small>(Three.js Character Coming Soon)</small>
              </div>
              <div className="floating-elements">
                <span className="float-1">🧠</span><span className="float-2">⚡</span>
                <span className="float-3">🎯</span><span className="float-4">💎</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mission-section">
        <div className="section-container">
          <h2 className="section-title">🎯 The Mission</h2>
          <div className="mission-grid">
            <div className="mission-card"><div className="mission-icon">🧠</div><h3>Mind First</h3><p>Before learning AI/ML, learn HOW to learn. Understand your brain, reprogram your mind, then conquer any skill.</p></div>
            <div className="mission-card"><div className="mission-icon">📚</div><h3>UEEP Framework</h3><p>Understand → Encode → Expand → Practice. A scientifically proven method for permanent learning.</p></div>
            <div className="mission-card"><div className="mission-icon">🚀</div><h3>Real Innovation</h3><p>Bridge human intelligence with machine intelligence. Create, don't just consume.</p></div>
          </div>
        </div>
      </section>

      <section id="feedback" className="feedback-section">
        <div className="section-container">
          <h2 className="section-title">🎬 Student Feedback</h2>
          <p className="section-subtitle">Real experiences from real learners</p>
          <div className="feedback-grid">
            {feedbackVideos.map((video, index) => (
              <div key={index} className="feedback-card">
                <div className="video-wrapper">
                  <iframe src={video.url} title={video.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
                <div className="feedback-info"><span className="feedback-icon">{video.thumbnail}</span><h4>{video.title}</h4></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="projects-section">
        <div className="section-container">
          <h2 className="section-title">💻 Live Projects</h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div key={index} className="project-card">
                <div className="project-icon">{project.icon}</div>
                <h3>{project.name}</h3><p>{project.tech}</p>
                <div className="project-status"><span className="status-dot active" />Live on Render</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ueep-highlight">
        <div className="section-container">
          <div className="ueep-content">
            <h2>The UEEP Learning Framework</h2>
            <div className="ueep-steps">
              <div className="ueep-step"><div className="step-number">U</div><h4>Understand</h4><p>Build mental clarity</p></div>
              <div className="ueep-arrow">→</div>
              <div className="ueep-step"><div className="step-number">E</div><h4>Encode</h4><p>Memory techniques</p></div>
              <div className="ueep-arrow">→</div>
              <div className="ueep-step"><div className="step-number">E</div><h4>Expand</h4><p>Curiosity & inquiry</p></div>
              <div className="ueep-arrow">→</div>
              <div className="ueep-step"><div className="step-number">P</div><h4>Practice</h4><p>Real application</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Bodhi Monk floats over the entire page */}
      <BodhiMonk />
    </div>
  );
};

export default MasterRua;