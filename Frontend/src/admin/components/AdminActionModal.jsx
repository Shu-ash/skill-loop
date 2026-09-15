// src/admin/components/AdminActionModal.jsx
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function AdminActionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  icon = "⚠️",
  message = "Are you sure you want to proceed with this action?",
  confirmText = "Confirm",
  confirmType = "primary", // "primary" | "danger" | "warning" | "success"
  details = null,
  isDetailsOnly = false,
  loading = false
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getConfirmBtnClass = () => {
    if (confirmType === 'danger') return 'btn-danger-pill';
    if (confirmType === 'warning') return 'action-btn btn-warning-modal';
    if (confirmType === 'success') return 'btn-primary';
    return 'btn-primary';
  };

  const modalContent = (
    <div className="full-viewport-blur-overlay modal-overlay" onClick={onClose}>
      <div 
        className={`glass-panel logout-confirm-box clay-card-3d admin-action-center-modal admin-action-modal-box ${details ? 'has-details' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="admin-action-modal-header">
            <span className="admin-action-modal-icon">{icon}</span>
            <h3 className="admin-action-modal-title">{title}</h3>
          </div>
          <button 
            type="button" 
            className="close-modal-btn" 
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <div className="modal-body modal-body-padded">
          <p className={`logout-modal-text admin-action-modal-message ${details ? 'has-details' : ''}`}>
            {message}
          </p>

          {/* Structured Details Box if passed */}
          {details && (
            <div className="admin-modal-details-card">
              {Object.entries(details).map(([key, value]) => (
                <div key={key} className="admin-modal-detail-row">
                  <span className="detail-key">{key}:</span>
                  <span className="detail-val">{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="modal-action-buttons admin-action-modal-actions">
            <button 
              type="button" 
              className="action-btn" 
              onClick={onClose}
              disabled={loading}
            >
              {isDetailsOnly ? 'Close' : 'Cancel'}
            </button>

            {!isDetailsOnly && onConfirm && (
              <button 
                type="button" 
                className={`${getConfirmBtnClass()} admin-action-modal-btn`} 
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Processing...' : confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
