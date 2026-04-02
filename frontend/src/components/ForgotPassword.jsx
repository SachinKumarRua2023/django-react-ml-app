import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'https://django-react-ml-app.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/password-reset/request/', { email });
      setSuccess('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/password-reset/verify/', {
        email,
        otp,
        new_password: newPassword
      });
      
      // Store token and user data
      localStorage.setItem('cosmos_auth_token', response.data.token);
      localStorage.setItem('cosmos_user', JSON.stringify(response.data.user));
      
      setSuccess('Password reset successful! Redirecting...');
      
      setTimeout(() => {
        window.location.href = '/profile';
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 50%, #0d0d2a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(10,10,30,0.95)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '16px',
        padding: '40px',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '28px'
        }}>
          <h1 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '24px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '8px'
          }}>
            {step === 1 && 'Forgot Password?'}
            {step === 2 && 'Enter OTP'}
            {step === 3 && 'Set New Password'}
          </h1>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            {step === 1 && 'Enter your email to receive OTP'}
            {step === 2 && `Enter the 6-digit OTP sent to ${email}`}
            {step === 3 && 'Create a new password for your account'}
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            color: '#ef4444',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            color: '#22c55e',
            marginBottom: '20px'
          }}>
            {success}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestOTP}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
                width: '100%',
                padding: '14px',
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
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '8px'
              }}>
                6-Digit OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                required
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(124,58,237,0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '18px',
                  letterSpacing: '8px',
                  textAlign: 'center',
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
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              disabled={loading || otp.length !== 6}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #7c3aed, #00d4ff)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading || otp.length !== 6 ? 0.7 : 1
              }}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#00d4ff',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
