// src/components/EditProfileModal.jsx
import React, { useState } from 'react';

// EditProfileModal: Glassmorphic popup modal to update display name, username, headline, and bio
export default function EditProfileModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    username: user.username || '',
    headline: user.headline || '',
    bio: user.bio || '',
    skillsCanTeach: user.skillsCanTeach || [],
    skillsWantToLearn: user.skillsWantToLearn || [],
    skillLevel: user.skillLevel || 'beginner'
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

          <div className="form-group">
            <label>Skills I can teach</label>
            <input
              type="text"
              name="skillsCanTeach"
              value={formData.skillsCanTeach.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  skillsCanTeach: e.target.value
                    .split(',')
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                })
              }
              placeholder="e.g. JavaScript, React, Node.js"
            />
          </div>

          <div className="form-group">
            <label>Skills I want to learn</label>
            <input
              type="text"
              name="skillsWantToLearn"
              value={formData.skillsWantToLearn.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  skillsWantToLearn: e.target.value
                    .split(',')
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                })
              }
              placeholder="e.g. Python, MongoDB, AWS"
            />
          </div>

          <div className="form-group">
            <label>Skill Level</label>
            <select
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              className="form-input"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
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
