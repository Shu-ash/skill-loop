// src/components/ProfileHeaderCard.jsx
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ProfileHeaderCard: Shows cover banner, user avatar, display name, handle, rating, with local file pickers & Change Password
export default function ProfileHeaderCard({ 
  user = {}, 
  onCoverFileSelected,
  onUploadCover,
  onAvatarFileSelected,
  onUploadAvatar, 
  onEditProfile,
  onOpenEditModal,
  onChangePassword,
  onOpenPasswordModal
}) {
  const navigate = useNavigate();
  const coverInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const handleCoverCallback = onCoverFileSelected || onUploadCover;
  const handleAvatarCallback = onAvatarFileSelected || onUploadAvatar;
  const handleEditCallback = onEditProfile || onOpenEditModal;
  const handlePasswordCallback = onChangePassword || onOpenPasswordModal;

  const handleCoverChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && handleCoverCallback) {
      handleCoverCallback(file);
    }
    e.target.value = '';
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && handleAvatarCallback) {
      handleAvatarCallback(file);
    }
    e.target.value = '';
  };

  const hasCustomCover = Boolean(user.coverPhotoUrl);
  const hasCustomAvatar = Boolean(user.profilePhotoUrl || user.avatarUrl);

  const initials = user.avatar || (user.name ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() : 'SL');

  return (
    <div className="glass-panel profile-header-card">
      {/* Hidden File Pickers */}
      <input 
        type="file" 
        ref={coverInputRef} 
        onChange={handleCoverChange} 
        accept="image/*" 
        className="hidden-file-input" 
      />
      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={handleAvatarChange} 
        accept="image/*" 
        className="hidden-file-input" 
      />

      {/* Cover Gradient Banner with Custom Image Support */}
      <div className="profile-cover-banner">
        {hasCustomCover && (
          <img 
            src={user.coverPhotoUrl} 
            alt="Cover" 
            className="profile-cover-img" 
          />
        )}
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
          {handlePasswordCallback && (
            <button 
              type="button" 
              className="btn btn-secondary btn-pill-sm" 
              onClick={handlePasswordCallback}
              title="Change your account login password"
            >
              🔒 Password
            </button>
          )}
          {handleEditCallback && (
            <button 
              type="button" 
              className="btn btn-primary btn-pill-sm edit-profile-btn" 
              onClick={handleEditCallback}
            >
              ✏️ Edit profile
            </button>
          )}
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
              <span>📷</span>
            </div>
          </div>
        </div>

        <div className="profile-text-meta">
          <div className="name-rating-line">
            <h2>{user.name}</h2>
            <span 
              className="profile-rating-badge" 
              onClick={() => navigate('/reviews')}
              title="Click to view all your received reviews"
            >
              ⭐ {user.rating ? Number(user.rating).toFixed(1) : '5.0'} ({user.ratingCount || 0} reviews)
            </span>
          </div>
          <p className="profile-username">{user.username || '@user'}</p>
          <p className="profile-headline">{user.headline || 'SkillLoop Community Member 🚀'}</p>
        </div>
      </div>
    </div>
  );
}
