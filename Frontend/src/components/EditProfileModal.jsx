// src/components/EditProfileModal.jsx
import React, { useState } from 'react';

// EditProfileModal: Glassmorphic popup modal to update display name, username, headline, and bio
export default function EditProfileModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    headline: user.headline || '',
    bio: user.bio || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel edit-profile-modal-box clay-card-3d" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✏️ Edit Profile Details</h3>
          <button type="button" className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label>Display Name *</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              placeholder="e.g. Harsh Vishwakarma" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Username / Handle *</label>
            <input 
              type="text" 
              name="username" 
              value={formData.username} 
              onChange={handleChange}
              placeholder="e.g. @harsh_dev" 
              required 
            />
          </div>

          <div className="form-group">
            <label>Short Headline</label>
            <input 
              type="text" 
              name="headline" 
              value={formData.headline} 
              onChange={handleChange}
              placeholder="e.g. Frontend developer & UI enthusiast" 
            />
          </div>

          <div className="form-group">
            <label>About Bio</label>
            <textarea 
              name="bio" 
              rows="3" 
              value={formData.bio} 
              onChange={handleChange}
              placeholder="Share a short summary about your background and interests..." 
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
