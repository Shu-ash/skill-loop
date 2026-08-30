// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import OtpInputModal from './OtpInputModal';
import ForgotPasswordModal from './ForgotPasswordModal';

const API_BASE_URL = 'http://localhost:5000/api';

export default function LoginForm({ onSwitchToSignup }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeRoleTab, setActiveRoleTab] = useState('user'); // 'user' or 'admin'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Send OTP for Login
  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, purpose: 'login' })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No account found with this email.');
      }

      setShowOtpModal(true);
      setOtpError('');
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  // Verify Login OTP
  const handleVerifyLoginOtp = async (otpCode) => {
    setOtpLoading(true);
    setOtpError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          otp: otpCode
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid or expired verification code.');
      }

      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
      }
      if (data.data?.user) {
        localStorage.setItem('skillloop_user', JSON.stringify(data.data.user));
      }

      setShowOtpModal(false);
      const redirectPath = location.state?.from || '/dashboard';
      navigate(redirectPath, { replace: true });

    } catch (err) {
      setOtpError(err.message || 'Failed to verify OTP code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Password Login Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password.');
      }

      const { accessToken, user } = data.data;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }

      if (activeRoleTab === 'admin') {
        if (user.role !== 'admin' && user.role !== 'superadmin') {
          throw new Error('Access denied. This account does not have Admin moderator privileges.');
        }
        localStorage.setItem('skillloop_admin', JSON.stringify(user));
        localStorage.removeItem('skillloop_user');
        navigate('/admin', { replace: true });
      } else {
        localStorage.setItem('skillloop_user', JSON.stringify(user));
        localStorage.removeItem('skillloop_admin');
        const redirectPath = location.state?.from || '/dashboard';
        navigate(redirectPath, { replace: true });
      }

    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={loginMethod === 'otp' ? handleSendLoginOtp : handlePasswordSubmit} className="auth-fade-form">
        {/* User vs Admin Role Switcher */}
        <div className="login-role-switcher">
          <button
            type="button"
            className={`role-tab-btn ${activeRoleTab === 'user' ? 'active' : ''}`}
            onClick={() => { setActiveRoleTab('user'); setError(''); }}
          >
            👤 User Login
          </button>
          <button
            type="button"
            className={`role-tab-btn ${activeRoleTab === 'admin' ? 'active' : ''}`}
            onClick={() => { setActiveRoleTab('admin'); setError(''); setLoginMethod('password'); }}
          >
            🛡️ Admin Login
          </button>
        </div>

        {/* Method Switcher for User (Password vs OTP) */}
        {activeRoleTab === 'user' && (
          <div className="auth-method-switcher">
            <button
              type="button"
              className={`method-tab-btn ${loginMethod === 'password' ? 'active' : ''}`}
              onClick={() => { setLoginMethod('password'); setError(''); }}
            >
              <span>🔑</span> Password
            </button>
            <button
              type="button"
              className={`method-tab-btn ${loginMethod === 'otp' ? 'active' : ''}`}
              onClick={() => { setLoginMethod('otp'); setError(''); }}
            >
              <span>✉️</span> Email OTP
            </button>
          </div>
        )}

        {activeRoleTab === 'admin' && (
          <div className="admin-access-notice glass-panel margin-bottom-xs">
            🔒 <strong>System Moderator Portal:</strong> Log in with registered administrator credentials.
          </div>
        )}

        {error && (
          <div className="onboarding-error-banner profile-save-banner margin-bottom-xs" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.86rem', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Email Input */}
        <div className="form-group">
          <label className="form-label">
            {activeRoleTab === 'admin' ? 'Admin Email' : 'Email address'}
          </label>
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={activeRoleTab === 'admin' ? 'admin@skillloop.com' : 'Enter your registered email'}
            required
            autoComplete="email"
          />
        </div>

        {/* Password Input (if Password method selected) */}
        {loginMethod === 'password' && (
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrap">
              <input
                className="form-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        )}

        {/* Remember & Forgot Password Link */}
        <div className="auth-extra-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <button
            type="button"
            className="forgot-link"
            onClick={() => setShowForgotModal(true)}
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-auth-submit" disabled={loading}>
          {loading 
            ? 'Processing...' 
            : loginMethod === 'otp' 
              ? 'Send 6-Digit OTP ✉️' 
              : activeRoleTab === 'admin' 
                ? 'Log in to Admin Panel →' 
                : 'Log in →'}
        </button>

        {/* Bottom Switch Prompt */}
        {activeRoleTab === 'user' && onSwitchToSignup && (
          <div className="auth-switch-prompt">
            <span>Don't have an account?</span>{' '}
            <button type="button" className="auth-switch-btn" onClick={onSwitchToSignup}>
              Sign up
            </button>
          </div>
        )}
      </form>

      {/* 6-Digit OTP Verification Modal for Login */}
      <OtpInputModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={email}
        purpose="login"
        onVerify={handleVerifyLoginOtp}
        onResend={handleSendLoginOtp}
        loading={otpLoading}
        error={otpError}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        onPasswordResetSuccess={() => {
          setLoginMethod('password');
        }}
      />
    </>
  );
}
