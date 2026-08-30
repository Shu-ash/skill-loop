// src/components/SignupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

export default function SignupForm({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agreeTerms) {
      setError('Please agree to Terms of Service & Privacy Policy.');
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !password || !firstName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      localStorage.removeItem('skillloop_admin');

      // 2-Second Account Creation Experience
      const [response] = await Promise.all([
        fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: cleanEmail,
            password,
            termsAccepted: true
          })
        }),
        new Promise((resolve) => setTimeout(resolve, 2000))
      ]);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create account. Please check your information.');
      }

      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
      }
      if (data.data?.user) {
        localStorage.setItem('skillloop_user', JSON.stringify(data.data.user));
      }

      navigate('/onboarding', { replace: true });

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-fade-form">
      {error && (
        <div className="onboarding-error-banner profile-save-banner margin-bottom-xs" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.86rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Name Row */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">First name *</label>
          <input
            className="form-input"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Last name</label>
          <input
            className="form-input"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            disabled={loading}
          />
        </div>
      </div>

      {/* Email */}
      <div className="form-group">
        <label className="form-label">Email address *</label>
        <input
          className="form-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          disabled={loading}
          autoComplete="email"
        />
      </div>

      {/* Password */}
      <div className="form-group">
        <label className="form-label">Password *</label>
        <div className="password-input-wrap">
          <input
            className="form-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password (6+ chars)"
            required
            disabled={loading}
            autoComplete="new-password"
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

      {/* Terms & Privacy */}
      <div className="auth-extra-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            required
            disabled={loading}
          />
          I agree to <a href="/terms" target="_blank" rel="noreferrer">Terms</a> &amp; <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>
        </label>
      </div>

      <button type="submit" className="btn btn-primary btn-full btn-auth-submit" disabled={loading}>
        {loading ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="auth-spinner" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spinAuth 0.8s linear infinite' }}></span>
            Creating account...
          </span>
        ) : (
          'Create my account →'
        )}
      </button>

      {/* Bottom Switch Prompt */}
      {onSwitchToLogin && (
        <div className="auth-switch-prompt">
          <span>Already have an account?</span>{' '}
          <button type="button" className="auth-switch-btn" onClick={onSwitchToLogin} disabled={loading}>
            Log in
          </button>
        </div>
      )}
    </form>
  );
}
