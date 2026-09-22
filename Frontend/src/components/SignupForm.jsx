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
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Compute live password strength & requirements
  const passwordLength = password.length;
  const isLengthValid = passwordLength >= 6;
  const hasLettersAndNumbers = /[a-zA-Z]/.test(password) && /\d/.test(password);
  const hasSpecialOrUpper = /[!@#$%^&*(),.?":{}|<>]/.test(password) || /[A-Z]/.test(password);

  let strengthScore = 0;
  if (passwordLength > 0) strengthScore = 1;
  if (isLengthValid) strengthScore = 2;
  if (isLengthValid && hasLettersAndNumbers) strengthScore = 3;
  if (isLengthValid && hasLettersAndNumbers && hasSpecialOrUpper && passwordLength >= 8) strengthScore = 4;

  const getStrengthLabel = () => {
    if (strengthScore <= 1) return { label: 'Too short', class: 'active-weak' };
    if (strengthScore === 2) return { label: 'Fair (6+ chars)', class: 'active-fair' };
    if (strengthScore === 3) return { label: 'Good', class: 'active-good' };
    return { label: 'Strong', class: 'active-strong' };
  };

  const strengthInfo = getStrengthLabel();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password || !firstName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setPasswordTouched(true);
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to Terms of Service & Privacy Policy.');
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

      if (data.requiresVerification || !data.data?.accessToken) {
        // Redirect to Email OTP Verification Page
        navigate(`/verify-email?email=${encodeURIComponent(cleanEmail)}`, {
          replace: true,
          state: {
            email: cleanEmail,
            message: data.message || `Verification code sent to ${cleanEmail}`
          }
        });
        return;
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
        <div className="onboarding-error-banner profile-save-banner margin-bottom-xs user-modal-error">
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
            className={`form-input ${passwordTouched && !isLengthValid && password.length > 0 ? 'input-invalid' : isLengthValid ? 'input-valid' : ''}`}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordTouched(true);
              if (error) setError('');
            }}
            onBlur={() => setPasswordTouched(true)}
            placeholder="Create a password (min. 6 characters)"
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

        {/* Live Password Requirement & Strength Box */}
        {(passwordTouched || password.length > 0) && (
          <div className="password-requirements-box">
            <div className="password-strength-bars">
              <div className={`password-strength-bar ${strengthScore >= 1 ? strengthInfo.class : ''}`}></div>
              <div className={`password-strength-bar ${strengthScore >= 2 ? strengthInfo.class : ''}`}></div>
              <div className={`password-strength-bar ${strengthScore >= 3 ? strengthInfo.class : ''}`}></div>
              <div className={`password-strength-bar ${strengthScore >= 4 ? strengthInfo.class : ''}`}></div>
            </div>

            <div className={`password-req-item ${isLengthValid ? 'valid' : 'invalid'}`}>
              <span>
                {isLengthValid ? '✓' : '•'} Minimum 6 characters required
              </span>
              <span className={`password-req-badge ${isLengthValid ? 'valid' : 'invalid'}`}>
                {isLengthValid ? `${passwordLength} chars (OK)` : `${passwordLength}/6 chars`}
              </span>
            </div>
          </div>
        )}
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
          <span className="btn-auth-submit-loading">
            <span className="auth-spinner auth-spinner-circle"></span>
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
