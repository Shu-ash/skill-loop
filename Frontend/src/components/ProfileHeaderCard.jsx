// src/components/ProfileHeaderCard.jsx
import React, { useRef } from 'react';

// ProfileHeaderCard: Shows cover banner, user avatar, display name, handle, rating, with local file pickers
export default function ProfileHeaderCard({ 
  user, 
  onCoverFileSelected, 
  onAvatarFileSelected, 
  onEditProfile 
}) {
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const handleCoverChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      onCoverFileSelected(file);
    }
    e.target.value = '';
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      onAvatarFileSelected(file);
    }
    e.target.value = '';
  };

  const hasCustomCover = Boolean(user.coverPhotoUrl);
  const hasCustomAvatar = Boolean(user.profilePhotoUrl || user.avatarUrl);

  const initials = user.avatar || (user.name ? user.name.slice(0, 2).toUpperCase() : 'SL');

  return (
    <div className="glass-panel profile-header-card">
      {/* Hidden File Pickers */}
      <input 
        type="file" 
        ref={coverInputRef} 
        onChange={handleCoverChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={handleAvatarChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />

      {/* Cover Gradient Banner with Custom Image Support */}
      <div 
        className="profile-cover-banner"
        style={hasCustomCover ? {
          backgroundImage: `url(${user.coverPhotoUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
      >
        <div className="cover-actions-row">
          <button 
            type="button" 
            className="btn btn-secondary btn-pill-sm edit-cover-btn" 
            onClick={() => coverInputRef.current?.click()}
            title="Upload custom cover banner from PC"
          >
            🖼️ Change cover
          </button>
          <button 
            type="button" 
            className="btn btn-secondary btn-pill-sm edit-avatar-top-btn" 
            onClick={() => avatarInputRef.current?.click()}
            title="Upload new profile picture from PC"
          >
            📷 Change photo
          </button>
          <button 
            type="button" 
            className="btn btn-primary btn-pill-sm edit-profile-btn" 
            onClick={onEditProfile}
          >
            ✏️ Edit profile
          </button>
        </div>
      </div>

      {/* Profile Main Info */}
      <div className="profile-info-row">
        {/* Avatar with Floating Camera Action Badge */}
        <div className="profile-avatar-wrapper">
          <div 
            className="profile-avatar-large"
            onClick={() => avatarInputRef.current?.click()}
            title="Click to change profile picture"
          >
            {hasCustomAvatar ? (
              <img 
                src={user.profilePhotoUrl || user.avatarUrl} 
                alt={user.name} 
                className="profile-avatar-img"
              />
            ) : (
              initials
            )}
            
            <div className="avatar-hover-overlay">
              <span>📷 Change</span>
            </div>
          </div>

          <button
            type="button"
            className="avatar-camera-badge"
            onClick={() => avatarInputRef.current?.click()}
            title="Upload new profile photo"
            aria-label="Upload new profile photo"
          >
            📷
          </button>
        </div>

        <div className="profile-text-meta">
          <div className="name-rating-line">
            <h2>{user.name}</h2>
            <span className="profile-rating-badge">⭐ {user.rating || '4.9'} (24 reviews)</span>
          </div>
          <p className="profile-username">{user.username || '@user'}</p>
          <p className="profile-headline">{user.headline || 'SkillLoop Community Member 🚀'}</p>
        </div>
      </div>
    </div>
  );
}
