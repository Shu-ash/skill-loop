// src/components/SessionCard.jsx
import React from 'react';

// SessionCard: Card component showing scheduled session details, meeting link, and actions
export default function SessionCard({ session, onJoinCall, onMarkComplete }) {
  const { title, partnerName, partnerAvatar, date, time, mode, meetLink, status } = session;

  return (
    <div className="glass-panel session-card">
      <div className="session-card-header">
        <div>
          <span className="pill-badge pill-violet">IN PROGRESS</span>
          <h3>{title}</h3>
          <p className="session-partner-sub">Session with {partnerName} • {date} at {time}</p>
        </div>
        <div className="partner-avatar-circle">{partnerAvatar}</div>
      </div>

      {/* Meeting Link Row */}
      <div className="session-meet-banner">
        <div className="meet-info">
          <span className="meet-icon">🎥</span>
          <div>
            <strong>Google Meet Link</strong>
            <p>{meetLink}</p>
          </div>
        </div>
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={() => onJoinCall(meetLink)}
        >
          🎥 Join Google Meet →
        </button>
      </div>

      {/* Bottom Session Details */}
      <div className="session-meta-grid">
        <div className="meta-item">
          <span>Mode</span>
          <strong>{mode}</strong>
        </div>
        <div className="meta-item">
          <span>Duration</span>
          <strong>45 mins</strong>
        </div>
        <div className="meta-item">
          <span>Credit Reward</span>
          <strong style={{ color: 'var(--mint-primary)' }}>+1 Credit to {partnerName}</strong>
        </div>
      </div>

      <div className="session-card-actions">
        <button 
          type="button" 
          className="btn btn-secondary btn-full"
          onClick={() => onMarkComplete(session.id)}
          style={{ background: 'var(--mint-subtle)', color: 'var(--mint-primary)', borderColor: 'rgba(16, 185, 129, 0.3)' }}
        >
          ✓ Mark session as completed
        </button>
      </div>
    </div>
  );
}
