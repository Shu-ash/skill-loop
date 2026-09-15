// src/components/ProfileDetailsEditor.jsx
import React from 'react';

// ProfileDetailsEditor: Clean, elegant showcase card for user bio, availability, and profile strength
export default function ProfileDetailsEditor({
  user,
  bio,
  availability = { weekdayEvenings: true, weekendMornings: false, mode: 'Online Only' },
  profileStrength = 0,
  onOpenEdit,
  onEditProfile,
  onOpenEditModal
}) {
  const displayBio = bio || user?.bio || '';
  const displayAvailability = availability || user?.availability || { weekdayEvenings: true, weekendMornings: false, mode: 'Online Only' };
  const handleEdit = onOpenEdit || onEditProfile || onOpenEditModal;

  const validStrength = Math.min(Math.max(Number(profileStrength) || 0, 0), 100);

  return (
    <div className="glass-panel profile-details-card">
      <div className="profile-card-header">
        <h3 className="profile-card-title">
          About &amp; Availability
        </h3>
        {handleEdit && (
          <button 
            type="button" 
            className="action-btn action-btn-sm" 
            onClick={handleEdit}
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {/* Bio Display Quote Card with dynamic theme styling */}
      <div className="profile-bio-display-box">
        <span className="profile-section-badge violet">
          About Me
        </span>
        <p className={`profile-bio-text ${!displayBio ? 'italic' : ''}`}>
          {displayBio || 'Tell the community about yourself, your learning goals, and what you love trading! Click "Edit" to customize.'}
        </p>
      </div>

      {/* Weekly Availability Showcase */}
      <div className="availability-section">
        <span className="profile-section-badge slate">
          Weekly Availability &amp; Mode
        </span>
        
        <div className="availability-grid">
          <div className="availability-item">
            <span className="availability-label">
              🌙 Weekday evenings
            </span>
            <span className={`pill availability-pill ${displayAvailability.weekdayEvenings ? 'pill-earned' : 'pill-spent'}`}>
              {displayAvailability.weekdayEvenings ? '✓ Available' : 'Busy'}
            </span>
          </div>

          <div className="availability-item">
            <span className="availability-label">
              ☀️ Weekend mornings
            </span>
            <span className={`pill availability-pill ${displayAvailability.weekendMornings ? 'pill-earned' : 'pill-spent'}`}>
              {displayAvailability.weekendMornings ? '✓ Available' : 'Busy'}
            </span>
          </div>

          <div className="availability-item">
            <span className="availability-label">
              🎥 Preferred Session Mode
            </span>
            <span className="pill pill-user availability-pill">
              {displayAvailability.mode || 'Online Video Only'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Strength Progress Bar */}
      <div className="profile-strength-card">
        <div className="strength-header">
          <span className="strength-title">Profile Strength</span>
          <span className="strength-score">{validStrength}%</span>
        </div>
        <div className="strength-bar-track">
          <div 
            className="strength-bar-fill" 
            style={{ width: `${validStrength}%` }}
          />
        </div>
        <p className="strength-tip">
          {validStrength === 100 ? '🎉 Amazing! Your profile is 100% complete and ready for swaps.' : '💡 Add your bio and teaching skills to reach 100% profile strength!'}
        </p>
      </div>
    </div>
  );
}
