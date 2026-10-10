import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './ReviewModal.css';

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
    <div className="modal-overlay full-viewport-blur-overlay modal-overlay-portal" onClick={onClose}>
      <div
        className="glass-panel clay-card-3d user-modal-sm review-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="user-modal-header">
          <div>
            <h3 className="user-modal-title">
              ⭐ Rate &amp; Review Session
            </h3>
            <p className="user-modal-subtitle">
              Share your experience with <strong>{partnerName}</strong> for <strong>{skillName}</strong>.
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
          {/* Interactive Star Picker */}
          <div className="star-picker-container">
            <label className="star-picker-label">
              Your Rating
            </label>
            <div className="star-picker-group">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <span
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className={`star-picker-item ${isFilled ? 'active' : ''} ${(hoverRating || rating) === star ? 'scaled' : ''}`}
                  >
                    ★
                  </span>
                );
              })}
            </div>
            <div className="star-picker-label-text">
              {starLabels[(hoverRating || rating) - 1]}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="form-group user-modal-form-group spacing-lg">
            <label className="form-label user-modal-label">
              Feedback &amp; Recommendation
            </label>
            <textarea
              className="form-textarea-styled user-modal-textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={`How was your session with ${partnerName}? What did you learn?`}
              maxLength={500}
              disabled={loading}
            />
            <span className="form-char-count">
              {comment.length}/500
            </span>
          </div>

          {/* Action Buttons */}
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
              className="btn btn-primary btn-flex-2"
              disabled={loading || !rating}
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
