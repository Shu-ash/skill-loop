// src/components/OnboardingSkillsSection.jsx
import React, { useState } from 'react';

export default function OnboardingSkillsSection({
  teachSkills = [],
  toggleTeachSkill,
  customTeach,
  setCustomTeach,
  addCustomTeach,
  learnSkills = [],
  toggleLearnSkill,
  customLearn,
  setCustomLearn,
  addCustomLearn,
  skillLevel,
  setSkillLevel,
  categoriesList = []
}) {
  const [activeTeachCategory, setActiveTeachCategory] = useState('');
  const [activeLearnCategory, setActiveLearnCategory] = useState('');

  // Fallback default categories if not yet loaded from DB
  const categories = categoriesList && categoriesList.length > 0 ? categoriesList : [
    { name: 'Tech & Code', icon: '💻', skills: ['React JS', 'Node.js', 'Python', 'JavaScript', 'HTML & CSS', 'Next.js', 'MongoDB', 'SQL'] },
    { name: 'AI & Data Science', icon: '🤖', skills: ['Machine Learning', 'Prompt Engineering & LLMs', 'ChatGPT & OpenAI API', 'Data Analysis'] },
    { name: 'Design & Arts', icon: '🎨', skills: ['UI/UX Design', 'Figma & Prototyping', 'Logo & Brand Identity', 'Photoshop', 'Canva'] },
    { name: 'Languages & Study', icon: '🗣️', skills: ['English Conversation & Fluency', 'Spanish Language', 'French Language', 'Public Speaking'] },
    { name: 'Business & Growth', icon: '📈', skills: ['Digital Marketing', 'SEO Optimization', 'Content Strategy', 'Social Media Growth'] },
    { name: 'Music & Audio', icon: '🎵', skills: ['Acoustic Guitar', 'Piano Basics & Chords', 'Vocal Training', 'Music Production'] },
    { name: 'Lifestyle & Fitness', icon: '🧘', skills: ['Fitness & Gym Coaching', 'Yoga & Mindfulness', 'Cooking & Baking', 'Photography'] }
  ];

  const currentTeachCatName = activeTeachCategory || categories[0]?.name;
  const currentLearnCatName = activeLearnCategory || categories[2]?.name || categories[0]?.name;

  const currentTeachCatObj = categories.find(c => c.name === currentTeachCatName) || categories[0];
  const currentLearnCatObj = categories.find(c => c.name === currentLearnCatName) || categories[2] || categories[0];

  const currentTeachSkills = currentTeachCatObj?.skills || [];
  const currentLearnSkills = currentLearnCatObj?.skills || [];

  return (
    <div className="onboarding-section">
      <div className="section-step-title">
        <span className="step-num step-num-mint">2</span>
        <h3>Skills &amp; Expertise</h3>
      </div>

      {/* SECTION 1: SKILLS TO TEACH */}
      <div className="form-group" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label className="form-label" style={{ margin: 0, fontWeight: 700, color: 'var(--violet-primary, #6c5ce7)' }}>
            🎓 Skills You Can Teach <span className="req-star">* (at least 1)</span>
          </label>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            Selected: <strong style={{ color: 'var(--violet-primary)' }}>{teachSkills.length}</strong>
          </span>
        </div>

        {/* Selected Teach Skills Chips Tray */}
        {teachSkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.6rem 0.75rem', background: 'rgba(240, 237, 255, 0.6)', borderRadius: '14px', border: '1px solid rgba(108, 92, 231, 0.25)', marginBottom: '0.85rem' }}>
            {teachSkills.map((skill) => (
              <span
                key={skill}
                style={{
                  background: 'var(--violet-primary, #6c5ce7)',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '0.25rem 0.7rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>⚡ {skill}</span>
                <button
                  type="button"
                  onClick={() => toggleTeachSkill(skill)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700, padding: '0 2px', fontSize: '0.85rem', lineHeight: 1 }}
                  title={`Remove ${skill}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Category Filter Tabs for Teach Skills */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.4rem', marginBottom: '0.65rem', scrollbarWidth: 'none' }}>
          {categories.map((cat) => {
            const isActive = currentTeachCatName === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveTeachCategory(cat.name)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.76rem',
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: '9999px',
                  border: isActive ? '1.5px solid var(--violet-primary, #6c5ce7)' : '1px solid var(--slate-200)',
                  background: isActive ? 'var(--violet-subtle, #f0edff)' : 'white',
                  color: isActive ? 'var(--violet-primary, #6c5ce7)' : 'var(--slate-700)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{cat.icon || '⚡'}</span> {cat.name}
              </button>
            );
          })}
        </div>

        {/* Category Skills Chips Grid */}
        <div className="skill-tags-grid" style={{ marginBottom: '0.85rem' }}>
          {currentTeachSkills.map((skill) => {
            const isSelected = teachSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                className={`skill-tag-chip ${isSelected ? 'selected-teach' : ''}`}
                onClick={() => toggleTeachSkill(skill)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '9999px',
                  cursor: 'pointer'
                }}
              >
                {skill} {isSelected ? '✓' : '+'}
              </button>
            );
          })}
        </div>

        {/* Custom Teach Skill Input */}
        <div className="custom-skill-input-row">
          <input
            type="text"
            className="form-input custom-skill-input"
            placeholder="Can't find your skill? Type custom skill..."
            value={customTeach}
            onChange={(e) => setCustomTeach(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomTeach();
              }
            }}
            style={{ fontSize: '0.84rem' }}
          />
          <button
            type="button"
            className="btn btn-secondary btn-pill-sm"
            onClick={addCustomTeach}
            style={{ padding: '0.45rem 1rem' }}
          >
            + Add
          </button>
        </div>
      </div>

      {/* SECTION 2: SKILLS TO LEARN */}
      <div className="form-group form-group-padded" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <label className="form-label" style={{ margin: 0, fontWeight: 700, color: 'var(--coral-primary, #ff7675)' }}>
            🎯 Skills You Want to Learn <span className="req-star">* (at least 1)</span>
          </label>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            Selected: <strong style={{ color: '#d63031' }}>{learnSkills.length}</strong>
          </span>
        </div>

        {/* Selected Learn Skills Chips Tray */}
        {learnSkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', padding: '0.6rem 0.75rem', background: 'rgba(255, 118, 117, 0.12)', borderRadius: '14px', border: '1px solid rgba(255, 118, 117, 0.25)', marginBottom: '0.85rem' }}>
            {learnSkills.map((skill) => (
              <span
                key={skill}
                style={{
                  background: '#ff7675',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '0.25rem 0.7rem',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>🎯 {skill}</span>
                <button
                  type="button"
                  onClick={() => toggleLearnSkill(skill)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 700, padding: '0 2px', fontSize: '0.85rem', lineHeight: 1 }}
                  title={`Remove ${skill}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Category Filter Tabs for Learn Skills */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.4rem', marginBottom: '0.65rem', scrollbarWidth: 'none' }}>
          {categories.map((cat) => {
            const isActive = currentLearnCatName === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveLearnCategory(cat.name)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.76rem',
                  fontWeight: isActive ? 700 : 500,
                  borderRadius: '9999px',
                  border: isActive ? '1.5px solid #ff7675' : '1px solid var(--slate-200)',
                  background: isActive ? 'rgba(255, 118, 117, 0.12)' : 'white',
                  color: isActive ? '#d63031' : 'var(--slate-700)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{cat.icon || '⚡'}</span> {cat.name}
              </button>
            );
          })}
        </div>

        {/* Category Skills Chips Grid */}
        <div className="skill-tags-grid" style={{ marginBottom: '0.85rem' }}>
          {currentLearnSkills.map((skill) => {
            const isSelected = learnSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                className={`skill-tag-chip ${isSelected ? 'selected-learn' : ''}`}
                onClick={() => toggleLearnSkill(skill)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.8rem',
                  borderRadius: '9999px',
                  cursor: 'pointer'
                }}
              >
                {skill} {isSelected ? '✓' : '+'}
              </button>
            );
          })}
        </div>

        {/* Custom Learn Skill Input */}
        <div className="custom-skill-input-row">
          <input
            type="text"
            className="form-input custom-skill-input"
            placeholder="Type any learning goal..."
            value={customLearn}
            onChange={(e) => setCustomLearn(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomLearn();
              }
            }}
            style={{ fontSize: '0.84rem' }}
          />
          <button
            type="button"
            className="btn btn-secondary btn-pill-sm"
            onClick={addCustomLearn}
            style={{ padding: '0.45rem 1rem' }}
          >
            + Add
          </button>
        </div>
      </div>

      {/* SECTION 3: SKILL LEVEL */}
      <div className="form-group form-group-padded">
        <label className="form-label" style={{ fontWeight: 600 }}>Your Experience Level</label>
        <div className="level-pills-row">
          {[
            { label: 'Beginner', value: 'beginner' },
            { label: 'Intermediate', value: 'intermediate' },
            { label: 'Advanced', value: 'advanced' }
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              className={`level-pill-btn ${skillLevel === level.value ? 'active' : ''}`}
              onClick={() => setSkillLevel(level.value)}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}