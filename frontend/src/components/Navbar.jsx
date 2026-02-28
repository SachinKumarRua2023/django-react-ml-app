import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'https://django-react-ml-app.onrender.com  ';
axios.defaults.baseURL = API_URL;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeGlow, setActiveGlow] = useState(0);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false); // NEW: Track if auth check completed
  const location = useLocation();
  const navigate = useNavigate();

  // ALL PUBLIC NAV ITEMS - Trainer KPI is public
  const navItems = [
    { name: 'Master Rua', path: '/', icon: '◈', color: '#00ffff' },
    { name: 'Courses', path: '/syllabus', icon: '◉', color: '#ff00ff' },
    { name: 'ML Predictor', path: '/ml', icon: '◆', color: '#00ff88' },
    { name: 'Employees', path: '/employees', icon: '◊', color: '#ffaa00' },
    { name: 'Trainer KPI', path: '/trainer-kpi', icon: '★', color: '#fbbf24' }, // PUBLIC - No auth required
  ];

  // Check auth status immediately on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('auth_token');
        const savedUser = localStorage.getItem('user');
        
        console.log('Auth check - Token exists:', !!token); // DEBUG
        
        if (token && savedUser) {
          axios.defaults.headers.common['Authorization'] = `Token ${token}`;
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
          console.log('User authenticated:', JSON.parse(savedUser).email); // DEBUG
        } else {
          setUser(null);
          setIsAuthenticated(false);
          console.log('User not authenticated'); // DEBUG
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true); // Mark auth check as complete
      }
    };
    
    checkAuth();
  }, []);

  // Listen for auth changes from LoginSignupLogout component
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage changed, rechecking auth...'); // DEBUG
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    // Listen for both storage events and custom events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange); // Custom event
    
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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
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

  // Don't render auth buttons until initial auth check is complete (prevents flash)
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
            {navItems.map((item, index) => (
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
          
          {/* Desktop Navigation - ALL PUBLIC ITEMS */}
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
            
            {/* Live Voice - ONLY SHOW WHEN AUTHENTICATED */}
            {isAuthenticated && (
              <Link
                to="/live-voice"
                className={`nav-link ${isActive('/live-voice') ? 'active' : ''}`}
                onClick={handleNavClick}
                style={{ '--item-color': '#ff0000' }}
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
              </Link>
            )}
          </div>

          {/* RIGHT SIDE: AI Status + Auth Button */}
          <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
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

            {/* AUTH SECTION - SHOW LOGIN WHEN NOT AUTHENTICATED */}
            {!isAuthenticated ? (
              /* LOGIN BUTTON - VISIBLE WHEN NOT LOGGED IN */
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
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 217, 255, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 217, 255, 0.3)';
                }}
              >
                <span>🔐</span>
                <span>Login</span>
              </Link>
            ) : (
              /* LOGOUT/USER - VISIBLE WHEN LOGGED IN */
              <div className="auth-section" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* User Avatar */}
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
                
                {/* Logout Button */}
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
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <span>⎋</span>
                  <span className="desktop-only">Logout</span>
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
          <button className="mobile-close" onClick={() => setIsOpen(false)}>✕</button>
        </div>
        
        <div className="mobile-nav">
          {/* Public nav items */}
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
          
          {/* Live Voice - Mobile */}
          {isAuthenticated && (
            <Link
              to="/live-voice"
              className={`mobile-link ${isActive('/live-voice') ? 'active' : ''}`}
              onClick={handleNavClick}
              style={{ '--item-color': '#ff0000', animationDelay: `${navItems.length * 0.1}s` }}
            >
              <span className="mobile-icon-bg">
                <span className="mobile-icon">🔴</span>
              </span>
              <div className="mobile-link-content">
                <span className="mobile-text">Live Voice</span>
                {isActive('/live-voice') && <span className="mobile-active-badge">Active</span>}
              </div>
              <span className="mobile-arrow">→</span>
            </Link>
          )}

          {/* Mobile Auth Section */}
          <div className="mobile-auth-section" style={{ 
            marginTop: '20px', 
            paddingTop: '20px', 
            borderTop: '1px solid rgba(255,255,255,0.1)' 
          }}>
            {!isAuthenticated ? (
              /* LOGIN BUTTON - MOBILE */
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
              /* LOGOUT - MOBILE */
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
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
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