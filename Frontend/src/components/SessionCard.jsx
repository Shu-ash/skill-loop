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
    isLearner,
    learnerJoined,
    teacherJoined,
    scheduledAt,
    duration,
    message
  } = session;

  const [currentTime, setCurrentTime] = useState(Date.now());

  // Tick current time every 3 seconds for precise duration window lock/unlock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const durationMins = Number(duration) || 45;
  const scheduledTimestamp = scheduledAt ? new Date(scheduledAt).getTime() : 0;
  const endTimestamp = scheduledTimestamp > 0 ? scheduledTimestamp + durationMins * 60 * 1000 : 0;

  // Check if session duration has passed
  const isDurationExpired = Boolean(scheduledTimestamp > 0 && currentTime >= endTimestamp);

  // Live active window: between scheduled start time and duration end time
  const isLiveWindow = Boolean(
    scheduledTimestamp > 0 &&
    currentTime >= scheduledTimestamp &&
    currentTime < endTimestamp
  );

  // Unlocked only during the scheduled duration window
  const isUnlocked = Boolean(
    !isDurationExpired &&
    status !== 'cancelled' &&
    status !== 'completed' &&
    (status === 'in_progress' || isLiveWindow)
  );

  // Effectively completed either in database or automatically when duration has passed
  const isCompleted = Boolean(
    status === 'completed' ||
    (isDurationExpired && status !== 'cancelled')
  );

  // Teacher can mark complete during active session if student joined
  const canTeacherComplete = Boolean(
    isTeacher && (learnerJoined || status === 'in_progress')
  );

  const getStatusLabel = () => {
    if (status === 'cancelled') return 'CANCELLED';
    if (isCompleted) return 'COMPLETED';
    if (status === 'in_progress') return 'IN PROGRESS';
    if (isLiveWindow) return 'READY TO JOIN';
    return 'SCHEDULED';
  };

  const handleOpenLink = () => {
    if (!meetLink || !isUnlocked) return;
    if (onJoinCall) {
      onJoinCall(session);
    } else {
      const url = meetLink.startsWith('http://') || meetLink.startsWith('https://')
        ? meetLink
        : `https://${meetLink}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="glass-panel session-card" style={{ padding: '1.8rem', borderRadius: '24px', marginBottom: '1.25rem' }}>
      <div className="session-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span className={`pill-badge ${isCompleted ? 'pill-mint' : status === 'cancelled' ? 'pill-coral' : isUnlocked ? 'pill-mint' : 'pill-violet'}`}>
              ● {getStatusLabel()}
            </span>
            <span className="pill-badge pill-white" style={{ fontSize: '0.78rem' }}>
              {isTeacher ? '🎓 You are the Teacher' : '🎒 You are the Student'}
            </span>

            <span className="pill-badge pill-white" style={{ fontSize: '0.78rem' }}>
              ⏱️ {durationMins} Mins
            </span>

            {/* Student Join Status Indicator */}
            {isTeacher && !isCompleted && status !== 'cancelled' && (
              learnerJoined ? (
                <span className="pill-badge pill-mint" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  🟢 {partnerName} has joined
                </span>
              ) : (
                <span className="pill-badge pill-gold" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                  ⏳ Student not joined yet
                </span>
              )
            )}
          </div>

          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>
            {title}
          </h3>
          <p className="session-partner-sub" style={{ margin: 0, color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            {isTeacher ? `Student: ${partnerName}` : `Teacher: ${partnerName}`} • <strong>{date}</strong> at <strong>{time}</strong> ({durationMins} mins)
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

      {/* Video Meeting Room Link Banner (LOCKED vs UNLOCKED during duration) */}
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
                {isUnlocked ? 'Video Meeting Room (Unlocked & Live)' : isDurationExpired ? 'Video Meeting Room (Duration Ended)' : 'Video Meeting Room (Locked)'}
              </strong>
              {isUnlocked ? (
                <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--violet-primary, #6c5ce7)', wordBreak: 'break-all', fontWeight: 600 }}>
                  {meetLink}
                </p>
              ) : isDurationExpired ? (
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                  🔒 Session duration of {durationMins} minutes has ended. Meeting room is now closed.
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                  🔒 Link will automatically unlock on <strong>{date}</strong> at <strong>{time}</strong> for {durationMins} mins
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
            {isUnlocked ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenLink}
                disabled={actionLoading}
                style={{ padding: '0.6rem 1.35rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.92rem' }}
              >
                🎥 Join Meeting →
              </button>
            ) : isDurationExpired ? (
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
                <span>🔒 Duration Expired</span>
              </span>
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
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block' }}>Duration</span>
            <strong style={{ fontSize: '0.88rem' }}>{durationMins} Minutes</strong>
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
          {!isCompleted && status !== 'cancelled' && (
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
                canTeacherComplete ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-pill-sm"
                    onClick={() => onMarkComplete && onMarkComplete(id)}
                    disabled={actionLoading}
                    style={{ background: 'var(--mint-primary, #10b981)', borderColor: 'var(--mint-primary, #10b981)', padding: '0.55rem 1.15rem', fontWeight: 700 }}
                  >
                    ✅ Mark Class Completed (+1 Credit)
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary btn-pill-sm"
                    disabled={true}
                    title="Student must join the meeting first before you can mark the class complete."
                    style={{ opacity: 0.65, cursor: 'not-allowed', padding: '0.55rem 1.15rem', fontWeight: 600 }}
                  >
                    🔒 Mark Complete (Wait for Student)
                  </button>
                )
              )}
            </>
          )}

          {isCompleted && (
            <span className="pill-badge pill-mint" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', fontWeight: 700 }}>
              ✓ Class Completed &amp; Credits Settled
            </span>
          )}
        </div>
      </div>
    </div>
  );
}