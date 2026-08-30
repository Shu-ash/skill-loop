// src/components/SignupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OtpInputModal from './OtpInputModal';

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

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Step 1: Request Email OTP for Signup
  const handleInitiateSignup = async (e) => {
    if (e) e.preventDefault();
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
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: `${firstName} ${lastName}`.trim(),
          purpose: 'register'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setShowOtpModal(true);
      setOtpError('');
    } catch (err) {
      console.error('Signup OTP error:', err);
      setError(err.message || 'Failed to send OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Create Account in MongoDB
  const handleVerifySignupOtp = async (otpCode) => {
    setOtpLoading(true);
    setOtpError('');

    try {
      localStorage.removeItem('skillloop_admin');

      const response = await fetch(`${API_BASE_URL}/auth/verify-register-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          otp: otpCode
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid or expired OTP code.');
      }

      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
      }
      if (data.data?.user) {
        localStorage.setItem('skillloop_user', JSON.stringify(data.data.user));
      }

      setShowOtpModal(false);
      navigate('/onboarding', { replace: true });

    } catch (err) {
      console.error('Verify register error:', err);
      setOtpError(err.message || 'Verification failed. Please check the code.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleInitiateSignup} className="auth-fade-form">
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
          {loading ? 'Sending Verification Code...' : 'Verify Email & Create Account ✉️'}
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

      {/* 6-Digit Email OTP Verification Modal */}
      <OtpInputModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={email}
        purpose="register"
        onVerify={handleVerifySignupOtp}
        onResend={() => handleInitiateSignup(null)}
        loading={otpLoading}
        error={otpError}
      />
    </>
  );
}
