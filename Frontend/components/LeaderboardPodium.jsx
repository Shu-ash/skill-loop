// src/components/LeaderboardPodium.jsx
import React from 'react';

// Safe avatar renderer: never output raw base64 strings as text!
const renderAvatar = (teacher) => {
  if (!teacher) return 'SL';
  const imgUrl = teacher.profilePhotoUrl || (typeof teacher.avatar === 'string' && (teacher.avatar.startsWith('data:image') || teacher.avatar.startsWith('http')) ? teacher.avatar : null);

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={teacher.name}
        className="avatar-round-img"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }

  const initials = typeof teacher.avatar === 'string' && teacher.avatar.length <= 4 && !teacher.avatar.includes('/')
    ? teacher.avatar
    : (teacher.name || 'SL')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase() || 'SL';

  return initials;
};

// LeaderboardPodium: Top 3 teachers podium cards (#1 Gold, #2 Silver, #3 Bronze)
export default function LeaderboardPodium({ topTeachers = [] }) {
  // Sort or extract 1st, 2nd, 3rd places
  const first = topTeachers.find((t) => t.rank === 1) || topTeachers[0];
  const second = topTeachers.find((t) => t.rank === 2) || topTeachers[1];
  const third = topTeachers.find((t) => t.rank === 3) || topTeachers[2];

  return (
    <div className="podium-container">
      
      {/* 2nd Place - Silver */}
      {second && (
        <div className="podium-card podium-silver">
          <div className="podium-avatar-wrap">
            {renderAvatar(second)}
          </div>
          <h4>{second.name}</h4>
          <p>{second.sessions} sessions</p>
          <span className="podium-medal">🥈</span>
        </div>
      )}

      {/* 1st Place - Gold */}
      {first && (
        <div className="podium-card podium-gold">
          <div className="podium-avatar-wrap">
            {renderAvatar(first)}
          </div>
          <h4>{first.name}</h4>
          <p>{first.sessions} sessions</p>
          <span className="podium-medal">🥇</span>
        </div>
      )}

      {/* 3rd Place - Bronze */}
      {third && (
        <div className="podium-card podium-bronze">
          <div className="podium-avatar-wrap">
            {renderAvatar(third)}
          </div>
          <h4>{third.name}</h4>
          <p>{third.sessions} sessions</p>
          <span className="podium-medal">🥉</span>
        </div>
      )}

    </div>
  );
}
