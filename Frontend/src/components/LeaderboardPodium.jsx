// src/components/LeaderboardPodium.jsx
import React from 'react';

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
          <div className="podium-avatar-wrap" style={{ background: 'var(--violet-primary)' }}>
            {second.avatar}
          </div>
          <h4>{second.name}</h4>
          <p>{second.sessions} sessions</p>
          <span className="podium-medal">🥈</span>
        </div>
      )}

      {/* 1st Place - Gold */}
      {first && (
        <div className="podium-card podium-gold">
          <div className="podium-avatar-wrap" style={{ background: 'var(--gold-primary)' }}>
            {first.avatar}
          </div>
          <h4>{first.name}</h4>
          <p>{first.sessions} sessions</p>
          <span className="podium-medal">🥇</span>
        </div>
      )}

      {/* 3rd Place - Bronze */}
      {third && (
        <div className="podium-card podium-bronze">
          <div className="podium-avatar-wrap" style={{ background: 'var(--mint-primary)' }}>
            {third.avatar}
          </div>
          <h4>{third.name}</h4>
          <p>{third.sessions} sessions</p>
          <span className="podium-medal">🥉</span>
        </div>
      )}

    </div>
  );
}
