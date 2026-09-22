// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ForgotPasswordModal from './ForgotPasswordModal';

const API_BASE_URL = 'http://localhost:5000/api';

export default function LoginForm({ onSwitchToSignup }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeRoleTab, setActiveRoleTab] = useState('user'); // 'user' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResetSuccessMessage('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      // 2-Second Authentication Experience
      const [response] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email: cleanEmail, password })
        }),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid email or password. Please check your credentials.');
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
      <form onSubmit={handleSubmit} className="auth-fade-form">
        {/* User vs Admin Role Switcher */}
        <div className="login-role-switcher">
          <button
            type="button"
            className={`role-tab-btn ${activeRoleTab === 'user' ? 'active' : ''}`}
            onClick={() => { setActiveRoleTab('user'); setError(''); setResetSuccessMessage(''); }}
          >
            👤 User Login
          </button>
          <button
            type="button"
            className={`role-tab-btn ${activeRoleTab === 'admin' ? 'active' : ''}`}
            onClick={() => { setActiveRoleTab('admin'); setError(''); setResetSuccessMessage(''); }}
          >
            🛡️ Admin Login
          </button>
        </div>

        {activeRoleTab === 'admin' && (
          <div className="admin-access-notice glass-panel margin-bottom-xs">
            🔒 <strong>System Moderator Portal:</strong> Log in with registered administrator credentials.
          </div>
        )}

        {resetSuccessMessage && (
          <div className="user-modal-success margin-bottom-xs" style={{ padding: '10px 14px', borderRadius: '12px', fontSize: '13px' }}>
            ✅ {resetSuccessMessage}
          </div>
        )}

        {error && (
          <div className="onboarding-error-banner profile-save-banner margin-bottom-xs user-modal-error">
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
            disabled={loading}
          />
        </div>

        {/* Password Input */}
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
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
              disabled={loading}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {/* Remember & Forgot Password */}
        <div className="auth-extra-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            Remember me
          </label>
          <button
            type="button"
            className="forgot-link"
            onClick={() => { setError(''); setIsForgotModalOpen(true); }}
          >
            Forgot password?
          </button>
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-auth-submit" disabled={loading}>
          {loading ? (
            <span className="btn-auth-submit-loading">
              <span className="auth-spinner auth-spinner-circle"></span>
              Authenticating credentials...
            </span>
          ) : activeRoleTab === 'admin' ? (
            'Log in to Admin Panel →'
          ) : (
            'Log in with Password →'
          )}
        </button>

        {/* Bottom Switch Prompt */}
        {activeRoleTab === 'user' && onSwitchToSignup && (
          <div className="auth-switch-prompt">
            <span>Don't have an account?</span>{' '}
            <button type="button" className="auth-switch-btn" onClick={onSwitchToSignup} disabled={loading}>
              Sign up
            </button>
          </div>
        )}
      </form>

      {/* Forgot Password OTP Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onPasswordResetSuccess={() => {
          setIsForgotModalOpen(false);
          setResetSuccessMessage('Your password was successfully updated. You can now log in!');
        }}
      />
    </>
  );
}
