// src/components/LeaderboardTable.jsx
import React from 'react';

const renderAvatar = (member) => {
  if (!member) return 'SL';
  const imgUrl = member.profilePhotoUrl || (typeof member.avatar === 'string' && (member.avatar.startsWith('data:image') || member.avatar.startsWith('http')) ? member.avatar : null);

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={member.name}
        className="avatar-round-img"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }

  const initials = typeof member.avatar === 'string' && member.avatar.length <= 4 && !member.avatar.includes('/')
    ? member.avatar
    : (member.name || 'SL')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase() || 'SL';

  return initials;
};

// LeaderboardTable: Ranked list table for teachers ranked #4 onwards
export default function LeaderboardTable({ members = [] }) {
  return (
    <div className="glass-panel leaderboard-table-card">
      <div className="leaderboard-list">
        {members.map((member) => (
          <div key={member.rank} className={`leaderboard-row ${member.isCurrentUser ? 'current-user-row' : ''}`}>
            <span className="rank-num">{member.rank}</span>
            <div className="rank-avatar">
              {renderAvatar(member)}
            </div>
            <div className="rank-user-info">
              <h4>{member.name} {member.isCurrentUser && '(you)'}</h4>
              <p>{member.skills}</p>
            </div>
            <span className="rank-rating">★★★★★</span>
            <span className="rank-sessions-badge">{member.sessions} taught</span>
          </div>
        ))}
      </div>
    </div>
  );
}
