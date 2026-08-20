// src/components/MemberCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function MemberCard({ member }) {
  return (
    <div className="glass-panel member-card">
      <div>
        <div className="member-avatar-row">
          <div className="user-avatar" style={{ background: member.avatarBg }}>
            {member.avatar}
          </div>
          <span className="rating-text">{member.rating}</span>
        </div>
        <h4>{member.name}</h4>
        <p className="text-subtle margin-bottom-xs" style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
          {member.title}
        </p>

        {/* Member Skills section */}
        <div className="tag-picker margin-bottom" style={{ margin: '0.5rem 0 1rem' }}>
          {member.skills.map((skill, idx) => (
            <span key={idx} className="pill-badge pill-violet" style={{ marginRight: '0.3rem' }}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* View profile & swap button */}
      <Link className="btn btn-secondary btn-pill-sm btn-full" to={`/requests?user=${member.id}`}>
        View profile &amp; swap
      </Link>
    </div>
  );
}