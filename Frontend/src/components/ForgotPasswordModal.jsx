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
      className="modal-overlay" 
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <div 
        className="glass-panel clay-card-3d" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '440px', width: '100%', padding: '2.2rem 2rem', borderRadius: '24px' }}
      >
        <div className="modal-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
            {step === 'success' ? '🎉 Password Reset' : '🔑 Forgot Password'}
          </h3>
          <button type="button" className="close-modal-btn" onClick={handleClose}>✕</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.65rem 0.85rem', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleSendResetOtp}>
            <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', margin: '0 0 1.2rem 0', lineHeight: '1.5' }}>
              Enter your registered email and we'll send a 6-digit verification code to reset your password.
            </p>

            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label className="form-label">Email Address</label>
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: '0.85rem', borderRadius: '14px', fontWeight: 700 }}>
              {loading ? 'Sending Code...' : 'Send Reset Code ✉️'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleResetPassword}>
            <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', margin: '0 0 1.2rem 0', lineHeight: '1.5' }}>
              Enter the 6-digit OTP code sent to <strong>{email}</strong> and set your new password:
            </p>

            <div className="form-group" style={{ marginBottom: '0.9rem' }}>
              <label className="form-label">6-Digit OTP Code</label>
              <input
                className="form-input"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g. 123456"
                required
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 800 }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0.9rem' }}>
              <label className="form-label">New Password</label>
              <input
                className="form-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label className="form-label">Confirm New Password</label>
              <input
                className="form-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ padding: '0.85rem', borderRadius: '14px', fontWeight: 700 }}>
              {loading ? 'Updating Password...' : 'Reset Password & Save 🔒'}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>✅</span>
            <p style={{ color: 'var(--mint-primary, #10b981)', fontWeight: 700, fontSize: '0.95rem', margin: '0 0 1.2rem 0' }}>
              {successMsg}
            </p>
            <button 
              type="button" 
              className="btn btn-primary btn-full" 
              onClick={() => { handleClose(); if (onPasswordResetSuccess) onPasswordResetSuccess(); }}
              style={{ padding: '0.85rem', borderRadius: '14px', fontWeight: 700 }}
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
