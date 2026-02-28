import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ADD THIS
import axios from 'axios';
import { TOKEN_KEY } from '../App'; // Import the token key

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

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

  // Check if already logged in
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

  // If user is logged in, show profile with button to enter voice room
  if (user) {
    return (
      <div className="auth-container" style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>Welcome, {user.first_name || user.username}!</h2>
          
          <div style={styles.profileInfo}>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.profile?.role || user.role}</p>
            {user.profile?.is_premium && <p style={styles.premium}>⭐ Premium Member</p>}
          </div>

          {/* Button to enter voice chat */}
          <button 
            onClick={() => navigate('/live-voice')} 
            style={{...styles.button, marginBottom: '10px', background: 'linear-gradient(135deg, #00d9ff, #9d4edd)'}}
          >
            🎙️ Enter Voice Chat Room
          </button>

          <button 
            onClick={handleLogout} 
            disabled={loading}
            style={styles.logoutButton}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
          
          {success && <p style={styles.success}>{success}</p>}
        </div>
      </div>
    );
  }

  // Show login/signup form
  return (
    <div className="auth-container" style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</h2>
        
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <>
              <div style={styles.inputGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="John"
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Doe"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="learner">Learner</option>
                  <option value="trainer">Trainer</option>
                </select>
              </div>
            </>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                style={styles.input}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <p style={styles.toggle}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                email: '',
                password: '',
                confirm_password: '',
                first_name: '',
                last_name: '',
                role: 'learner',
              });
            }}
            style={styles.toggleButton}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f6fa',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '30px',
    fontSize: '28px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  logoutButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  toggle: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666',
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#3498db',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '14px',
  },
  error: {
    color: '#e74c3c',
    backgroundColor: '#fdf2f2',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  success: {
    color: '#27ae60',
    backgroundColor: '#f2fdf5',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  profileInfo: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  premium: {
    color: '#f39c12',
    fontWeight: 'bold',
  },
};

export default LoginSignupLogout;