// src/components/OnboardingSkillsSection.jsx

import React from 'react';

export default function OnboardingSkillsSection({
  teachSkills,
  toggleTeachSkill,
  customTeach,
  setCustomTeach,
  addCustomTeach,
  learnSkills,
  toggleLearnSkill,
  customLearn,
  setCustomLearn,
  addCustomLearn,
  skillLevel,
  setSkillLevel,
  popularTeachSkills,
  popularLearnSkills
}) {
  return (
    <div className="onboarding-section">
      <div className="section-step-title">
        <span className="step-num" style={{ background: 'var(--mint-primary)' }}>2</span>
        <h3>Skills &amp; Expertise</h3>
      </div>

      {/* Skills to teach */}
      <div className="form-group">
        <label className="form-label">
          Can Teach <span className="req-star">* (at least 1)</span>
        </label>

        <div className="skill-tags-grid">
          {popularTeachSkills.map((skill) => {
            const isSelected = teachSkills.includes(skill);

            return (
              <button
                key={skill}
                type="button"
                className={`skill-tag-chip ${isSelected ? 'selected-teach' : ''}`}
                onClick={() => toggleTeachSkill(skill)}
              >
                {skill} {isSelected ? '✓' : '+'}
              </button>
            );
          })}
        </div>

        <div className="custom-skill-input-row">
          <input
            type="text"
            className="form-input custom-skill-input"
            placeholder="Add custom teach skill..."
            value={customTeach}
            onChange={(e) => setCustomTeach(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomTeach();
              }
            }}
          />

          <button
            type="button"
            className="btn btn-secondary btn-pill-sm"
            onClick={addCustomTeach}
          >
            Add
          </button>
        </div>
      </div>

      {/* Skills to learn */}
      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label className="form-label">
          Want to Learn <span className="req-star">* (at least 1)</span>
        </label>

        <div className="skill-tags-grid">
          {popularLearnSkills.map((skill) => {
            const isSelected = learnSkills.includes(skill);

            return (
              <button
                key={skill}
                type="button"
                className={`skill-tag-chip ${isSelected ? 'selected-learn' : ''}`}
                onClick={() => toggleLearnSkill(skill)}
              >
                {skill} {isSelected ? '✓' : '+'}
              </button>
            );
          })}
        </div>

        <div className="custom-skill-input-row">
          <input
            type="text"
            className="form-input custom-skill-input"
            placeholder="Add custom learn skill..."
            value={customLearn}
            onChange={(e) => setCustomLearn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomLearn();
              }
            }}
          />

          <button
            type="button"
            className="btn btn-secondary btn-pill-sm"
            onClick={addCustomLearn}
          >
            Add
          </button>
        </div>
      </div>

      {/* Skill level */}
      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label className="form-label">Skill Level</label>

        <div className="level-pills-row">
          {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`level-pill-btn ${skillLevel === lvl ? 'active' : ''}`}
              onClick={() => setSkillLevel(lvl)}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}