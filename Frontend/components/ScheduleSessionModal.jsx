// src/components/ScheduleSessionModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ScheduleSessionModal({
  isOpen,
  onClose,
  request,
  onSubmit,
  loading = false
}) {
  if (!isOpen || !request) return null;

  const partnerName = request.user?.name || 'Student';
  const skillWant = request.skillWant || 'Skill Swap';

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

  const [scheduledAt, setScheduledAt] = useState(getTomorrowDateTime());
  const [duration, setDuration] = useState(45);
  const [mode, setMode] = useState('online');
  const [meetLink, setMeetLink] = useState(`https://meet.google.com/skillloop-${request.id?.toString().slice(-6) || 'session'}`);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!scheduledAt) {
      setError('Please select a date and time for the class.');
      return;
    }

    if (new Date(scheduledAt) <= new Date()) {
      setError('Please pick a future time for the class.');
      return;
    }

    if (mode === 'online' && !meetLink.trim()) {
      setError('Please provide a Google Meet or Zoom meeting link.');
      return;
    }

    onSubmit({
      requestId: request.id,
      scheduledAt,
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
            <span className="user-modal-header-icon">📅</span>
            <div>
              <h3 className="user-modal-title">
                Schedule Session
              </h3>
              <p className="user-modal-subtitle">
                Teaching <strong>{skillWant}</strong> to <strong>{partnerName}</strong>
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
              🗓️ Select Class Date &amp; Time *
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
              <option value={15}>15 Minutes</option>
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
              <option value="online">🎥 Online Video Call (Google Meet)</option>
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
              <span className="user-modal-hint">
                🔒 <em>Note: The meeting link will stay locked for both participants and will automatically unlock when class time arrives.</em>
              </span>
            </div>
          )}

          {/* Notes for Student */}
          <div className="form-group user-modal-form-group spacing-lg">
            <label className="form-label user-modal-label">
              💬 Note for {partnerName} (Optional)
            </label>
            <textarea
              className="form-input user-modal-textarea"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${partnerName}! Looking forward to our session.`}
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
              {loading ? 'Scheduling...' : 'Confirm & Schedule Class 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : null;
}
