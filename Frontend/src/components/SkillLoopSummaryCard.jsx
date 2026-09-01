// src/components/SkillLoopSummaryCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function SkillLoopSummaryCard({ teachSkills = [], learnSkills = [] }) {
  const hasTeach = Array.isArray(teachSkills) && teachSkills.length > 0;
  const hasLearn = Array.isArray(learnSkills) && learnSkills.length > 0;

  return (
    <div className="glass-panel skill-loop-summary-card">
      <div className="loop-card-header">
        <h3>Your skill loop</h3>
        <span className={`pill-badge ${hasTeach || hasLearn ? 'pill-mint' : 'pill-white'}`}>
          {hasTeach || hasLearn ? 'Active Trading' : 'Setup Profile'}
        </span>
      </div>

      <div className="skill-loop-grid">
        {/* TEACH BOX */}
        <div className="loop-box loop-box-teach">
          <div className="loop-box-label">
            <span className="pill-badge pill-violet">TEACH</span>
            <span className="loop-credit-earn">+1 Credit per session</span>
          </div>
          <div className="loop-tags-list">
            {hasTeach ? (
              teachSkills.map((skill) => (
                <span key={skill} className="skill-pill pill-violet">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-subtle" style={{ fontSize: '0.86rem', fontStyle: 'italic' }}>
                No teach skills added yet. <Link to="/profile" style={{ color: 'var(--violet-primary, #6c5ce7)', fontWeight: 600 }}>+ Add skills</Link>
              </span>
            )}
          </div>
        </div>

        {/* LOOP CENTER ICON */}
        <div className="loop-center-arrow">
          <span className="loop-arrow-icon">⇄</span>
        </div>

        {/* LEARN BOX */}
        <div className="loop-box loop-box-learn">
          <div className="loop-box-label">
            <span className="pill-badge pill-mint">LEARN</span>
            <span className="loop-credit-spend">-1 Credit per session</span>
          </div>
          <div className="loop-tags-list">
            {hasLearn ? (
              learnSkills.map((skill) => (
                <span key={skill} className="skill-pill pill-mint">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-subtle" style={{ fontSize: '0.86rem', fontStyle: 'italic' }}>
                No target skills selected. <Link to="/profile" style={{ color: 'var(--mint-primary, #10b981)', fontWeight: 600 }}>+ Add skills</Link>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
