// src/components/ScheduleSessionModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ScheduleSessionModal({
  isOpen,
  onClose,
  request,
  onConfirmSchedule,
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

    onConfirmSchedule({
      requestId: request.id,
      scheduledAt,
      duration: Number(duration),
      mode,
      meetLink: mode === 'online' ? meetLink.trim() : '',
      message: message.trim()
    });
  };

  const modalJSX = (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <div 
        className="glass-panel clay-card-3d" 
        onClick={(e) => e.stopPropagation()} 
        style={{
          maxWidth: '520px',
          width: '100%',
          borderRadius: '24px',
          padding: '2.2rem 2rem',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.8rem' }}>📅</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>
                Schedule Session
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--slate-500)' }}>
                You are teaching <strong>{skillWant}</strong> to <strong>{partnerName}</strong>
              </p>
            </div>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '0.65rem 0.85rem', fontSize: '0.84rem', fontWeight: 600, marginBottom: '1.1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Date & Time */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              🗓️ Select Date &amp; Time *
            </label>
            <input
              className="form-input"
              type="datetime-local"
              min={getMinDateTime()}
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
            />
          </div>

          {/* Duration & Mode Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                ⏱️ Duration
              </label>
              <select
                className="form-input"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
              >
                <option value={30}>30 mins</option>
                <option value={45}>45 mins</option>
                <option value={60}>60 mins (1 Hour)</option>
                <option value={90}>90 mins</option>
                <option value={120}>120 mins (2 Hours)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                📍 Mode
              </label>
              <select
                className="form-input"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
              >
                <option value="online">🎥 Online Video Call</option>
                <option value="in_person">🤝 In-Person Meeting</option>
              </select>
            </div>
          </div>

          {/* Video Meet Link (Teacher Pastes Real Google Meet / Zoom Link) */}
          {mode === 'online' && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                🎥 Google Meet / Zoom Link *
              </label>
              <input
                className="form-input"
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij or Zoom Link"
                required
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block', marginTop: '0.35rem' }}>
                💡 Paste your Google Meet or Zoom link here. The student will receive this link to join your class.
              </span>
            </div>
          )}

          {/* Notes for Student */}
          <div className="form-group" style={{ marginBottom: '1.4rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              💬 Message / Notes for {partnerName} (Optional)
            </label>
            <textarea
              className="form-input"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${partnerName}! Please join via the Google Meet link on time. Let me know if you need to reschedule.`}
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', resize: 'vertical' }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              style={{ padding: '0.75rem 1.25rem', borderRadius: '14px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: '0.75rem 1.5rem', borderRadius: '14px', fontWeight: 700 }}
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
