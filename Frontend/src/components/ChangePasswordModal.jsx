// src/components/ChangePasswordModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ChangePasswordModal.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function ChangePasswordModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('current'); // 'current' | 'otp'
  const [currentPassword, setCurrentPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // 45s Resend Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSwitchMode = async (targetMode) => {
    if (mode === targetMode) return;
    setError('');
    setSuccess('');
    setInfoMessage('');
    setMode(targetMode);

    if (targetMode === 'otp' && !otp) {
      await sendOtpCode();
    }
  };

  const sendOtpCode = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('You must be logged in to change your password.');
      return;
    }

    try {
      setSendingOtp(true);
      setError('');

      const response = await fetch(`${API_BASE_URL}/users/send-password-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send verification code.');
      }

      setInfoMessage(`We've sent a 6-digit code to ${data.data?.email || 'your email'}.`);
      setCooldown(45);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'otp' && (!otp || otp.trim().length !== 6)) {
      setError('Please enter the full 6-digit verification code from your email.');
      return;
    }

    if (mode === 'current' && !currentPassword) {
      setError('Please enter your current password or click "Try another way".');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('You must be logged in to change your password.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        newPassword,
        confirmPassword
      };

      if (mode === 'otp') {
        payload.otp = otp.trim();
      } else {
        payload.currentPassword = currentPassword;
      }

      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update password');
      }

      setSuccess('Your password has been updated successfully! 🔒');
      setTimeout(() => {
        handleModalClose();
      }, 1600);

    } catch (err) {
      setError(err.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    onClose();
    setTimeout(() => {
      setMode('current');
      setCurrentPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
      setInfoMessage('');
    }, 200);
  };

  const isPasswordValid = newPassword.length >= 6;

  const modalJSX = (
    <div className="cpm-overlay" onClick={handleModalClose}>
      <div className="cpm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cpm-header">
          <div className="cpm-header-lead">
            <div className="cpm-icon-badge">
              {mode === 'otp' ? '✉️' : '🔒'}
            </div>
            <div>
              <h3 className="cpm-title">
                {mode === 'otp' ? 'Verify via Email OTP' : 'Change Password'}
              </h3>
              <p className="cpm-subtitle">
                {mode === 'otp'
                  ? 'Enter 6-digit code sent to your email'
                  : 'Update your login credentials securely'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="cpm-close-btn"
            onClick={handleModalClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="cpm-mode-switcher">
          <button
            type="button"
            className={`cpm-mode-tab ${mode === 'current' ? 'active' : ''}`}
            onClick={() => handleSwitchMode('current')}
          >
            🔑 Current Password
          </button>
          <button
            type="button"
            className={`cpm-mode-tab ${mode === 'otp' ? 'active' : ''}`}
            onClick={() => handleSwitchMode('otp')}
          >
            ✉️ Try Email OTP
          </button>
        </div>

        {/* Alerts & Banners */}
        {error && (
          <div className="cpm-banner cpm-banner-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="cpm-banner cpm-banner-success">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {infoMessage && mode === 'otp' && !error && !success && (
          <div className="cpm-banner cpm-banner-info">
            <span>📬</span>
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ================= OPTION 1: CURRENT PASSWORD ================= */}
          {mode === 'current' && (
            <div className="cpm-form-group">
              <div className="cpm-label-row">
                <label className="cpm-label">Current Password *</label>
              </div>
              <div className="cpm-input-wrap">
                <input
                  className="cpm-input"
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="cpm-eye-btn"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                >
                  {showCurrentPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}

          {/* ================= OPTION 2: EMAIL OTP ================= */}
          {mode === 'otp' && (
            <div className="cpm-form-group">
              <div className="cpm-label-row">
                <label className="cpm-label">6-Digit Verification Code *</label>
                <button
                  type="button"
                  className="cpm-resend-btn"
                  onClick={sendOtpCode}
                  disabled={cooldown > 0 || sendingOtp || loading}
                >
                  {sendingOtp
                    ? 'Sending...'
                    : cooldown > 0
                      ? `Resend in ${cooldown}s`
                      : 'Resend OTP ✉️'}
                </button>
              </div>
              <div className="cpm-input-wrap">
                <input
                  className="cpm-input code-style"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {/* ================= NEW PASSWORD ================= */}
          <div className="cpm-form-group">
            <div className="cpm-label-row">
              <label className="cpm-label">New Password *</label>
              {newPassword.length > 0 && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: isPasswordValid ? '#10b981' : '#ef4444'
                  }}
                >
                  {isPasswordValid ? '✓ 6+ chars OK' : `${newPassword.length}/6 chars`}
                </span>
              )}
            </div>
            <div className="cpm-input-wrap">
              <input
                className="cpm-input"
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="cpm-eye-btn"
                onClick={() => setShowNewPass(!showNewPass)}
              >
                {showNewPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* ================= CONFIRM PASSWORD ================= */}
          <div className="cpm-form-group">
            <div className="cpm-label-row">
              <label className="cpm-label">Confirm New Password *</label>
              {confirmPassword.length > 0 && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: newPassword === confirmPassword ? '#10b981' : '#ef4444'
                  }}
                >
                  {newPassword === confirmPassword ? '✓ Match' : 'Mismatch'}
                </span>
              )}
            </div>
            <div className="cpm-input-wrap">
              <input
                className="cpm-input"
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="cpm-eye-btn"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              >
                {showConfirmPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="cpm-actions">
            <button
              type="button"
              className="cpm-btn-cancel"
              onClick={handleModalClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cpm-btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="auth-spinner auth-spinner-circle" style={{ width: 14, height: 14 }}></span>
                  Updating...
                </>
              ) : mode === 'otp' ? (
                'Verify OTP & Save 🔒'
              ) : (
                'Save New Password 🔒'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : null;
}
