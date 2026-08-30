// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const [loading, setLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowForgotNotice(false);

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
    <form onSubmit={handleSubmit} className="auth-fade-form">
      {/* User vs Admin Role Switcher */}
      <div className="login-role-switcher">
        <button
          type="button"
          className={`role-tab-btn ${activeRoleTab === 'user' ? 'active' : ''}`}
          onClick={() => { setActiveRoleTab('user'); setError(''); setShowForgotNotice(false); }}
        >
          👤 User Login
        </button>
        <button
          type="button"
          className={`role-tab-btn ${activeRoleTab === 'admin' ? 'active' : ''}`}
          onClick={() => { setActiveRoleTab('admin'); setError(''); setShowForgotNotice(false); }}
        >
          🛡️ Admin Login
        </button>
      </div>

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

      {showForgotNotice && (
        <div className="glass-panel margin-bottom-xs" style={{ background: 'rgba(108, 92, 231, 0.1)', border: '1px solid rgba(108, 92, 231, 0.25)', color: 'var(--violet-primary, #6c5ce7)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.84rem', lineHeight: '1.5' }}>
          💡 <strong>Need password help?</strong> Contact a platform administrator or register with a new account.
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
          onClick={() => setShowForgotNotice(true)}
        >
          Forgot password?
        </button>
      </div>

      <button type="submit" className="btn btn-primary btn-full btn-auth-submit" disabled={loading} style={{ position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="auth-spinner" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spinAuth 0.8s linear infinite' }}></span>
            Authenticating credentials...
          </span>
        ) : activeRoleTab === 'admin' ? (
          'Log in to Admin Panel →'
        ) : (
          'Log in →'
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
  );
}
