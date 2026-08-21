// src/components/MatchCard.jsx

import React from 'react';

export default function MatchCard({ match, onRequestSwap }) {
  const { name, avatar, avatarBg, title, teachSkills, learnSkills, rating } = match;

  return (
    <div className="glass-panel match-card">
      <div className="match-card-top">
        <div className="match-avatar" style={{ background: avatarBg || 'var(--violet-primary)' }}>
          {avatar}
        </div>
        <div>
          <h4>{name}</h4>
          <p className="match-title">{title}</p>
        </div>
        <span className="match-rating">{rating}</span>
      </div>


      {/* Skills Section */}
      <div className="match-skills-body">
        <div className="match-skill-row">
          <span className="skill-label">Teaches:</span>
          {teachSkills.map((s) => (
            <span key={s} className="pill-badge pill-mint">
              {s}
            </span>
          ))}
        </div>
        <div className="match-skill-row">
          <span className="skill-label">Wants:</span>
          {learnSkills.map((s) => (
            <span key={s} className="pill-badge pill-violet">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Request Swap Button */}
      <button 
        className="btn btn-secondary btn-full btn-pill-sm"
        onClick={() => onRequestSwap(match)}
      >
        Request swap
      </button>
    </div>
  );
}
