// src/components/RequestCard.jsx
import React from 'react';

// RequestCard: Individual swap request item card with status badge and inline actions
export default function RequestCard({ request, onAccept, onDecline, onSchedule }) {
  const { id, user, skillWant, message, timeAgo, status } = request;

  return (
    <div className="glass-panel request-card">
      <div className="request-user-avatar" style={{ background: user.avatarBg || 'var(--violet-primary)' }}>
        {user.avatar}
      </div>

      <div className="request-details">
        <div className="request-title-line">
          <h4>{user.name} <span>wants to learn</span> <strong>{skillWant}</strong></h4>
          <span className="request-time">{timeAgo}</span>
        </div>
        <p className="request-message">"{message}"</p>
      </div>

      <div className="request-actions">
        {status === 'pending' && (
          <>
            <span className="pill-badge pill-gold">● PENDING</span>
            <button type="button" className="btn btn-secondary btn-pill-sm" onClick={() => onDecline(id)}>
              Decline
            </button>
            <button type="button" className="btn btn-primary btn-pill-sm" onClick={() => onAccept(id)}>
              Accept
            </button>
          </>
        )}

        {status === 'accepted' && (
          <>
            <span className="pill-badge pill-mint">● ACCEPTED</span>
            <button type="button" className="btn btn-primary btn-pill-sm" onClick={() => onSchedule(id)}>
              Schedule session →
            </button>
          </>
        )}

        {status === 'declined' && (
          <span className="pill-badge pill-coral">● DECLINED</span>
        )}
      </div>
    </div>
  );
}
