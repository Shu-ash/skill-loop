// src/components/ForgotPasswordModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const API_BASE_URL = 'http://localhost:5000/api';

export default function ForgotPasswordModal({ isOpen, onClose, onPasswordResetSuccess }) {
  const [step, setStep] = useState('request'); // 'request' | 'verify' | 'success'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setError('');
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No account found with this email.');
      }

      setStep('verify');
    } catch (err) {
      setError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.trim().length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Invalid or expired OTP code.');
      }

      setSuccessMsg('Your password has been reset successfully!');
      setStep('success');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('request');
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const modalJSX = (
    <div 
      className="modal-overlay modal-overlay-portal" 
      onClick={handleClose}
    >
      <div 
        className="glass-panel clay-card-3d user-modal-sm" 
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="user-modal-header">
          <h3 className="user-modal-title">
            {step === 'success' ? '🎉 Password Reset' : '🔑 Forgot Password'}
          </h3>
          <button type="button" className="close-modal-btn user-modal-close-btn" onClick={handleClose}>✕</button>
        </div>

        {error && (
          <div className="user-modal-error">
            ⚠️ {error}
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleSendResetOtp}>
            <p className="user-modal-subtitle">
              Enter your registered email and we'll send a 6-digit verification code to reset your password.
            </p>

            <div className="form-group user-modal-form-group spacing-lg">
              <label className="form-label user-modal-label">Email Address</label>
              <input
                className="form-input user-modal-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full user-modal-btn-full" disabled={loading}>
              {loading ? 'Sending Code...' : 'Send Reset Code ✉️'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleResetPassword}>
            <p className="user-modal-subtitle">
              Enter the 6-digit OTP code sent to <strong>{email}</strong> and set your new password:
            </p>

            <div className="form-group user-modal-form-group">
              <label className="form-label user-modal-label">6-Digit OTP Code</label>
              <input
                className="form-input user-modal-input code-style"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g. 123456"
                required
              />
            </div>

            <div className="form-group user-modal-form-group">
              <label className="form-label user-modal-label">New Password</label>
              <input
                className="form-input user-modal-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="form-group user-modal-form-group spacing-lg">
              <label className="form-label user-modal-label">Confirm New Password</label>
              <input
                className="form-input user-modal-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full user-modal-btn-full" disabled={loading}>
              {loading ? 'Updating Password...' : 'Reset Password & Save 🔒'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="user-modal-success-state">
            <span className="user-modal-success-icon">✅</span>
            <p className="user-modal-success-text">
              {successMsg}
            </p>
            <button 
              type="button" 
              className="btn btn-primary btn-full user-modal-btn-full" 
              onClick={() => { handleClose(); if (onPasswordResetSuccess) onPasswordResetSuccess(); }}
            >
              Log in with New Password →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : null;
}
