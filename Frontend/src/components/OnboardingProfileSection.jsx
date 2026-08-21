// src/components/OnboardingProfileSection.jsx

import React from 'react';

export default function OnboardingProfileSection({
  username,
  setUsername,
  avatarUrl,
  setAvatarUrl,
  bio,
  setBio
}) {
  return (
    <div className="onboarding-section">

      {/* Profile Details Section */}
      <div className="section-step-title">
        <span className="step-num">1</span>
        <h3>Profile Details</h3>
      </div>

      <div className="form-group">
        <label className="form-label">
          Username <span className="req-star">*</span>
        </label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. harsh_dev"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Profile Photo URL <span className="opt-tag">(optional)</span>
        </label>
        <input
          type="url"
          className="form-input"
          placeholder="https://example.com/avatar.jpg"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Short Bio <span className="opt-tag">(optional)</span>
        </label>
        <textarea
          className="form-input form-textarea"
          placeholder="Tell members a little about yourself, your background, or your passion..."
          rows="3"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        ></textarea>
      </div>
    </div>
  );
}
