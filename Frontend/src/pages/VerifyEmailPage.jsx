// src/pages/VerifyEmailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './VerifyEmailPage.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const initialEmail = location.state?.email || searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [editingEmail, setEditingEmail] = useState(!initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || (initialEmail ? `Verification code sent to ${initialEmail}` : '')
  );

  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 45-second countdown timer for resend cooldown
  useEffect(() => {
    if (countdown > 0) {
      setCanResend(false);
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Handle digit change in 6-box inputs
  const handleChange = (index, value) => {
    // Only accept alphanumeric / digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleaned.slice(-1); // Take last character
    setOtp(newOtp);
    setError('');

    // Advance focus to next input
    if (cleaned && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  // Handle paste full 6-digit OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    setError('');

    const nextFocusIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[nextFocusIndex]) {
      inputRefs.current[nextFocusIndex].focus();
    }
  };

  // Verify OTP submission
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otp.join('').trim();

    if (!email.trim()) {
      setError('Please enter your email address.');
      setEditingEmail(true);
      return;
    }

    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          otp: fullOtp
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid verification code. Please check your email.');
      }

      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
      }
      if (data.data?.user) {
        localStorage.setItem('skillloop_user', JSON.stringify(data.data.user));
      }

      setSuccessMessage('🎉 Email verified successfully! Redirecting...');
      
      setTimeout(() => {
        if (data.data?.user?.onboardingCompleted) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      }, 1000);

    } catch (err) {
      console.error('Email verification error:', err);
      setError(err.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResend = async () => {
    if (!canResend || resending || !email.trim()) return;

    setResending(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          purpose: 'verify_email'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Could not resend code. Please try again later.');
      }

      setSuccessMessage(`A fresh 6-digit code was sent to ${email.trim()}`);
      setCountdown(45);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();

    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.message || 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="verify-email-page-wrapper">
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <header className="navbar">
        <Link className="brand-logo" to="/">
          <div className="brand-icon">
            <span className="circle-violet"></span>
            <span className="circle-mint"></span>
          </div>
          <span className="brand-name">Skill<span>Loop</span></span>
        </Link>
        <div className="nav-actions">
          <Link className="btn btn-secondary btn-pill-sm" to="/login">
            &larr; Back to Login
          </Link>
        </div>
      </header>

      <main className="verify-email-container">
        <div className="verify-card glass-panel">
          <div className="verify-icon-bubble">✉️</div>

          <h2 className="verify-title">Verify your email</h2>

          {!editingEmail ? (
            <p className="verify-subtitle">
              We sent a 6-digit verification code to<br />
              <span className="verify-email-highlight">{email}</span>
            </p>
          ) : (
            <div className="form-group margin-bottom-sm">
              <label className="form-label" style={{ textAlign: 'left' }}>Email address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>
          )}

          {error && (
            <div className="onboarding-error-banner profile-save-banner margin-bottom-sm user-modal-error">
              ⚠️ {error}
            </div>
          )}

          {successMessage && !error && (
            <div className="profile-save-banner margin-bottom-sm" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
              ✅ {successMessage}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className="verify-otp-inputs" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  className={`otp-box-input ${digit ? 'has-value' : ''}`}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-auth-submit"
              disabled={loading || otp.join('').length !== 6}
            >
              {loading ? (
                <span className="btn-auth-submit-loading">
                  <span className="auth-spinner auth-spinner-circle"></span>
                  Verifying code...
                </span>
              ) : (
                'Verify & Activate Account →'
              )}
            </button>
          </form>

          <div className="verify-resend-row">
            <span>Didn't receive the code?</span>
            <button
              type="button"
              className="resend-btn"
              onClick={handleResend}
              disabled={!canResend || resending}
            >
              {resending ? 'Sending...' : canResend ? 'Resend OTP' : `Resend in ${countdown}s`}
            </button>
          </div>

          <div className="verify-change-email-row">
            <span
              className="verify-change-email-link"
              onClick={() => setEditingEmail(!editingEmail)}
            >
              {editingEmail ? 'Confirm Email' : 'Wrong email address? Change'}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
