// src/components/SkillLoopSummaryCard.jsx

import React from 'react';

export default function SkillLoopSummaryCard({ teachSkills = [], learnSkills = [] }) {
  return (
    <div className="glass-panel skill-loop-summary-card">
      <div className="loop-card-header">
        <h3>Your skill loop</h3>
        <span className="pill-badge pill-mint">Active Trading</span>
      </div>

      <div className="skill-loop-grid">
        {/* TEACH BOX */}
        <div className="loop-box loop-box-teach">
          <div className="loop-box-label">
            <span className="pill-badge pill-violet">TEACH</span>
            <span className="loop-credit-earn">+1 Credit per session</span>
          </div>
          <div className="loop-tags-list">
            {teachSkills.map((skill) => (
              <span key={skill} className="skill-pill pill-violet">
                {skill}
              </span>
            ))}
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
            {learnSkills.map((skill) => (
              <span key={skill} className="skill-pill pill-mint">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
