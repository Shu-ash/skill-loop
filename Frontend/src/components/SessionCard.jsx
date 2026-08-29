// src/components/SessionCard.jsx
import React, { useEffect, useState } from 'react';

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
    duration
  } = session;

  const [scheduledAtInput, setScheduledAtInput] = useState('');
  const [sessionMode, setSessionMode] = useState(mode === 'In Person' ? 'in_person' : 'online');
  const [meetLinkInput, setMeetLinkInput] = useState(meetLink || '');
  const [selectedDuration, setSelectedDuration] = useState(Number(duration) || 45);

  useEffect(() => {
    setSessionMode(mode === 'In Person' ? 'in_person' : 'online');
    setMeetLinkInput(meetLink || '');
    setSelectedDuration(Number(duration) || 45);

    if (scheduledAt && status === 'scheduled') {
      setScheduledAtInput('');
    }
  }, [mode, meetLink, duration, scheduledAt, status]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sessionStartTime = scheduledAt ? new Date(scheduledAt) : null;
  const validSessionStartTime = sessionStartTime && !Number.isNaN(sessionStartTime.getTime());
  const canJoin = Boolean(meetLink) && Boolean(validSessionStartTime) && currentTime >= sessionStartTime;

  const getStatusLabel = () => {
    switch (status) {
      case 'scheduled':
        return 'SCHEDULED';
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

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

    if (selectedDate <= new Date()) {
      alert('Please select a future date and time.');
      return;
    }

    const finalDuration = Number(selectedDuration);
    const allowedDurations = [30, 45, 60, 90, 120];
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
    <div className="glass-panel session-card">
      <div className="session-card-header">
        <div>
          <span className="pill-badge pill-violet">
            {getStatusLabel()}
          </span>
          <h3>{title}</h3>
          <p className="session-partner-sub">
            Session with {partnerName} • {date} at {time}
          </p>
        </div>
        <div className="partner-avatar-circle">{partnerAvatar}</div>
      </div>

      {/* Schedule Form for Teacher if unscheduled */}
      {isTeacher && status === 'scheduled' && !scheduledAt && !meetLink && (
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
          </div>

          <div className="form-group">
            <label htmlFor="sessionDuration">Duration</label>
            <select
              id="sessionDuration"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(Number(e.target.value))}
              disabled={actionLoading}
            >
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

      {/* Meeting Room Link Banner */}
      {meetLink && (
        <div className="session-meet-banner session-link-banner">
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
            onClick={() => {
              if (canJoin) {
                onJoinCall(meetLink);
              }
            }}
            disabled={actionLoading || !canJoin}
          >
            {canJoin ? '🎥 Join Google Meet →' : `🔒 Available at ${time}`}
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
    </div>
  );
}