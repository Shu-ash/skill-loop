// src/components/ProfileHeaderCard.jsx
import React from 'react';

// ProfileHeaderCard: Shows cover banner, user avatar, display name, handle, rating, and profile strength
export default function ProfileHeaderCard({ user, onEditCover, onEditProfile }) {
  return (
    <div className="glass-panel profile-header-card">
      {/* Cover Gradient Banner */}
      <div className="profile-cover-banner">
        <div className="cover-actions-row">
          <button type="button" className="btn btn-secondary btn-pill-sm edit-cover-btn" onClick={onEditCover}>
            📷 Edit cover
          </button>
          <button type="button" className="btn btn-primary btn-pill-sm edit-profile-btn" onClick={onEditProfile}>
            ✏️ Edit profile
          </button>
        </div>
      </div>

      {/* Profile Main Info */}
      <div className="profile-info-row">
        <div className="profile-avatar-large">
          {user.avatar || user.name.slice(0, 2).toUpperCase()}
        </div>

        <div className="profile-text-meta">
          <div className="name-rating-line">
            <h2>{user.name}</h2>
            <span className="profile-rating-badge">⭐ {user.rating || '4.9'} (24 reviews)</span>
          </div>
          <p className="profile-username">{user.username || '@harsh_dev'}</p>
          <p className="profile-headline">{user.headline || 'Frontend developer & UI enthusiast who plays too much guitar 🎸'}</p>
        </div>
      </div>
    </div>
  );
}
