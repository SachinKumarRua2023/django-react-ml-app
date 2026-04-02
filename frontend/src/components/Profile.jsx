import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://django-react-ml-app.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cosmos_auth_token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    profile_picture: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'password'

  useEffect(() => {
    const userData = localStorage.getItem('cosmos_user');
    const token = localStorage.getItem('cosmos_auth_token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData(prev => ({
      ...prev,
      first_name: parsedUser.first_name || '',
      last_name: parsedUser.last_name || '',
      profile_picture: parsedUser.profile_picture || ''
    }));
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name
      };

      if (formData.profile_picture) {
        updateData.profile_picture = formData.profile_picture;
      }

      const response = await api.post('/api/auth/profile/update/', updateData);
      
      // Update local storage
      localStorage.setItem('cosmos_user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password !== formData.confirm_password) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/profile/update/', {
        password: formData.password
      });
      
      // Update local storage
      localStorage.setItem('cosmos_user', JSON.stringify(response.data.user));
      
      setFormData(prev => ({ ...prev, password: '', confirm_password: '' }));
      setMessage({ type: 'success', text: 'Password updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cosmos_auth_token');
    localStorage.removeItem('cosmos_user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="profile-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0d0d2a 100%)',
      padding: '40px 20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(10,10,30,0.95)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '16px',
          padding: '30px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: user.profile_picture 
              ? `url(${user.profile_picture}) center/cover`
              : 'linear-gradient(135deg, #7c3aed, #00d4ff)',
            border: '3px solid rgba(124,58,237,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            fontFamily: 'Orbitron, sans-serif',
            color: '#fff'
          }}>
            {!user.profile_picture && (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '28px',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '8px'
            }}>
              {user.first_name} {user.last_name}
            </h1>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '4px'
            }}>
              {user.email}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#00d4ff',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Role: {user.profile?.role || user.role || 'Learner'}
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.5)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'profile' ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.1)',
              border: `1px solid ${activeTab === 'profile' ? '#7c3aed' : 'rgba(124,58,237,0.3)'}`,
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'password' ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.1)',
              border: `1px solid ${activeTab === 'password' ? '#7c3aed' : 'rgba(124,58,237,0.3)'}`,
              borderRadius: '8px',
              color: '#fff',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Change Password
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div style={{
            background: message.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            color: message.type === 'success' ? '#22c55e' : '#ef4444',
            marginBottom: '20px'
          }}>
            {message.text}
          </div>
        )}

        {/* Profile Form */}
        {activeTab === 'profile' && (
          <div style={{
            background: 'rgba(10,10,30,0.95)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '16px',
            padding: '30px'
          }}>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '20px',
              color: '#fff',
              marginBottom: '24px'
            }}>
              Update Profile
            </h2>

            <form onSubmit={handleUpdateProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '8px'
                  }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(124,58,237,0.3)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  Profile Picture URL (optional)
                </label>
                <input
                  type="url"
                  name="profile_picture"
                  value={formData.profile_picture}
                  onChange={handleChange}
                  placeholder="https://example.com/your-image.jpg"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #7c3aed, #00d4ff)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {/* Password Form */}
        {activeTab === 'password' && (
          <div style={{
            background: 'rgba(10,10,30,0.95)',
            border: '1px solid rgba(124,58,237,0.3)',
            borderRadius: '16px',
            padding: '30px'
          }}>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '20px',
              color: '#fff',
              marginBottom: '24px'
            }}>
              Change Password
            </h2>

            {user.is_google_user && (
              <div style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.3)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#00d4ff',
                marginBottom: '20px'
              }}>
                You signed up with Google. Set a password to enable email login.
              </div>
            )}

            <form onSubmit={handleUpdatePassword}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '8px'
                }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(124,58,237,0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 32px',
                  background: 'linear-gradient(135deg, #7c3aed, #00d4ff)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
