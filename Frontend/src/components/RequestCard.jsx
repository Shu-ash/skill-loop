// src/components/RequestCard.jsx
import React from 'react';

export default function RequestCard({
  request,
  direction,
  onAccept,
  onDecline,
  onSchedule,
  actionLoading = false
}) {
  const {
    id,
    user,
    skillWant,
    message,
    timeAgo,
    status
  } = request;

  const isReceived = direction === 'received';
  const isSent = direction === 'sent';

  return (
    <div className="glass-panel request-card">
      {/* Avatar */}
      <div
        className="request-user-avatar"
        style={{
          background: user?.avatarBg || 'var(--violet-primary)'
        }}
      >
        {user?.avatar || 'SL'}
      </div>

      {/* Request details */}
      <div className="request-details">
        <div className="request-title-line">
          <h4>
            {user?.name || 'Skill Loop User'}
            <span>
              {' '}
              {isReceived ? 'wants to learn' : 'wants to learn from you:'}{' '}
            </span>
            <strong>{skillWant || 'Unknown skill'}</strong>
          </h4>

          <span className="request-time">{timeAgo}</span>
        </div>

        {message && <p className="request-message">"{message}"</p>}
      </div>

      {/* Actions */}
      <div className="request-actions">
        {/* RECEIVED REQUEST - PENDING (Teacher accepts and sets schedule) */}
        {isReceived && status === 'pending' && (
          <>
            <span className="pill-badge pill-gold">● PENDING</span>

            <button
              type="button"
              className="btn btn-secondary btn-pill-sm"
              onClick={() => onDecline(id)}
              disabled={actionLoading}
            >
              Decline
            </button>

            <button
              type="button"
              className="btn btn-primary btn-pill-sm"
              onClick={() => onAccept(request)}
              disabled={actionLoading}
            >
              📅 Accept &amp; Schedule
            </button>
          </>
        )}

        {/* SENT REQUEST - PENDING (Learner is waiting for Teacher) */}
        {isSent && status === 'pending' && (
          <span className="pill-badge pill-gold" title="Waiting for teacher to accept & set class time">
            ● AWAITING TEACHER
          </span>
        )}

        {/* ACCEPTED (Both see link to Scheduled Session) */}
        {status === 'accepted' && (
          <>
            <span className="pill-badge pill-mint">● SCHEDULED</span>

            <button
              type="button"
              className="btn btn-primary btn-pill-sm"
              onClick={() => onSchedule(request)}
              disabled={actionLoading}
            >
              🎥 View Session &amp; Link →
            </button>
          </>
        )}

        {/* DECLINED */}
        {status === 'declined' && (
          <span className="pill-badge pill-coral">● DECLINED</span>
        )}
      </div>
    </div>
  );
}