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
      className="modal-overlay modal-overlay-portal"
      onClick={onClose}
    >
      <div
        className="glass-panel clay-card-3d user-modal-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="user-modal-header">
          <div className="user-modal-header-lead">
            <span className="user-modal-header-icon">🔒</span>
            <div>
              <h3 className="user-modal-title">
                Change Password
              </h3>
              <p className="user-modal-subtitle">
                Update your login credentials securely
              </p>
            </div>
          </div>
          <button type="button" className="close-modal-btn user-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="user-modal-error">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="user-modal-success">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="form-group user-modal-form-group">
            <label className="form-label user-modal-label">
              Current Password (Optional if newly registered)
            </label>
            <input
              className="form-input user-modal-input"
              type={showPass ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              disabled={loading}
            />
          </div>

          {/* New Password */}
          <div className="form-group user-modal-form-group">
            <label className="form-label user-modal-label">
              New Password *
            </label>
            <input
              className="form-input user-modal-input"
              type={showPass ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              required
              disabled={loading}
            />
          </div>

          {/* Confirm New Password */}
          <div className="form-group user-modal-form-group spacing-lg">
            <label className="form-label user-modal-label">
              Confirm New Password *
            </label>
            <input
              className="form-input user-modal-input"
              type={showPass ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              disabled={loading}
            />
          </div>

          <div className="user-modal-checkbox-row">
            <input 
              type="checkbox" 
              id="showPassToggle" 
              checked={showPass} 
              onChange={(e) => setShowPass(e.target.checked)} 
              className="user-modal-checkbox"
            />
            <label htmlFor="showPassToggle" className="user-modal-checkbox-label">
              Show passwords in plain text
            </label>
          </div>

          {/* Actions */}
          <div className="user-modal-actions">
            <button
              type="button"
              className="btn btn-secondary user-modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary user-modal-btn-submit"
              disabled={loading}
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
