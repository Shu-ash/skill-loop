// src/components/SessionCard.jsx
import React, { useState, useEffect } from 'react';

export default function SessionCard({
  session,
  onJoinCall,
  onStartSession,
  onMarkComplete,
  onCancelSession,
  onScheduleSession,
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

  const [scheduledAtInput, setScheduledAtInput] = useState(() => {
    if (!scheduledAt) return '';
    try {
      const d = new Date(scheduledAt);
      if (Number.isNaN(d.getTime())) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const h = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${day}T${h}:${min}`;
    } catch {
      return '';
    }
  });
  const [selectedDuration, setSelectedDuration] = useState(durationMins);
  const [sessionMode, setSessionMode] = useState(mode === 'in_person' ? 'in_person' : 'online');
  const [meetLinkInput, setMeetLinkInput] = useState(meetLink || '');

  // Keep internal form inputs in sync with session prop updates
  useEffect(() => {
    if (meetLink) setMeetLinkInput(meetLink);
  }, [meetLink]);

  useEffect(() => {
    if (duration) setSelectedDuration(Number(duration) || 45);
  }, [duration]);

  useEffect(() => {
    if (mode) setSessionMode(mode === 'in_person' ? 'in_person' : 'online');
  }, [mode]);

  useEffect(() => {
    if (scheduledAt) {
      try {
        const d = new Date(scheduledAt);
        if (!Number.isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const h = String(d.getHours()).padStart(2, '0');
          const min = String(d.getMinutes()).padStart(2, '0');
          setScheduledAtInput(`${y}-${m}-${day}T${h}:${min}`);
        }
      } catch (e) {}
    }
  }, [scheduledAt]);

  const getStatusLabel = () => {
    if (status === 'cancelled') return 'CANCELLED';
    if (isCompleted) return 'COMPLETED';
    if (status === 'in_progress') return 'IN PROGRESS';
    if (isLiveWindow) return 'READY TO JOIN';
    return 'SCHEDULED';
  };

  const getMinDateTime = () => {
    // 15-minute grace period to allow present time & slight clock differences
    const now = new Date(Date.now() - 15 * 60 * 1000);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const setPresetDateTime = (offsetMinutes) => {
    const target = new Date(Date.now() + offsetMinutes * 60 * 1000);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, '0');
    const d = String(target.getDate()).padStart(2, '0');
    const h = String(target.getHours()).padStart(2, '0');
    const min = String(target.getMinutes()).padStart(2, '0');
    setScheduledAtInput(`${y}-${m}-${d}T${h}:${min}`);
  };

  const handleSchedule = () => {
    if (!onScheduleSession) return;

    if (!scheduledAtInput) {
      alert('Please select a date and time.');
      return;
    }

    const selectedDate = new Date(scheduledAtInput);
    if (Number.isNaN(selectedDate.getTime())) {
      alert('Please select a valid date and time.');
      return;
    }

    // Allow present time (with 15-min grace buffer for clock skew) or any future date/time
    const graceWindow = new Date(Date.now() - 15 * 60 * 1000);
    if (selectedDate < graceWindow) {
      alert('Please select a present or future date and time.');
      return;
    }

    const finalDuration = Number(selectedDuration);
    const allowedDurations = [15, 30, 45, 60, 90, 120];
    if (!allowedDurations.includes(finalDuration)) {
      alert('Please select a valid duration.');
      return;
    }

    if (sessionMode !== 'online' && sessionMode !== 'in_person') {
      alert('Please select a valid session mode.');
      return;
    }

    if (sessionMode === 'online' && !meetLinkInput.trim()) {
      alert('Please enter the Google Meet link.');
      return;
    }

    onScheduleSession(
      id,
      selectedDate.toISOString(),
      sessionMode,
      sessionMode === 'online' ? meetLinkInput.trim() : '',
      finalDuration
    );
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
              {isTeacher ? '🎓 You are the Teacher' : '🎒 You are the Student'}
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
            {isTeacher ? `Student: ${partnerName}` : `Teacher: ${partnerName}`} • <strong>{date}</strong> at <strong>{time}</strong> ({durationMins} mins)
          </p>
        </div>

        <div className={`partner-avatar-circle ${isTeacher ? 'partner-avatar-teacher' : 'partner-avatar-student'}`}>
          {partnerAvatar}
        </div>
      </div>

      {/* Schedule Form for Teacher if unscheduled */}
      {isTeacher && (status === 'pending' || (status === 'scheduled' && !scheduledAt && !meetLink)) && (
        <div className="glass-panel request-inline-form">
          <h4>📅 Schedule Session</h4>
          <p>Choose when you want to conduct this session.</p>

          <div className="form-group">
            <label htmlFor="scheduledAt">Date &amp; Time</label>
            <input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAtInput}
              min={getMinDateTime()}
              onChange={(e) => setScheduledAtInput(e.target.value)}
              disabled={actionLoading}
            />
            <div className="session-preset-buttons-row">
              <button
                type="button"
                className="btn btn-secondary btn-pill-sm session-preset-btn"
                onClick={() => setPresetDateTime(0)}
                disabled={actionLoading}
                title="Schedule for right now"
              >
                ⚡ Today (Now)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-pill-sm session-preset-btn"
                onClick={() => setPresetDateTime(10)}
                disabled={actionLoading}
                title="Schedule for 10 minutes from now"
              >
                ⚡ Today (+10 mins)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-pill-sm session-preset-btn"
                onClick={() => setPresetDateTime(24 * 60)}
                disabled={actionLoading}
                title="Schedule for tomorrow at current time"
              >
                📅 Tomorrow (Same time)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="sessionDuration">Duration</label>
            <select
              id="sessionDuration"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              disabled={actionLoading}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sessionMode">Session Mode</label>
            <select
              id="sessionMode"
              value={sessionMode}
              onChange={(e) => setSessionMode(e.target.value)}
              disabled={actionLoading}
            >
              <option value="online">Online</option>
              <option value="in_person">In Person</option>
            </select>
          </div>

          {sessionMode === 'online' && (
            <div className="form-group">
              <label htmlFor="meetLink">Google Meet Link</label>
              <input
                id="meetLink"
                type="url"
                value={meetLinkInput}
                onChange={(e) => setMeetLinkInput(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                disabled={actionLoading}
              />
            </div>
          )}

          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={handleSchedule}
            disabled={
              actionLoading ||
              !scheduledAtInput ||
              (sessionMode === 'online' && !meetLinkInput.trim())
            }
          >
            {actionLoading ? 'Scheduling...' : '📅 Schedule Session'}
          </button>
        </div>
      )}

      {/* Scheduled Details Banner */}
      {status === 'scheduled' && scheduledAt && (
        <div className="glass-panel scheduled-banner">
          <strong>📅 Session scheduled</strong>
          <p>{date} • {time}</p>
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
              <strong>Google Meet Link</strong>
              <p>
                {canJoin
                  ? meetLink
                  : isAfterSession
                    ? 'Session expired'
                    : `🔒 Link unlocks during session (${time})`}
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
          <strong className="session-credit-earn">+1 Credit to {partnerName}</strong>
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
      </div>
    </div>
  );
}