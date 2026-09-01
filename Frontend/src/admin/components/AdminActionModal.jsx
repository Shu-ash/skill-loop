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
        className="glass-panel logout-confirm-box clay-card-3d admin-action-center-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: details ? '520px' : '440px', width: '92%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.4rem' }}>{icon}</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{title}</h3>
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
          <p className="logout-modal-text" style={{ fontSize: '0.94rem', lineHeight: '1.5', color: 'var(--slate-700, #334155)', marginBottom: details ? '1rem' : '1.4rem' }}>
            {message}
          </p>

          {/* Structured Details Box if passed */}
          {details && (
            <div className="admin-modal-details-card" style={{
              background: 'rgba(241, 245, 249, 0.65)',
              borderRadius: '14px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1.4rem',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              fontSize: '0.86rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem'
            }}>
              {Object.entries(details).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--slate-500, #64748b)', fontWeight: 600 }}>{key}:</span>
                  <span style={{ color: 'var(--slate-800, #1e293b)', fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="modal-action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
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
                className={getConfirmBtnClass()} 
                onClick={onConfirm}
                disabled={loading}
                style={{ padding: '0.65rem 1.35rem' }}
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
