// src/components/SessionCard.jsx
import React, { useState, useEffect } from 'react';

export default function SessionCard({
  session,
  onJoinCall,
  onStartSession,
  onMarkComplete,
  onCancelSession,
  onScheduleSession,
  actionLoading
}) {
  if (!session) return null;

  const {
    title,
    partnerName,
    partnerAvatar,
    date,
    time,
    mode,
    meetLink,
    status,
    id,
    isTeacher,
    scheduledAt,
    duration,
    message
  } = session;

  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Tick current time every 10 seconds to auto-unlock when class time arrives
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const scheduledTimestamp = scheduledAt ? new Date(scheduledAt).getTime() : 0;
  // Unlocks 5 minutes before scheduled start time, or if already past / in-progress
  const isUnlocked = Boolean(
    status === 'in_progress' ||
    status === 'completed' ||
    (scheduledTimestamp > 0 && currentTime >= (scheduledTimestamp - 5 * 60 * 1000))
  );

  const getStatusLabel = () => {
    switch (status) {
      case 'scheduled':
        return isUnlocked ? 'READY TO JOIN' : 'SCHEDULED';
      case 'in_progress':
        return 'IN PROGRESS';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return status?.toUpperCase() || 'UNKNOWN';
    }
  };

  const handleCopyLink = () => {
    if (!meetLink || !isUnlocked) return;
    navigator.clipboard.writeText(meetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLink = () => {
    if (!meetLink || !isUnlocked) return;
    const url = meetLink.startsWith('http://') || meetLink.startsWith('https://') 
      ? meetLink 
      : `https://${meetLink}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="glass-panel session-card" style={{ padding: '1.8rem', borderRadius: '24px', marginBottom: '1.25rem' }}>
      <div className="session-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className={`pill-badge ${status === 'completed' ? 'pill-mint' : status === 'cancelled' ? 'pill-coral' : isUnlocked ? 'pill-mint' : 'pill-violet'}`}>
              ● {getStatusLabel()}
            </span>
            <span className="pill-badge pill-white" style={{ fontSize: '0.78rem' }}>
              {isTeacher ? '🎓 You are the Teacher' : '🎒 You are the Student'}
            </span>
          </div>

          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>
            {title}
          </h3>
          <p className="session-partner-sub" style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            {isTeacher ? `Student: ${partnerName}` : `Teacher: ${partnerName}`} • <strong>{date}</strong> at <strong>{time}</strong>
          </p>
        </div>

        <div className="partner-avatar-circle" style={{ width: '48px', height: '48px', borderRadius: '50%', background: isTeacher ? 'var(--coral-primary)' : 'var(--violet-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
          {partnerAvatar}
        </div>
      </div>

      {message && (
        <div style={{ background: 'rgba(241, 245, 249, 0.6)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.86rem', color: 'var(--slate-600)', marginBottom: '1.1rem', fontStyle: 'italic' }}>
          💬 Note: "{message}"
        </div>
      )}

      {/* Video Meeting Room Link Banner (LOCKED vs UNLOCKED) */}
      {meetLink && status !== 'cancelled' && (
        <div 
          className="session-meet-banner session-link-banner" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '1.1rem 1.35rem', 
            borderRadius: '18px', 
            marginBottom: '1.2rem', 
            gap: '1rem', 
            flexWrap: 'wrap',
            background: isUnlocked ? 'rgba(240, 237, 255, 0.85)' : 'rgba(248, 250, 252, 0.95)',
            border: isUnlocked ? '1.5px solid rgba(108, 92, 231, 0.35)' : '1.5px dashed rgba(148, 163, 184, 0.5)'
          }}
        >
          <div className="meet-info" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '240px' }}>
            <span className="meet-icon" style={{ fontSize: '1.8rem' }}>
              {isUnlocked ? '🎥' : '🔒'}
            </span>
            <div>
              <strong style={{ fontSize: '0.92rem', display: 'block', color: isUnlocked ? 'var(--slate-900)' : 'var(--slate-700)' }}>
                {isUnlocked ? 'Video Meeting Room (Unlocked & Live)' : 'Video Meeting Room (Locked)'}
              </strong>
              {isUnlocked ? (
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--violet-primary, #6c5ce7)', wordBreak: 'break-all', fontWeight: 600 }}>
                  {meetLink}
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                  🔒 Link will automatically unlock on <strong>{date}</strong> at <strong>{time}</strong>
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
            {isUnlocked ? (
              <>
                <button
                  type="button"
                  className="action-btn"
                  onClick={handleCopyLink}
                  title="Copy meeting URL to clipboard"
                  style={{ fontSize: '0.82rem', padding: '0.55rem 0.95rem', borderRadius: '10px' }}
                >
                  {copied ? '✓ Copied!' : '📋 Copy Link'}
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleOpenLink}
                  disabled={actionLoading}
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem' }}
                >
                  🎥 Join Meeting →
                </button>
              </>
            ) : (
              <span 
                style={{ 
                  background: 'rgba(226, 232, 240, 0.8)', 
                  color: 'var(--slate-600)', 
                  padding: '0.45rem 0.95rem', 
                  borderRadius: '12px', 
                  fontSize: '0.8rem', 
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>🔒 Locked until session time</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Session Meta Details & Teacher Completion Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
        <div className="session-meta-grid" style={{ display: 'flex', gap: '1.5rem', margin: 0 }}>
          <div className="meta-item">
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>Mode</span>
            <strong style={{ fontSize: '0.88rem' }}>{mode}</strong>
          </div>

          <div className="meta-item">
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>Credit Settlement</span>
            <strong className="session-credit-earn" style={{ fontSize: '0.88rem', color: 'var(--mint-primary)' }}>
              {isTeacher ? '+1 Credit to You on completion' : '-1 Credit from Balance'}
            </strong>
          </div>
        </div>

        {/* Action Buttons: Teacher Mark Complete & Cancel */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {status === 'scheduled' && (
            <>
              <button
                type="button"
                className="action-btn btn-danger-sm"
                onClick={() => onCancelSession && onCancelSession(id)}
                disabled={actionLoading}
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}
              >
                Cancel Session
              </button>

              {isTeacher && (
                <button
                  type="button"
                  className="btn btn-primary btn-pill-sm"
                  onClick={() => onMarkComplete && onMarkComplete(id)}
                  disabled={actionLoading}
                  style={{ background: 'var(--mint-primary, #10b981)', borderColor: 'var(--mint-primary, #10b981)', padding: '0.55rem 1.15rem', fontWeight: 700 }}
                >
                  ✅ Mark Class Completed (+1 Credit)
                </button>
              )}
            </>
          )}

          {status === 'completed' && (
            <span className="pill-badge pill-mint" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', fontWeight: 700 }}>
              ✓ Class Completed &amp; Credits Settled
            </span>
          )}
        </div>
      </div>
    </div>
  );
}