// src/components/LeaderboardTable.jsx
import React from 'react';

// LeaderboardTable: Ranked list table for teachers ranked #4 onwards
export default function LeaderboardTable({ members = [] }) {
  return (
    <div className="glass-panel leaderboard-table-card">
      <div className="leaderboard-list">
        {members.map((member) => (
          <div key={member.rank} className={`leaderboard-row ${member.isCurrentUser ? 'current-user-row' : ''}`}>
            <span className="rank-num">{member.rank}</span>
            <div className="rank-avatar" style={{ background: member.avatarBg || 'var(--deep-violet)' }}>
              {member.avatar}
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
