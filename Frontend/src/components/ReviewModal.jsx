// src/components/ReviewModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ReviewModal({
  isOpen,
  onClose,
  session,
  onSubmitReview,
  loading = false
}) {
  if (!isOpen || !session) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const partnerName = session.partnerName || 'Peer Member';
  const skillName = session.skill || session.title || 'Skill Swap';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a star rating between 1 and 5.');
      return;
    }
    setError('');
    onSubmitReview(session.id, rating, comment.trim());
  };

  const starLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Exceptional!'];

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
          boxShadow: '0 25px 50px -12px rgba(108, 92, 231, 0.25)',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900, #0f172a)' }}>
              ⭐ Rate &amp; Review Session
            </h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', color: 'var(--slate-500, #64748b)' }}>
              Share your experience with <strong>{partnerName}</strong> for <strong>{skillName}</strong>.
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
          {/* Interactive Star Picker */}
          <div style={{ textAlign: 'center', margin: '1.25rem 0 1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
              Your Rating
            </label>
            <div style={{ display: 'inline-flex', gap: '0.5rem', fontSize: '2.4rem', cursor: 'pointer' }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <span
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      transition: 'transform 0.15s ease',
                      transform: (hoverRating || rating) === star ? 'scale(1.2)' : 'scale(1)',
                      color: isFilled ? '#f59e0b' : '#cbd5e1',
                      userSelect: 'none'
                    }}
                  >
                    ★
                  </span>
                );
              })}
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f59e0b', marginTop: '0.35rem', minHeight: '1.2rem' }}>
              {starLabels[(hoverRating || rating) - 1]}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700)' }}>
              Feedback &amp; Recommendation
            </label>
            <textarea
              className="form-textarea-styled"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`How was your session with ${partnerName}? What did you learn?`}
              maxLength={500}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '14px',
                border: '1px solid var(--slate-300, #cbd5e1)',
                fontFamily: 'inherit',
                fontSize: '0.9rem',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', float: 'right', marginTop: '0.25rem' }}>
              {comment.length}/500
            </span>
          </div>

          {/* Action Buttons */}
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
              className="btn btn-primary"
              disabled={loading || !rating}
              style={{ flex: 2 }}
            >
              {loading ? 'Submitting Review...' : '⭐ Submit Review →'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
