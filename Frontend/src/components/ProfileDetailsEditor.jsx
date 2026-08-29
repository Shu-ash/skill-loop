// src/components/ProfileDetailsEditor.jsx
import React from 'react';

// ProfileDetailsEditor: Form section for updating bio, availability settings, and profile strength indicator
export default function ProfileDetailsEditor({
  bio,
  setBio,
  availability,
  toggleAvailability,
  profileStrength = 85
}) {
  return (
    <div className="glass-panel profile-details-card">
      <h3>About &amp; Availability</h3>

      {/* Bio Textarea */}
      <div className="form-group form-group-spaced">
        <label className="form-label">About Me</label>
        <textarea
          className="form-input form-textarea"
          rows="3"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="I've been building React apps for 3 years and love trading skills with peers..."
        ></textarea>
      </div>

      {/* Availability Settings Toggles */}
      <div className="availability-section">
        <label className="form-label">Weekly Availability</label>
        <div className="availability-grid">
          
          <div className="availability-item">
            <span>Weekday evenings</span>
            <button
              type="button"
              className={`toggle-btn ${availability.weekdayEvenings ? 'active' : ''}`}
              onClick={() => toggleAvailability('weekdayEvenings')}
            >
              {availability.weekdayEvenings ? 'On' : 'Off'}
            </button>
          </div>

          <div className="availability-item">
            <span>Weekend mornings</span>
            <button
              type="button"
              className={`toggle-btn ${availability.weekendMornings ? 'active' : ''}`}
              onClick={() => toggleAvailability('weekendMornings')}
            >
              {availability.weekendMornings ? 'On' : 'Off'}
            </button>
          </div>

          <div className="availability-item">
            <span>Session Mode</span>
            <span className="pill-badge pill-white">Online Only</span>
          </div>

        </div>
      </div>

      {/* Profile Strength Progress Bar */}
      <div className="profile-strength-card">
        <div className="strength-header">
          <span>Profile Strength</span>
          <span>{profileStrength}%</span>
        </div>
        <div className="strength-bar-track">
          <div className="strength-bar-fill" style={{ width: `${profileStrength}%` }}></div>
        </div>
        <p className="strength-tip">💡 Add a portfolio link or video intro to reach 100% strength!</p>
      </div>
    </div>
  );
}
