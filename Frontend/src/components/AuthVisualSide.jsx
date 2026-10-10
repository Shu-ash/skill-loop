//src/components/AuthVisualSide.jsx

import React from 'react';

export default function AuthVisualSide() {
  return (
    <div className="auth-visual-side">
      <div>
        <span className="pill-badge pill-mint auth-badge">
          SkillLoop Auth Portal
        </span>
        <h2 className="auth-visual-title">
          Every student has something to share.
        </h2>
        <p className="auth-visual-desc">
          Join a peer-to-peer student skill economy. Learn directly from peers without paying a single rupee - 100% free.
        </p>
      </div>
      <div className="auth-bottom-feature">
        <div className="feature-pill">⚡ 100% Free Skill Credits</div>
        <div className="feature-pill">🔒 Verified Student Community</div>
      </div>
    </div>
  );
}