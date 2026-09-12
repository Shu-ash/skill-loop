// src/components/DisputeModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function DisputeModal({
  isOpen,
  onClose,
  session,
  onSubmitDispute,
  loading = false
}) {
  if (!isOpen || !session) return null;

  const [reason, setReason] = useState('Participant did not show up');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');

  const partnerName = session.partnerName || 'Peer Member';
  const skillName = session.skill || session.title || 'Skill Session';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      setError('Please select a dispute reason.');
      return;
    }
    setError('');
    onSubmitDispute(session.id, reason, details.trim());
  };

  return createPortal(
    <div className="modal-overlay full-viewport-blur-overlay" onClick={onClose}>
      <div
        className="glass-panel clay-card-3d"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '480px',
          width: '90%',
          padding: '2rem',
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#dc2626' }}>
              🚨 Report Session Dispute
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: 'var(--slate-500, #64748b)' }}>
              File a dispute for session <strong>"{skillName}"</strong> with <strong>{partnerName}</strong>.
            </p>
          </div>
          <button
            type="button"
            className="close-modal-btn"
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: 'var(--slate-400)'
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            className="onboarding-error-banner"
            style={{
              background: '#fee2e2',
              color: '#dc2626',
              padding: '0.65rem 0.85rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontWeight: 600
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700)' }}>
              Reason for Dispute *
            </label>
            <select
              className="form-select-styled"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem'
              }}
            >
              <option value="Participant did not show up">Participant did not show up</option>
              <option value="Technical disruption / disconnection">Technical disruption / disconnection</option>
              <option value="Inappropriate behavior or violation">Inappropriate behavior or violation</option>
              <option value="Skill taught did not match requested topic">Skill taught did not match requested topic</option>
              <option value="Other issue">Other issue</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700)' }}>
              Additional Details (Optional)
            </label>
            <textarea
              className="form-textarea-styled"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what happened so moderators can review meet logs and resolve credit allocation..."
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={loading || !reason}
              style={{
                flex: 2,
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {loading ? 'Submitting...' : '🚨 Submit Dispute to Moderators'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
