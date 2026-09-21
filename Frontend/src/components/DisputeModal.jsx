import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './ReviewModal.css';

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
    <div className="modal-overlay full-viewport-blur-overlay modal-overlay-portal" onClick={onClose}>
      <div
        className="glass-panel clay-card-3d user-modal-sm dispute-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="user-modal-header">
          <div>
            <h3 className="user-modal-title danger">
              🚨 Report Session Dispute
            </h3>
            <p className="user-modal-subtitle">
              File a dispute for session <strong>"{skillName}"</strong> with <strong>{partnerName}</strong>.
            </p>
          </div>
          <button
            type="button"
            className="close-modal-btn user-modal-close-btn"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="user-modal-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group user-modal-form-group">
            <label className="form-label user-modal-label">
              Reason for Dispute *
            </label>
            <select
              className="form-select-styled user-modal-input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            >
              <option value="Participant did not show up">Participant did not show up</option>
              <option value="Technical disruption / disconnection">Technical disruption / disconnection</option>
              <option value="Inappropriate behavior or violation">Inappropriate behavior or violation</option>
              <option value="Skill taught did not match requested topic">Skill taught did not match requested topic</option>
              <option value="Other issue">Other issue</option>
            </select>
          </div>

          <div className="form-group user-modal-form-group spacing-lg">
            <label className="form-label user-modal-label">
              Additional Details (Optional)
            </label>
            <textarea
              className="form-textarea-styled user-modal-textarea"
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe what happened so moderators can review meet logs and resolve credit allocation..."
              disabled={loading}
            />
          </div>

          <div className="user-modal-actions-equal">
            <button
              type="button"
              className="btn btn-secondary btn-flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-submit-danger btn-flex-2"
              disabled={loading || !reason}
            >
              {loading ? 'Filing Dispute...' : '🚨 Submit Dispute'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
