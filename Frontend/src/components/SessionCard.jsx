// src/components/SessionCard.jsx
import React, { useState, useEffect } from 'react';

export default function SessionCard({
  session,
  onJoinCall,
  onStartSession,
  onMarkComplete,
  onCancelSession,
  onOpenEditSchedule,
  onOpenDispute,
  onOpenReview,
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

  const sessionStartTime = scheduledAt ? new Date(scheduledAt) : null;
  const validSessionStartTime = sessionStartTime && !Number.isNaN(sessionStartTime.getTime());
  const sessionStartMs = validSessionStartTime ? sessionStartTime.getTime() : 0;

  // Compute session end time
  const sessionEndTime = validSessionStartTime
    ? new Date(sessionStartMs + (Number(duration) || 45) * 60 * 1000)
    : null;
  const sessionEndMs = sessionEndTime ? sessionEndTime.getTime() : 0;

  // Session time window status
  const isBeforeSession = validSessionStartTime && currentTime < sessionStartMs;
  const isDuringSession = validSessionStartTime && Boolean(sessionEndTime) && currentTime >= sessionStartMs && currentTime < sessionEndMs;
  const isAfterSession = validSessionStartTime && Boolean(sessionEndTime) && currentTime >= sessionEndMs;

  const [hasJoined, setHasJoined] = useState(() => {
    try {
      return localStorage.getItem(`skillloop_session_joined_${id}`) === 'true';
    } catch {
      return false;
    }
  });

  const [autoCompleting, setAutoCompleting] = useState(false);

  // Sync hasJoined if status is in_progress
  useEffect(() => {
    if (status === 'in_progress' && !hasJoined) {
      setHasJoined(true);
      try {
        localStorage.setItem(`skillloop_session_joined_${id}`, 'true');
      } catch (e) {
        console.error(e);
      }
    }
  }, [status, hasJoined, id]);

  const isJoined = hasJoined || status === 'in_progress';

  // Format countdown helper until session starts
  const getCountdown = () => {
    if (!validSessionStartTime || !isBeforeSession) return '';
    const diffMs = sessionStartMs - currentTime;
    if (diffMs <= 0) return '0s';
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  // Format countdown helper for remaining time in active session
  const getSessionRemainingCountdown = () => {
    if (!sessionEndTime || !isDuringSession) return '';
    const diffMs = sessionEndMs - currentTime;
    if (diffMs <= 0) return '0m 0s';
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
    return `${mins}m ${secs}s`;
  };

  // Auto-complete if join button was clicked but mark as complete wasn't clicked within duration
  useEffect(() => {
    if (
      isAfterSession &&
      isJoined &&
      status !== 'completed' &&
      status !== 'cancelled' &&
      !autoCompleting &&
      onMarkComplete
    ) {
      setAutoCompleting(true);
      onMarkComplete(id);
    }
  }, [isAfterSession, isJoined, status, autoCompleting, id, onMarkComplete]);

  const handleJoinClick = () => {
    if (!canJoin) return;
    try {
      localStorage.setItem(`skillloop_session_joined_${id}`, 'true');
    } catch (e) {
      console.error(e);
    }
    setHasJoined(true);
    if (onJoinCall) {
      onJoinCall(meetLink, id);
    }
  };

  const canJoin = Boolean(meetLink) && Boolean(validSessionStartTime) && currentTime >= sessionStartMs && !(sessionEndMs && currentTime >= sessionEndMs) && status !== 'completed' && status !== 'cancelled';

  const isCompleted = status === 'completed';
  const durationMins = Number(duration) || 45;
  const isLiveWindow = Boolean(canJoin || isDuringSession);
  const isUnlocked = Boolean(isLiveWindow || status === 'in_progress' || isCompleted);

  const getStatusLabel = () => {
    if (status === 'cancelled') return 'CANCELLED';
    if (isCompleted) return 'COMPLETED';
    if (status === 'in_progress') return 'IN PROGRESS';
    if (isLiveWindow) return 'READY TO JOIN';
    if (!scheduledAt) return 'PENDING SCHEDULE';
    return 'SCHEDULED';
  };

  return (
    <div className="glass-panel session-card session-card-padded">
      <div className="session-card-header">
        <div>
          <div className="session-badges-wrap">
            <span className={`pill-badge ${isCompleted ? 'pill-mint' : status === 'cancelled' ? 'pill-coral' : isUnlocked ? 'pill-mint' : 'pill-violet'}`}>
              ● {getStatusLabel()}
            </span>
            <span className="pill-badge pill-white session-badge-sm">
              {isTeacher ? '🎓 Host (Teacher)' : '🎒 Student'}
            </span>

            <span className="pill-badge pill-white session-badge-sm">
              ⏱️ {durationMins} Mins
            </span>

            {/* Student Join Status Indicator */}
            {isTeacher && !isCompleted && status !== 'cancelled' && (
              learnerJoined ? (
                <span className="pill-badge pill-mint session-badge-sm-bold">
                  🟢 {partnerName} has joined
                </span>
              ) : (
                <span className="pill-badge pill-gold session-badge-sm-bold">
                  ⏳ Student not joined yet
                </span>
              )
            )}
          </div>

          <h3 className="session-card-title">
            {title}
          </h3>
          <p className="session-partner-sub">
            {isTeacher ? `Student: ${partnerName}` : `Host/Teacher: ${partnerName}`}
            {scheduledAt ? (
              <> • <strong>{date}</strong> at <strong>{time}</strong> ({durationMins} mins)</>
            ) : (
              <> • <em style={{ color: 'var(--gold-primary)' }}>Not scheduled yet</em></>
            )}
          </p>
        </div>

        <div className={`partner-avatar-circle ${isTeacher ? 'partner-avatar-teacher' : 'partner-avatar-student'}`}>
          {partnerAvatar}
        </div>
      </div>

      {/* Unscheduled Banner */}
      {!scheduledAt && status !== 'completed' && status !== 'cancelled' && (
        <div className="glass-panel scheduled-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <strong style={{ color: 'var(--gold-primary)' }}>⏳ Schedule Pending</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.86rem' }}>
              {isTeacher ? 'Please set the session date, duration & Google Meet link.' : 'Waiting for host to set the class date & time.'}
            </p>
          </div>
          {isTeacher && onOpenEditSchedule && (
            <button
              type="button"
              className="btn btn-primary btn-pill-sm"
              onClick={() => onOpenEditSchedule(session)}
              disabled={actionLoading}
            >
              📅 Schedule Session Now
            </button>
          )}
        </div>
      )}

      {/* Scheduled Details Banner */}
      {status === 'scheduled' && scheduledAt && (
        <div className="glass-panel scheduled-banner">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <strong>📅 Class scheduled:</strong>
              <p style={{ margin: '2px 0 0' }}>{date} • {time} ({durationMins} mins)</p>
            </div>
            {isTeacher && onOpenEditSchedule && !isAfterSession && (
              <button
                type="button"
                className="btn btn-secondary btn-pill-sm"
                onClick={() => onOpenEditSchedule(session)}
                disabled={actionLoading}
                style={{ fontSize: '0.8rem', padding: '4px 12px' }}
                title="Edit class timing or meet link"
              >
                ✏️ Edit Schedule
              </button>
            )}
          </div>
        </div>
      )}

      {/* Session Lock/Unlock/Expired Status */}
      {status === 'scheduled' && scheduledAt && validSessionStartTime && (
        <div className={`glass-panel scheduled-banner session-status-banner ${
          isBeforeSession
            ? 'is-locked'
            : isDuringSession
              ? 'is-live'
              : isJoined
                ? 'is-ended'
                : 'is-expired'
        }`}>
          {isBeforeSession && (
            <>
              <strong className="session-status-title-locked">🔒 Session Locked</strong>
              <p className="session-status-desc-locked">
                Starts in {getCountdown()} ({date} at {time})
              </p>
            </>
          )}
          {isDuringSession && (
            <>
              <strong className="session-status-title-live">🔓 Session is LIVE</strong>
              <p className="session-status-desc-live">
                {isJoined
                  ? `In session — ${getSessionRemainingCountdown()} remaining`
                  : `Active now — ${getSessionRemainingCountdown()} remaining. Click Join button below to enter.`}
              </p>
            </>
          )}
          {isAfterSession && status !== 'completed' && (
            <>
              <strong className={isJoined ? 'session-status-title-ended' : 'session-status-title-expired'}>
                {isJoined ? '⏳ Session Ended' : '⏰ Session Expired — Not Completed'}
              </strong>
              <p className={isJoined ? 'session-status-desc-ended' : 'session-status-desc-expired'}>
                {isJoined
                  ? 'Booked duration has ended. Auto-completing session...'
                  : 'The scheduled time window has passed without attendance.'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Meeting Room Link Banner */}
      {meetLink && (
        <div className="session-meet-banner session-link-banner">
          <div className="meet-info">
            <span className="meet-icon">🎥</span>
            <div>
              <strong>Google Meet / Video Link</strong>
              <p>
                {canJoin
                  ? meetLink
                  : isAfterSession
                    ? 'Session expired'
                    : `🔒 Link unlocks automatically at class time (${time})`}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleJoinClick}
            disabled={actionLoading || !canJoin}
          >
            {isAfterSession
              ? '⏰ Session Expired'
              : canJoin
                ? (isJoined ? '🎥 Rejoin Google Meet →' : '🎥 Join Google Meet →')
                : `🔒 Starts in ${getCountdown() || time}`}
          </button>
        </div>
      )}

      {/* Bottom Session Meta Details */}
      <div className="session-meta-grid">
        <div className="meta-item">
          <span>Mode</span>
          <strong>{mode}</strong>
        </div>

        <div className="meta-item">
          <span>Duration</span>
          <strong>{Number(duration) || 45} mins</strong>
        </div>

        <div className="meta-item">
          <span>Credit Reward</span>
          <strong className="session-credit-earn">+1 Credit to {isTeacher ? 'You' : partnerName}</strong>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="session-card-actions">
        {(status === 'scheduled' || status === 'in_progress') && (
          <>
            {isAfterSession ? (
              isJoined ? (
                <div className="glass-panel session-auto-complete-banner">
                  ⏳ Auto-completing session...
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary btn-full session-btn-expired"
                  disabled={true}
                >
                  ❌ Not Completed
                </button>
              )
            ) : isBeforeSession ? (
              <button
                type="button"
                className="btn btn-secondary btn-full session-btn-locked"
                disabled={true}
              >
                🔒 Unlocks during session
              </button>
            ) : (
              <button
                type="button"
                className={`btn btn-primary btn-full session-btn-complete ${isJoined ? 'active' : 'disabled'}`}
                onClick={() => isJoined && onMarkComplete && onMarkComplete(id)}
                disabled={actionLoading || !isJoined}
                title={isJoined ? 'Click to complete session' : 'Join call first to enable completion'}
              >
                {actionLoading
                  ? 'Completing...'
                  : isJoined
                    ? '✓ Mark session as completed'
                    : '🔒 Join call first to mark complete'}
              </button>
            )}

            {/* Host Reschedule / Edit Button */}
            {isTeacher && onOpenEditSchedule && !isAfterSession && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onOpenEditSchedule(session)}
                disabled={actionLoading}
              >
                ✏️ Edit Date, Time &amp; Link
              </button>
            )}

            {onCancelSession && status === 'scheduled' && !isAfterSession && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onCancelSession(id)}
                disabled={actionLoading}
              >
                Cancel Session
              </button>
            )}
          </>
        )}

        {status === 'completed' && (
          <div className="session-completed-row">
            <div className="glass-panel session-completed-banner">
              ✓ Session completed
            </div>
            {onOpenReview && (
              <button
                type="button"
                className="btn btn-secondary btn-pill-sm"
                onClick={() => onOpenReview(session)}
              >
                ⭐ Rate &amp; Review
              </button>
            )}
          </div>
        )}

        {status === 'cancelled' && (
          <div className="glass-panel session-cancelled-banner">
            Session cancelled
          </div>
        )}

        {onOpenDispute && status !== 'cancelled' && (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '4px' }}>
            <button
              type="button"
              className="session-report-link-btn"
              onClick={() => onOpenDispute(session)}
              title="Report an issue or dispute for this session"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--slate-400, #94a3b8)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: '2px 8px'
              }}
            >
              🚨 Report Issue / Dispute
            </button>
          </div>
        )}
      </div>
    </div>
  );
}