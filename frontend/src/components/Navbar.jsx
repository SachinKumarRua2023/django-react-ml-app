import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://api.seekhowithrua.com';
axios.defaults.baseURL = API_URL;

// ── ONLY FIX: these 2 constants match what LoginSignupLogout writes ──
const TOKEN_KEY = "cosmos_token";  // was: 'auth_token'
const USER_KEY  = "cosmos_user";   // was: 'user'

// ── Theme hook (exported so other components can use it) ──────────────────────
const THEME_KEY = "rua_theme";
export function useAppTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) !== "light");
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.setAttribute("data-theme", "dark");
      root.style.setProperty("--bg-primary",   "#080c18");
      root.style.setProperty("--bg-secondary",  "rgba(15,20,35,0.95)");
      root.style.setProperty("--text-primary",  "rgba(220,235,255,0.92)");
      root.style.setProperty("--text-muted",    "rgba(140,160,190,0.75)");
      root.style.setProperty("--border-color",  "rgba(80,140,255,0.18)");
    } else {
      root.setAttribute("data-theme", "light");
      root.style.setProperty("--bg-primary",   "#ffffff");
      root.style.setProperty("--bg-secondary",  "rgba(248,250,252,0.97)");
      root.style.setProperty("--text-primary",  "rgba(15,23,42,0.92)");
      root.style.setProperty("--text-muted",    "rgba(71,85,105,0.8)");
      root.style.setProperty("--border-color",  "rgba(99,102,241,0.2)");
    }
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
    window.dispatchEvent(new CustomEvent("theme-change", { detail: { dark } }));
  }, [dark]);
  return [dark, setDark];
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeGlow, setActiveGlow] = useState(0);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ── ONLY ADDITION: theme state ────────────────────────────────────────────
  const [dark, setDark] = useAppTheme();

  // ALL PUBLIC NAV ITEMS - Trainer KPI is public
  const navItems = [
    { name: 'Master Rua', path: '/', icon: '◈', color: '#00ffff' },
    { name: 'Courses', path: '/syllabus', icon: '◉', color: '#ff00ff' },
    { name: 'ML Predictor', path: '/ml', icon: '◆', color: '#00ff88' },
    { name: 'Employees', path: '/employees', icon: '◊', color: '#ffaa00' },
    { name: 'Trainer KPI', path: '/trainer-kpi', icon: '★', color: '#fbbf24' },
    { name: 'Mnemonic System', path: '/mnemonic-system', icon: '🧠', color: '#a855f7' },
    { name: 'Talk with Rua', path: '/talk-with-rua', icon: '🧘', color: '#f59e0b' },
  ];

  // Check auth status immediately on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);      // FIXED: was 'auth_token'
        const savedUser = localStorage.getItem(USER_KEY);   // FIXED: was 'user'
        console.log('Auth check - Token exists:', !!token);
        if (token && savedUser) {
          axios.defaults.headers.common['Authorization'] = `Token ${token}`;
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          console.log('User authenticated:', JSON.parse(savedUser).email);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log('User not authenticated');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  // Listen for auth changes from LoginSignupLogout component
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage changed, rechecking auth...');
      const token = localStorage.getItem(TOKEN_KEY);      // FIXED: was 'auth_token'
      const savedUser = localStorage.getItem(USER_KEY);   // FIXED: was 'user'
      if (token && savedUser) {
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/voice/logout/');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem(TOKEN_KEY);     // FIXED: was 'auth_token'
      localStorage.removeItem(USER_KEY);      // FIXED: was 'user'
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      window.dispatchEvent(new Event('storage'));
      navigate('/');
    }
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Glow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGlow((prev) => (prev + 1) % navItems.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (path) => location.pathname === path;

  // ── ADDITION: handler for Live Voice nav click ───────────────────────────
  // If authenticated → go directly to /live-voice (VCRoom handles its own auth)
  // If not authenticated → go to /login so user can sign in first
  const handleLiveVoiceClick = (e) => {
    e.preventDefault();
    handleNavClick();
    if (isAuthenticated) {
      navigate('/live-voice');
    } else {
      navigate('/login');
    }
  };

  // Inject responsive + lightning navbar styles (no logic change)
  useEffect(() => {
    const styleId = 'navbar-responsive-styles';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .navbar { padding: 0 !important; min-height: 52px !important; }
      .nav-container { padding: 0 16px !important; height: 52px !important; min-height: 52px !important; }
      .logo { gap: 8px !important; }
      .logo-orbit { width: 32px !important; height: 32px !important; }
      .logo-main { font-size: 13px !important; }
      .logo-sub { font-size: 9px !important; }
      .nav-link { padding: 4px 8px !important; font-size: 11px !important; }
      .nav-icon { font-size: 11px !important; }
      @media (max-width: 1100px) {
        .desktop-nav { display: none !important; }
        .hamburger { display: flex !important; }
        .ai-status { display: none !important; }
      }
      @media (min-width: 1101px) {
        .hamburger { display: none !important; }
        .desktop-nav { display: flex !important; }
      }
      .navbar {
        border-bottom: 1px solid rgba(0,217,255,0.15) !important;
        box-shadow: 0 1px 0 rgba(0,217,255,0.08), 0 2px 20px rgba(0,217,255,0.04), inset 0 -1px 0 rgba(157,78,221,0.1) !important;
      }
      .navbar.scrolled {
        box-shadow: 0 0 8px rgba(0,217,255,0.2), 0 0 30px rgba(157,78,221,0.1), 0 1px 0 rgba(0,217,255,0.3) !important;
        border-bottom-color: rgba(0,217,255,0.35) !important;
      }
      .mobile-menu { top: 52px !important; }

      /* ── Theme toggle button ── */
      .rua-theme-toggle {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1.5px solid rgba(0,217,255,0.3);
        background: rgba(0,217,255,0.06);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transition: all 0.22s;
        flex-shrink: 0;
      }
      .rua-theme-toggle:hover {
        background: rgba(0,217,255,0.15);
        border-color: rgba(0,217,255,0.6);
        box-shadow: 0 0 12px rgba(0,217,255,0.3);
        transform: scale(1.1);
      }
      [data-theme="light"] .rua-theme-toggle {
        border-color: rgba(99,102,241,0.35);
        background: rgba(99,102,241,0.07);
      }
      [data-theme="light"] .rua-theme-toggle:hover {
        border-color: rgba(99,102,241,0.65);
        background: rgba(99,102,241,0.15);
        box-shadow: 0 0 12px rgba(99,102,241,0.3);
      }
      .rua-theme-toggle.spinning {
        animation: themeSpin 0.38s ease-out;
      }
      @keyframes themeSpin {
        0%  { transform: scale(1)   rotate(0deg);   }
        50% { transform: scale(1.3) rotate(190deg); }
        100%{ transform: scale(1)   rotate(360deg); }
      }

      /* ── Logo orbit: spinning rings + pulsing glow ── */
      @keyframes ruaOrbitSpin    { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
      @keyframes ruaOrbitSpinRev { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
      @keyframes ruaCoreGlow {
        0%,100% {
          box-shadow:
            0 0 8px  2px rgba(0,217,255,0.7),
            0 0 20px 5px rgba(0,217,255,0.35),
            0 0 40px 8px rgba(157,78,221,0.25),
            inset 0 0 8px rgba(255,255,255,0.15);
        }
        50% {
          box-shadow:
            0 0 16px 5px rgba(0,217,255,1),
            0 0 36px 10px rgba(0,217,255,0.5),
            0 0 65px 16px rgba(157,78,221,0.4),
            0 0 90px 24px rgba(0,217,255,0.12),
            inset 0 0 14px rgba(255,255,255,0.28);
        }
      }

      .logo-orbit {
        position: relative !important;
        overflow: visible !important;
      }
      /* Outer spinning ring */
      .logo-orbit::before {
        content: '';
        position: absolute;
        inset: -6px;
        border-radius: 50%;
        border: 1.5px solid transparent;
        border-top-color: rgba(0,217,255,0.9);
        border-right-color: rgba(157,78,221,0.55);
        animation: ruaOrbitSpin 2.2s linear infinite;
        pointer-events: none;
        z-index: 1;
      }
      /* Counter-spinning dashed ring */
      .logo-orbit::after {
        content: '';
        position: absolute;
        inset: -10px;
        border-radius: 50%;
        border: 1px dashed rgba(0,217,255,0.28);
        border-bottom-color: rgba(157,78,221,0.45);
        animation: ruaOrbitSpinRev 3.8s linear infinite;
        pointer-events: none;
        z-index: 1;
      }
      /* Core pulse */
      .logo-core {
        animation: ruaCoreGlow 2.6s ease-in-out infinite !important;
        border-radius: 50% !important;
        position: relative !important;
        z-index: 2 !important;
      }
      /* Existing orbit-ring divs get proper animation */
      .orbit-ring {
        position: absolute !important;
        inset: -3px !important;
        border-radius: 50% !important;
        border: 1.5px solid transparent !important;
        border-top-color: rgba(0,217,255,0.5) !important;
        animation: ruaOrbitSpin 1.7s linear infinite !important;
      }
      .orbit-ring.ring-2 {
        inset: -6px !important;
        border-top-color: transparent !important;
        border-right-color: rgba(157,78,221,0.5) !important;
        animation: ruaOrbitSpinRev 2.9s linear infinite !important;
      }

      /* ── desktop-only: show text on desktop, hide on mobile ── */
      .desktop-only { display: inline !important; }
      @media (max-width: 1100px) {
        .desktop-only { display: none !important; }
      }

      /* ── logout-btn: always visible, never overflow-hidden ── */
      .logout-btn { flex-shrink: 0 !important; white-space: nowrap !important; }
      .nav-right  { flex-shrink: 0 !important; overflow: visible !important; }
    `;
    document.head.appendChild(style);
    return () => { const el = document.getElementById(styleId); if (el) el.remove(); };
  }, []);

  // ── Theme toggle spin state ───────────────────────────────────────────────
  const [spinning, setSpinning] = useState(false);
  const handleThemeToggle = () => {
    setSpinning(true);
    setDark(d => !d);
    setTimeout(() => setSpinning(false), 400);
  };

  // Don't render auth buttons until initial auth check is complete
  if (!authChecked) {
    return (
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="logo" onClick={handleNavClick}>
            <div className="logo-orbit">
              <div className="orbit-ring" />
              <div className="orbit-ring ring-2" />
              <div className="logo-core"><span>🜁</span></div>
            </div>
            <div className="logo-text">
              <span className="logo-main">Seekhowithrua</span>
              <span className="logo-sub"><span className="sub-gradient">Master Rua</span></span>
            </div>
          </Link>
          <div className="desktop-nav">
            {navItems.map((item) => (
              <Link key={item.name} to={item.path} className={`nav-link ${isActive(item.path) ? 'active' : ''}`} onClick={handleNavClick}>
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-text">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="logo" onClick={handleNavClick}>
            <div className="logo-orbit">
              <div className="orbit-ring" />
              <div className="orbit-ring ring-2" />
              <div className="logo-core"><span>🜁</span></div>
            </div>
            <div className="logo-text">
              <span className="logo-main">
                {'Seekhowithrua'.split('').map((char, i) => (
                  <span key={i} className="logo-char" style={{ animationDelay: `${i * 0.05}s` }}>{char}</span>
                ))}
              </span>
              <span className="logo-sub">
                <span className="sub-gradient">Master Rua</span>
                <span className="sub-line" />
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            {navItems.map((item, index) => (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''} ${activeGlow === index && !isActive(item.path) ? 'glow-pulse' : ''}`}
                onClick={handleNavClick}
                style={{ '--item-color': item.color }}
              >
                <span className="nav-icon-wrapper">
                  <span className="nav-icon">{item.icon}</span>
                  <span className="icon-glow" />
                </span>
                <span className="nav-text">{item.name}</span>
                <span className="nav-bg" />
                {isActive(item.path) && (
                  <>
                    <span className="active-line" />
                    <span className="active-glow" />
                  </>
                )}
              </Link>
            ))}

            {/* ── ADDITION: Live Voice link visible to all, but routes smartly ── */}
            {/* Authenticated → /live-voice directly. Not authed → /login first. */}
            <a
              href="/live-voice"
              className={`nav-link ${isActive('/live-voice') ? 'active' : ''}`}
              onClick={handleLiveVoiceClick}
              style={{ '--item-color': '#ff0000', cursor: 'pointer' }}
            >
              <span className="nav-icon-wrapper">
                <span className="nav-icon">🔴</span>
                <span className="icon-glow" />
              </span>
              <span className="nav-text">Live Voice</span>
              <span className="nav-bg" />
              {isActive('/live-voice') && (
                <>
                  <span className="active-line" />
                  <span className="active-glow" />
                </>
              )}
            </a>
          </div>

          {/* RIGHT SIDE */}
          <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, overflow: 'visible', minWidth: 'fit-content' }}>

            {/* AI Status */}
            <div className="ai-status">
              <div className="ai-rings">
                <span className="ring" />
                <span className="ring" />
                <span className="ring" />
              </div>
              <div className="ai-core">
                <span className="ai-brain">🧠</span>
                <span className="ai-particles" />
              </div>
              <div className="ai-info">
                <span className="ai-label">System</span>
                <span className="ai-value">Online</span>
              </div>
            </div>

            {/* ── THEME TOGGLE — only addition ── */}
            <button
              className={`rua-theme-toggle${spinning ? ' spinning' : ''}`}
              onClick={handleThemeToggle}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {dark ? '☀️' : '🌙'}
            </button>

            {/* Auth */}
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="login-btn"
                style={{
                  padding: '8px 20px',
                  background: 'linear-gradient(135deg, #00d9ff, #9d4edd)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0, 217, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 217, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 217, 255, 0.3)';
                }}
              >
                <span>🔐</span>
                <span>Login</span>
              </Link>
            ) : (
              <div className="auth-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  className="user-avatar"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: user?.profile?.avatar_url
                      ? `url(${user.profile.avatar_url}) center/cover`
                      : 'linear-gradient(135deg, #00d9ff, #9d4edd)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                  title={user?.email}
                >
                  {!user?.profile?.avatar_url && (user?.first_name?.[0] || user?.username?.[0] || 'U')}
                </div>
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#ef4444',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    visibility: 'visible',
                    opacity: 1,
                    minWidth: 'fit-content',
                    overflow: 'visible'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>⎋</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`hamburger ${isOpen ? 'open' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>

        {/* Bottom accent line */}
        <div className="nav-accent">
          <div className="accent-line" />
          <div className="accent-glow" />
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="mobile-header">
          <span className="mobile-title">Navigation</span>
          {/* ── THEME TOGGLE in mobile header too ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className={`rua-theme-toggle${spinning ? ' spinning' : ''}`}
              onClick={handleThemeToggle}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
              style={{ width: 30, height: 30, fontSize: 14 }}
            >
              {dark ? '☀️' : '🌙'}
            </button>
            <button className="mobile-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>
        </div>

        <div className="mobile-nav">
          {navItems.map((item, index) => (
            <Link
              key={item.name}
              to={item.path}
              className={`mobile-link ${isActive(item.path) ? 'active' : ''}`}
              onClick={handleNavClick}
              style={{ '--item-color': item.color, animationDelay: `${index * 0.1}s` }}
            >
              <span className="mobile-icon-bg">
                <span className="mobile-icon">{item.icon}</span>
              </span>
              <div className="mobile-link-content">
                <span className="mobile-text">{item.name}</span>
                {isActive(item.path) && <span className="mobile-active-badge">Active</span>}
              </div>
              <span className="mobile-arrow">→</span>
            </Link>
          ))}

          {/* ── ADDITION: Live Voice in mobile menu, same smart routing ── */}
          <a
            href="/live-voice"
            className={`mobile-link ${isActive('/live-voice') ? 'active' : ''}`}
            onClick={handleLiveVoiceClick}
            style={{ '--item-color': '#ff0000', animationDelay: `${navItems.length * 0.1}s`, cursor: 'pointer' }}
          >
            <span className="mobile-icon-bg">
              <span className="mobile-icon">🔴</span>
            </span>
            <div className="mobile-link-content">
              <span className="mobile-text">Live Voice</span>
              {isActive('/live-voice') && <span className="mobile-active-badge">Active</span>}
            </div>
            <span className="mobile-arrow">→</span>
          </a>

          <div className="mobile-auth-section" style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            {!isAuthenticated ? (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                style={{
                  margin: '0 20px',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #00d9ff, #9d4edd)',
                  borderRadius: '12px',
                  color: 'white',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>🔐</span>
                <span>Login / Sign Up</span>
              </Link>
            ) : (
              <div style={{ padding: '0 20px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '16px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: user?.profile?.avatar_url
                      ? `url(${user.profile.avatar_url}) center/cover`
                      : 'linear-gradient(135deg, #00d9ff, #9d4edd)',
                    border: '2px solid rgba(255,255,255,0.2)'
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: 'white' }}>
                      {user?.first_name || user?.username}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    color: '#ef4444',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>⎋</span>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mobile-footer">
          <div className="ueep-showcase">
            <div className="ueep-title">UEEP Framework</div>
            <div className="ueep-visual">
              <span className="ueep-node">U</span>
              <span className="ueep-connector" />
              <span className="ueep-node">E</span>
              <span className="ueep-connector" />
              <span className="ueep-node">E</span>
              <span className="ueep-connector" />
              <span className="ueep-node">P</span>
            </div>
          </div>
        </div>
      </div>

      {isOpen && <div className="backdrop" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default Navbar;
