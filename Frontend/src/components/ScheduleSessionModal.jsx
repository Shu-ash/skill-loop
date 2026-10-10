// src/components/ScheduleSessionModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ScheduleSessionModal({
  isOpen,
  onClose,
  request = null,
  session = null,
  onSubmit,
  loading = false
}) {
  if (!isOpen || (!request && !session)) return null;

  const target = session || request;
  const partnerName = session?.partnerName || request?.user?.name || 'Student';
  const skillTitle = session?.skill || session?.title || request?.skillWant || 'Skill Swap';
  const isEditMode = Boolean(session && session.scheduledAt);

  const getTomorrowDateTime = () => {
    const d = new Date(Date.now() + 86400000);
    d.setHours(18, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getInitialDateTime = () => {
    const rawDate = session?.scheduledAt || request?.scheduledAt;
    if (rawDate) {
      const d = new Date(rawDate);
      if (!Number.isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    }
    return getTomorrowDateTime();
  };

  const [scheduledAt, setScheduledAt] = useState(getInitialDateTime);
  const [duration, setDuration] = useState(session?.duration ? Number(session.duration) : 45);
  const [mode, setMode] = useState(
    session?.mode === 'In Person' || session?.mode === 'in_person' ? 'in_person' : 'online'
  );
  const [meetLink, setMeetLink] = useState(
    session?.meetLink ||
    `https://meet.google.com/skillloop-${(session?.id || request?.id || '').toString().slice(-6) || 'session'}`
  );
  const [message, setMessage] = useState(session?.message || request?.message || '');
  const [error, setError] = useState('');

  // Sync state whenever modal opens for a new target
  useEffect(() => {
    if (isOpen && target) {
      setScheduledAt(getInitialDateTime());
      setDuration(session?.duration ? Number(session.duration) : 45);
      setMode(session?.mode === 'In Person' || session?.mode === 'in_person' ? 'in_person' : 'online');
      setMeetLink(
        session?.meetLink ||
        `https://meet.google.com/skillloop-${(session?.id || request?.id || '').toString().slice(-6) || 'session'}`
      );
      setMessage(session?.message || request?.message || '');
      setError('');
    }
  }, [isOpen, session, request]);

  const getMinDateTime = () => {
    // 15-minute buffer for present time / clock variance
    const now = new Date(Date.now() - 15 * 60 * 1000);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const setPresetDateTime = (offsetMinutes) => {
    const targetDate = new Date(Date.now() + offsetMinutes * 60 * 1000);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    setScheduledAt(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!scheduledAt) {
      setError('Please select a date and time for the class.');
      return;
    }

    const selectedDate = new Date(scheduledAt);
    const graceWindow = new Date(Date.now() - 15 * 60 * 1000);
    if (selectedDate < graceWindow) {
      setError('Please select a present or future date and time for the class.');
      return;
    }

    if (mode === 'online' && !meetLink.trim()) {
      setError('Please provide a Google Meet or Zoom meeting link.');
      return;
    }

    onSubmit({
      sessionId: session?.id,
      requestId: request?.id,
      scheduledAt: selectedDate.toISOString(),
      duration: Number(duration) || 45,
      mode,
      meetLink: mode === 'online' ? meetLink.trim() : '',
      message: message.trim()
    });
  };

  const modalJSX = (
    <div 
      className="modal-overlay modal-overlay-portal" 
      onClick={onClose}
    >
      <div 
        className="glass-panel clay-card-3d user-modal-md user-modal-scrollable" 
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="user-modal-header">
          <div className="user-modal-header-lead">
            <span className="user-modal-header-icon">{isEditMode ? '✏️' : '📅'}</span>
            <div>
              <h3 className="user-modal-title">
                {isEditMode ? 'Edit / Reschedule Session' : 'Schedule Class Session'}
              </h3>
              <p className="user-modal-subtitle">
                {isEditMode ? 'Update class schedule with' : 'Teaching'} <strong>{partnerName}</strong> ({skillTitle})
              </p>
            </div>
          </div>
          <button type="button" className="close-modal-btn user-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div className="user-modal-error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Date & Time */}
          <div className="form-group user-modal-form-group">
            <label className="form-label user-modal-label">
              🗓️ Class Date &amp; Time *
            </label>
            <input
              className="form-input user-modal-input"
              type="datetime-local"
              min={getMinDateTime()}
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              disabled={loading}
            />
            {/* Quick Presets */}
            <div className="session-preset-buttons-row" style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-pill-sm"
                onClick={() => setPresetDateTime(0)}
                disabled={loading}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                ⚡ Start Now
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-pill-sm"
                onClick={() => setPresetDateTime(15)}
                disabled={loading}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                ⚡ In 15 Mins
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-pill-sm"
                onClick={() => setPresetDateTime(24 * 60)}
                disabled={loading}
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
              >
                📅 Tomorrow (Same time)
              </button>
            </div>
          </div>

          {/* Duration */}
          <div className="form-group user-modal-form-group">
            <label className="form-label user-modal-label">
              ⏱️ Session Duration *
            </label>
            <select
              className="form-input user-modal-input"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={loading}
            >
              <option value={15}>15 Minutes (Quick catchup)</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes (Recommended)</option>
              <option value={60}>60 Minutes (1 Hour)</option>
              <option value={90}>90 Minutes (1.5 Hours)</option>
              <option value={120}>120 Minutes (2 Hours)</option>
            </select>
          </div>

          {/* Mode */}
          <div className="form-group user-modal-form-group">
            <label className="form-label user-modal-label">
              📍 Session Mode
            </label>
            <select
              className="form-input user-modal-input"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={loading}
            >
              <option value="online">🎥 Online Video Call (Google Meet / Zoom)</option>
              <option value="in_person">🤝 In-Person Meeting</option>
            </select>
          </div>

          {/* Video Meet Link */}
          {mode === 'online' && (
            <div className="form-group user-modal-form-group">
              <label className="form-label user-modal-label">
                🎥 Google Meet / Zoom Link *
              </label>
              <input
                className="form-input user-modal-input"
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                required
                disabled={loading}
              />
              <span className="user-modal-hint" style={{ fontSize: '0.76rem', color: 'var(--slate-500)', marginTop: '4px', display: 'block' }}>
                🔒 <em>The meeting link is shared securely with {partnerName} and automatically unlocks when class time arrives.</em>
              </span>
            </div>
          )}

          {/* Notes for Student */}
          <div className="form-group user-modal-form-group spacing-lg">
            <label className="form-label user-modal-label">
              💬 Instructions / Note for {partnerName} (Optional)
            </label>
            <textarea
              className="form-input user-modal-textarea"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${partnerName}! Please be ready with your environment and questions.`}
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="user-modal-actions">
            <button
              type="button"
              className="btn btn-secondary user-modal-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary user-modal-btn-submit"
              disabled={loading}
            >
              {loading ? (isEditMode ? 'Updating...' : 'Scheduling...') : (isEditMode ? 'Update Session Schedule ✓' : 'Confirm & Schedule Class 🚀')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : null;
}
