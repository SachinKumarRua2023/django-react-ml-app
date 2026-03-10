import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ADD THIS
import axios from 'axios';
import { TOKEN_KEY } from '../App'; // Import the token key

// ─────────────────────────────────────────────────────────────────────────────
//  COSMOS UI STYLES — mirrors VCRoom auth screen exactly
//  ADDITION ONLY: injected via <style> tag, zero logic touched
// ─────────────────────────────────────────────────────────────────────────────
const COSMOS_AUTH_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;900&family=Rajdhani:wght@300;400;600&display=swap');

  .cosmos-auth-root *, .cosmos-auth-root *::before, .cosmos-auth-root *::after {
    box-sizing: border-box;
  }

  .cosmos-auth-root {
    --void:      #020008;
    --deep:      #06001a;
    --nebula:    #0d0025;
    --purple:    #6600ff;
    --violet:    #9933ff;
    --aurora:    #bf00ff;
    --cyan:      #00f5ff;
    --gold:      #ffd700;
    --rose:      #ff2d78;
    --green:     #00ff88;
    --glass:     rgba(102,0,255,0.08);
    --glass2:    rgba(255,255,255,0.04);
    --border:    rgba(102,0,255,0.3);
    --border2:   rgba(0,245,255,0.2);
    --text:      #e8e0ff;
    --muted:     rgba(232,224,255,0.45);
    --glow:      0 0 20px rgba(102,0,255,0.6), 0 0 60px rgba(102,0,255,0.2);
    --glow-cyan: 0 0 20px rgba(0,245,255,0.5), 0 0 60px rgba(0,245,255,0.15);
    --font-display: 'Orbitron', monospace;
    --font-body:    'Rajdhani', sans-serif;
    font-family: var(--font-body);
    color: var(--text);
    background: var(--void);
    min-height: 100vh;
    position: relative;
  }

  /* Canvas star field */
  #cosmos-auth-canvas {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 0;
  }

  .cosmos-auth-inner {
    position: relative; z-index: 1;
    min-height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 24px; gap: 28px;
  }

  /* Logo */
  .cosmos-auth-logo { text-align: center; animation: caFloatIn 1.2s ease forwards; }
  .cosmos-auth-logo h1 {
    font-family: var(--font-display); font-size: clamp(2rem,6vw,3.5rem); font-weight: 900;
    background: linear-gradient(135deg, #9933ff, #00f5ff, #bf00ff);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    filter: drop-shadow(0 0 30px rgba(102,0,255,0.8)); letter-spacing: 0.15em;
  }
  .cosmos-auth-logo p {
    color: var(--muted); letter-spacing: 0.3em; font-size: 0.72rem;
    text-transform: uppercase; margin-top: 8px;
  }

  /* Card */
  .cosmos-auth-card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 24px;
    padding: 36px; width: 100%; max-width: 460px; backdrop-filter: blur(20px);
    box-shadow: var(--glow), inset 0 1px 0 rgba(255,255,255,0.05);
    animation: caFloatIn 1.4s ease forwards;
  }

  /* Tabs */
  .ca-tabs { display: flex; gap: 0; margin-bottom: 24px; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .ca-tab {
    flex: 1; padding: 11px; text-align: center; font-family: var(--font-display);
    font-size: 0.65rem; letter-spacing: 0.15em; color: var(--muted); cursor: pointer;
    background: none; border: none; transition: all 0.2s; color: var(--muted);
  }
  .ca-tab.active { background: rgba(102,0,255,0.25); color: var(--cyan); }
  .ca-tab:hover:not(.active) { color: var(--text); }

  /* Role selector */
  .ca-role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
  .ca-role-btn {
    padding: 14px; border-radius: 14px; border: 1px solid var(--border);
    background: var(--glass2); color: var(--text); cursor: pointer;
    font-family: var(--font-display); font-size: 0.65rem; letter-spacing: 0.1em;
    transition: all 0.3s ease; text-align: center;
  }
  .ca-role-btn .ca-role-icon { font-size: 1.6rem; display: block; margin-bottom: 6px; }
  .ca-role-btn:hover { border-color: var(--purple); background: rgba(102,0,255,0.2); box-shadow: var(--glow); }
  .ca-role-btn.active { border-color: var(--cyan); background: rgba(0,245,255,0.08); box-shadow: var(--glow-cyan); }

  /* Inputs */
  .ca-input {
    width: 100%; padding: 13px 16px; background: rgba(0,0,0,0.45);
    border: 1px solid var(--border); border-radius: 11px; color: var(--text);
    font-family: var(--font-body); font-size: 0.95rem; outline: none;
    transition: border-color 0.3s, box-shadow 0.3s; margin-bottom: 12px;
    display: block;
  }
  .ca-input:focus { border-color: var(--purple); box-shadow: 0 0 0 2px rgba(102,0,255,0.2); }
  .ca-input::placeholder { color: var(--muted); }
  .ca-input option { background: var(--nebula); color: var(--text); }

  /* Error/Success */
  .ca-err-msg {
    color: var(--rose); font-size: 0.8rem; margin-bottom: 14px; text-align: center;
    padding: 8px; background: rgba(255,45,120,0.08); border-radius: 8px;
    border: 1px solid rgba(255,45,120,0.2);
  }
  .ca-ok-msg {
    color: var(--green); font-size: 0.8rem; margin-bottom: 14px; text-align: center;
    padding: 8px; background: rgba(0,255,136,0.06); border-radius: 8px;
    border: 1px solid rgba(0,255,136,0.2);
  }

  /* Section label */
  .ca-section-label {
    font-family: var(--font-display); font-size: 0.6rem; letter-spacing: 0.28em;
    color: var(--muted); text-transform: uppercase; padding-bottom: 7px;
    border-bottom: 1px solid var(--border); margin-bottom: 10px;
  }

  /* Buttons */
  .ca-btn-primary {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px 22px; border-radius: 11px; border: none; cursor: pointer;
    font-family: var(--font-display); font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase; transition: all 0.25s ease;
    background: linear-gradient(135deg, var(--purple), var(--violet)); color: #fff;
    box-shadow: var(--glow); margin-top: 4px;
  }
  .ca-btn-primary:hover:not(:disabled) { box-shadow: 0 0 40px rgba(102,0,255,0.8); transform: translateY(-1px); }
  .ca-btn-primary:active { transform: scale(0.97); }
  .ca-btn-primary:disabled { opacity: 0.38; cursor: not-allowed; transform: none !important; }

  .ca-btn-logout {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px 22px; border-radius: 11px; border: none; cursor: pointer;
    font-family: var(--font-display); font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase; transition: all 0.25s ease;
    background: linear-gradient(135deg, #330011, #550022); color: var(--rose);
    border: 1px solid rgba(255,45,120,0.3); margin-top: 8px;
  }
  .ca-btn-logout:hover:not(:disabled) { box-shadow: 0 0 30px rgba(255,45,120,0.4); transform: translateY(-1px); }
  .ca-btn-logout:disabled { opacity: 0.38; cursor: not-allowed; }

  .ca-btn-voice {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px 22px; border-radius: 11px; border: none; cursor: pointer;
    font-family: var(--font-display); font-size: 0.7rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase; transition: all 0.25s ease;
    background: linear-gradient(135deg, #004466, #006688); color: var(--cyan);
    border: 1px solid var(--border2); box-shadow: var(--glow-cyan); margin-bottom: 10px;
  }
  .ca-btn-voice:hover { box-shadow: 0 0 40px rgba(0,245,255,0.5); transform: translateY(-1px); }

  /* Toggle link */
  .ca-toggle { text-align: center; margin-top: 18px; color: var(--muted); font-size: 0.82rem; }
  .ca-toggle-btn {
    background: none; border: none; color: var(--cyan); cursor: pointer;
    text-decoration: underline; font-size: 0.82rem; font-family: var(--font-body);
  }
  .ca-toggle-btn:hover { color: var(--violet); }

  /* Profile card */
  .ca-profile-info {
    background: var(--glass2); border: 1px solid var(--border); border-radius: 14px;
    padding: 18px; margin-bottom: 20px;
  }
  .ca-profile-info p { color: var(--muted); font-size: 0.88rem; margin-bottom: 6px; }
  .ca-profile-info p strong { color: var(--text); }
  .ca-premium { color: var(--gold) !important; font-weight: bold; }

  /* Hint text */
  .ca-hint { color: var(--muted); font-size: 0.7rem; text-align: center; }

  /* Animations */
  @keyframes caFloatIn { from { opacity:0; transform:translateY(28px) scale(0.97); } to { opacity:1; transform:none; } }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--deep); }
  ::-webkit-scrollbar-thumb { background: var(--purple); border-radius: 2px; }
`;

// ─────────────────────────────────────────────────────────────────────────────
//  COSMOS CANVAS — reused from VCRoom (star field + nebula)
//  ADDITION ONLY: pure visual component, zero logic
// ─────────────────────────────────────────────────────────────────────────────
function CosmosAuthCanvas() {
  const ref = React.useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx    = canvas.getContext("2d");
    let raf;
    const stars  = Array.from({ length: 200 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.3 + 0.2,
      twinkleSpeed:  Math.random() * 0.018 + 0.004,
      twinkleOffset: Math.random() * Math.PI * 2,
      brightness:    Math.random(),
    }));
    const blobs = [
      { x:0.15, y:0.2,  r:0.35, c:"102,0,255",  a:0.038 },
      { x:0.8,  y:0.6,  r:0.3,  c:"0,245,255",  a:0.022 },
      { x:0.5,  y:0.87, r:0.4,  c:"191,0,255",  a:0.028 },
      { x:0.3,  y:0.7,  r:0.25, c:"255,45,120", a:0.018 },
    ];
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x*W, b.y*H, 0, b.x*W, b.y*H, b.r*Math.max(W,H));
        g.addColorStop(0, `rgba(${b.c},${b.a})`); g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });
      stars.forEach(s => {
        s.twinkleOffset += s.twinkleSpeed;
        ctx.beginPath();
        ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(232,224,255,${s.brightness*(0.4+0.6*Math.sin(s.twinkleOffset))})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas id="cosmos-auth-canvas" ref={ref} />;
}

// ─────────────────────────────────────────────────────────────────────────────
//  API base URL — unchanged from original
// ─────────────────────────────────────────────────────────────────────────────
const API_URL = 'https://api.seekhowithrua.com' || 'http://localhost:8000/api';

// Create axios instance — unchanged from original
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if exists — unchanged from original
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENT — ALL LOGIC IDENTICAL TO ORIGINAL, only JSX/styles replaced
// ─────────────────────────────────────────────────────────────────────────────
const LoginSignupLogout = () => {
  const navigate = useNavigate(); // ADD THIS
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    role: 'learner',
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── ADDITION ONLY: inject cosmic styles ──────────────────────────────────
  useEffect(() => {
    if (document.getElementById("cosmos-auth-styles")) return;
    const el = document.createElement("style");
    el.id = "cosmos-auth-styles";
    el.textContent = COSMOS_AUTH_STYLES;
    document.head.appendChild(el);
  }, []);

  // Check if already logged in — UNCHANGED
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem("cosmos_user");
    if (token && savedUser) {
      navigate('/live-voice'); // Redirect if already logged in
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('api/login/', {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;
      
      // Use cosmos_token to match VCRoom and App.jsx
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem("cosmos_user", JSON.stringify(user));
      
      // Dispatch storage event to notify Navbar
      window.dispatchEvent(new Event('storage'));
      
      setUser(user);
      setSuccess('Login successful!');
      
      // NAVIGATE TO LIVE VOICE AFTER LOGIN
      navigate('/live-voice');
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        role: 'learner',
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('api/register/', {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role,
      });

      const { token, user } = response.data;
      
      // Use cosmos_token to match VCRoom and App.jsx
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem("cosmos_user", JSON.stringify(user));
      
      // Dispatch storage event to notify Navbar
      window.dispatchEvent(new Event('storage'));
      
      setUser(user);
      setSuccess('Registration successful! Welcome!');
      
      // NAVIGATE TO LIVE VOICE AFTER REGISTRATION
      navigate('/live-voice');
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        role: 'learner',
      });
      
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post('/logout/');
    } catch (err) {
      console.log('Logout error:', err);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem("cosmos_user");
      
      // Dispatch storage event to notify Navbar
      window.dispatchEvent(new Event('storage'));
      
      setUser(null);
      setIsLogin(true);
      setLoading(false);
      setSuccess('Logged out successfully');
      
      // NAVIGATE TO LOGIN AFTER LOGOUT
      navigate('/login');
    }
  };

  // ── ADDITION ONLY: helper to clear form on tab switch ────────────────────
  const handleTabSwitch = (toLogin) => {
    setIsLogin(toLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirm_password: '',
      first_name: '',
      last_name: '',
      role: 'learner',
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER — cosmic UI shell wrapping the original form logic
  // ─────────────────────────────────────────────────────────────────────────

  // If user is logged in, show profile — same data as original, cosmic skin
  if (user) {
    return (
      <div className="cosmos-auth-root">
        <CosmosAuthCanvas />
        <div className="cosmos-auth-inner">
          <div className="cosmos-auth-logo">
            <h1>COSMOS</h1>
            <p>Philosophy · Spirituality · AI · Innovation · Seekers</p>
          </div>

          <div className="cosmos-auth-card">
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
                background: 'linear-gradient(135deg,#06001a,#0d0025)',
                border: '2px solid rgba(0,245,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.6rem', boxShadow: '0 0 20px rgba(0,245,255,0.3)',
              }}>
                {(user.first_name || user.username || 'U')[0].toUpperCase()}
              </div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: '0.8rem', letterSpacing: '0.15em', color: '#00f5ff' }}>
                WELCOME BACK
              </div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: '1rem', color: '#e8e0ff', marginTop: 4 }}>
                {user.first_name || user.username}
              </div>
            </div>

            <div className="ca-profile-info">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.profile?.role || user.role}</p>
              {user.profile?.is_premium && <p className="ca-premium">⭐ Premium Member</p>}
            </div>

            {/* Button to enter voice chat — same onClick as original */}
            <button
              onClick={() => navigate('/live-voice')}
              className="ca-btn-voice"
            >
              🎙️ ENTER VOICE CHAT ROOM
            </button>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="ca-btn-logout"
            >
              {loading ? '...' : '⎋ LOGOUT'}
            </button>

            {success && <div className="ca-ok-msg" style={{ marginTop: 12 }}>{success}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Show login/signup form — same fields/handlers as original, cosmic skin
  return (
    <div className="cosmos-auth-root">
      <CosmosAuthCanvas />
      <div className="cosmos-auth-inner">

        {/* Logo */}
        <div className="cosmos-auth-logo">
          <h1>COSMOS</h1>
          <p>Philosophy · Spirituality · AI · Innovation · Seekers</p>
        </div>

        {/* Card */}
        <div className="cosmos-auth-card">

          {/* Tabs — replaces isLogin toggle, same state */}
          <div className="ca-tabs">
            <button
              className={`ca-tab ${isLogin ? 'active' : ''}`}
              onClick={() => handleTabSwitch(true)}
            >
              SIGN IN
            </button>
            <button
              className={`ca-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => handleTabSwitch(false)}
            >
              REGISTER
            </button>
          </div>

          {error   && <div className="ca-err-msg">{error}</div>}
          {success && <div className="ca-ok-msg">{success}</div>}

          {/* Form — same onSubmit handlers, same field names */}
          <form onSubmit={isLogin ? handleLogin : handleRegister}>

            {/* Register-only fields */}
            {!isLogin && (
              <>
                <input
                  className="ca-input"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="First Name"
                />
                <input
                  className="ca-input"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Last Name"
                />

                {/* Role selector — cosmic style matching VCRoom */}
                <div className="ca-section-label">I AM A —</div>
                <div className="ca-role-selector" style={{ marginBottom: 16 }}>
                  <button
                    type="button"
                    className={`ca-role-btn ${formData.role === 'trainer' ? 'active' : ''}`}
                    onClick={() => setFormData(f => ({ ...f, role: 'trainer' }))}
                  >
                    <span className="ca-role-icon">🔭</span>
                    TRAINER
                  </button>
                  <button
                    type="button"
                    className={`ca-role-btn ${formData.role === 'learner' ? 'active' : ''}`}
                    onClick={() => setFormData(f => ({ ...f, role: 'learner' }))}
                  >
                    <span className="ca-role-icon">🌱</span>
                    SEEKER
                  </button>
                </div>
              </>
            )}

            {/* Email — both modes */}
            <input
              className="ca-input"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />

            {/* Password */}
            <input
              className="ca-input"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />

            {/* Confirm password — register only */}
            {!isLogin && (
              <input
                className="ca-input"
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Confirm Password"
                required
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="ca-btn-primary"
            >
              {loading ? '...' : isLogin ? '◈ ENTER THE VOID' : '◈ CREATE ACCOUNT'}
            </button>
          </form>

          {/* Toggle — same logic as original */}
          <div className="ca-toggle">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              className="ca-toggle-btn"
              onClick={() => handleTabSwitch(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </div>

        <p className="ca-hint">
          Only trainers can host panels · Seekers join and explore
        </p>
      </div>
    </div>
  );
};

export default LoginSignupLogout;
