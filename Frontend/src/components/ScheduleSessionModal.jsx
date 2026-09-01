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
          maxWidth: '500px',
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
                Teaching <strong>{skillWant}</strong> to <strong>{partnerName}</strong>
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
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              🗓️ Select Class Date &amp; Time *
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

          {/* Duration */}
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              ⏱️ Session Duration *
            </label>
            <select
              className="form-input"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
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
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              📍 Session Mode
            </label>
            <select
              className="form-input"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
            >
              <option value="online">🎥 Online Video Call (Google Meet)</option>
              <option value="in_person">🤝 In-Person Meeting</option>
            </select>
          </div>

          {/* Video Meet Link */}
          {mode === 'online' && (
            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                🎥 Google Meet / Zoom Link *
              </label>
              <input
                className="form-input"
                type="url"
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                required
                disabled={loading}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'block', marginTop: '0.35rem' }}>
                🔒 <em>Note: The meeting link will stay locked for both participants and will automatically unlock when class time arrives.</em>
              </span>
            </div>
          )}

          {/* Notes for Student */}
          <div className="form-group" style={{ marginBottom: '1.4rem' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '0.88rem' }}>
              💬 Note for {partnerName} (Optional)
            </label>
            <textarea
              className="form-input"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi ${partnerName}! Looking forward to our session.`}
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
