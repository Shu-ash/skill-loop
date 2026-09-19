// src/components/RequestCard.jsx
import React from 'react';

export default function RequestCard({
  request,
  direction,
  onAccept,
  onDecline,
  onCancel,
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
  const isAccepted = direction === 'accepted';

  return (
    <div className="glass-panel request-card">
      {/* Avatar */}
      <div className="request-user-avatar">
        {user?.profilePhotoUrl || (typeof user?.avatar === 'string' && (user.avatar.startsWith('data:image') || user.avatar.startsWith('http'))) ? (
          <img
            src={user.profilePhotoUrl || user.avatar}
            alt={user?.name || 'User'}
            className="avatar-round-img"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          (typeof user?.avatar === 'string' && user.avatar.length <= 4 && !user.avatar.includes('/')
            ? user.avatar
            : (user?.name || 'SL').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || 'SL')
        )}
      </div>

      {/* Request details */}
      <div className="request-details">
        <div className="request-title-line">
          <h4>
            {user?.name || 'Skill Loop User'}
            <span>
              {' '}
              {isReceived
                ? 'wants to learn from you:'
                : isSent
                  ? '— you requested to learn:'
                  : 'swap accepted for:'}{' '}
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
              onClick={() => onDecline(request)}
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
          <>
            <span className="pill-badge pill-gold" title="Waiting for teacher to accept & set class time">
              ● AWAITING TEACHER
            </span>

            <button
              type="button"
              className="btn btn-secondary btn-pill-sm"
              onClick={() => onCancel && onCancel(request)}
              disabled={actionLoading}
            >
              Cancel Request
            </button>
          </>
        )}

        {/* ACCEPTED (Both see link to Scheduled Session) */}
        {status === 'accepted' && (
          <>
            <span className="pill-badge pill-mint">● SCHEDULED</span>

            <button
              type="button"
              className="btn btn-primary btn-pill-sm"
              onClick={() => onSchedule && onSchedule(request)}
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

        {/* CANCELLED */}
        {status === 'cancelled' && (
          <span className="pill-badge pill-coral">● CANCELLED</span>
        )}
      </div>
    </div>
  );
}