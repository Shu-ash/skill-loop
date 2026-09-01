// src/components/ChangePasswordModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const API_BASE_URL = 'http://localhost:5000/api';

export default function ChangePasswordModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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

      const response = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update password');
      }

      setSuccess('Your password has been updated successfully! 🔒');
      setTimeout(() => {
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 1600);

    } catch (err) {
      setError(err.message || 'Error updating password');
    } finally {
      setLoading(false);
    }
  };

  const modalJSX = (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
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
        style={{
          maxWidth: '440px',
          width: '100%',
          borderRadius: '24px',
          padding: '2.2rem 2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🔒</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>
                Change Password
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--slate-500)' }}>
                Update your login credentials securely
              </p>
            </div>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.65rem 0.85rem', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1.1rem' }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '0.65rem 0.85rem', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1.1rem' }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              Current Password (Optional if newly registered)
            </label>
            <input
              className="form-input"
              type={showPass ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
            />
          </div>

          {/* New Password */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              New Password *
            </label>
            <input
              className="form-input"
              type={showPass ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
            />
          </div>

          {/* Confirm New Password */}
          <div className="form-group" style={{ marginBottom: '1.2rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              Confirm New Password *
            </label>
            <input
              className="form-input"
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.4rem' }}>
            <input 
              type="checkbox" 
              id="showPassToggle" 
              checked={showPass} 
              onChange={(e) => setShowPass(e.target.checked)} 
              style={{ cursor: 'pointer', accentColor: 'var(--violet-primary)' }}
            />
            <label htmlFor="showPassToggle" style={{ fontSize: '0.82rem', color: 'var(--slate-600)', cursor: 'pointer', userSelect: 'none' }}>
              Show passwords in plain text
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '0.7rem 1.2rem', borderRadius: '14px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '0.7rem 1.4rem', borderRadius: '14px', fontWeight: 700 }}
            >
              {loading ? 'Updating Password...' : 'Save New Password 🔒'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : null;
}
