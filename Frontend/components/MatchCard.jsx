import React from 'react';

const renderMatchAvatar = (match) => {
  if (!match) return 'SL';
  const imgUrl = match.profilePhotoUrl || (typeof match.avatar === 'string' && (match.avatar.startsWith('data:image') || match.avatar.startsWith('http')) ? match.avatar : null);

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={match.name}
        className="avatar-round-img"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }

  const initials = typeof match.avatar === 'string' && match.avatar.length <= 4 && !match.avatar.includes('/')
    ? match.avatar
    : (match.name || 'SL')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase() || 'SL';

  return initials;
};

export default function MatchCard({ match, onRequestSwap }) {
  const { name, avatarBg, title, teachSkills, learnSkills, rating } = match;

  return (
    <div className="glass-panel match-card">
      <div className="match-card-top">
        <div className="match-avatar">
          {renderMatchAvatar(match)}
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
