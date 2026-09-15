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
      <div className="form-group onboarding-group-spacing">
        <div className="onboarding-label-row">
          <label className="form-label onboarding-teach-label">
            🎓 Skills You Can Teach <span className="req-star">* (at least 1)</span>
          </label>
          <span className="onboarding-count-badge">
            Selected: <strong className="teach">{teachSkills.length}</strong>
          </span>
        </div>

        {/* Selected Teach Skills Chips Tray */}
        {teachSkills.length > 0 && (
          <div className="onboarding-chips-tray teach">
            {teachSkills.map((skill) => (
              <span
                key={skill}
                className="onboarding-chip teach"
              >
                <span>⚡ {skill}</span>
                <button
                  type="button"
                  onClick={() => toggleTeachSkill(skill)}
                  className="onboarding-chip-remove"
                  title={`Remove ${skill}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Category Filter Tabs for Teach Skills */}
        <div className="onboarding-cat-scroll">
          {categories.map((cat) => {
            const isActive = currentTeachCatName === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveTeachCategory(cat.name)}
                className={`onboarding-cat-pill ${isActive ? 'teach-active' : ''}`}
              >
                <span>{cat.icon || '⚡'}</span> {cat.name}
              </button>
            );
          })}
        </div>

        {/* Category Skills Chips Grid */}
        <div className="skill-tags-grid onboarding-tags-tray-spacing">
          {currentTeachSkills.map((skill) => {
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

        {/* Custom Teach Skill Input */}
        <div className="custom-skill-input-row">
          <input
            type="text"
            className="form-input custom-skill-input onboarding-custom-input"
            placeholder="Can't find your skill? Type custom skill..."
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
            className="btn btn-secondary btn-pill-sm onboarding-custom-btn"
            onClick={addCustomTeach}
          >
            + Add
          </button>
        </div>
      </div>

      {/* SECTION 2: SKILLS TO LEARN */}
      <div className="form-group form-group-padded onboarding-group-spacing">
        <div className="onboarding-label-row">
          <label className="form-label onboarding-learn-label">
            🎯 Skills You Want to Learn <span className="req-star">* (at least 1)</span>
          </label>
          <span className="onboarding-count-badge">
            Selected: <strong className="learn">{learnSkills.length}</strong>
          </span>
        </div>

        {/* Selected Learn Skills Chips Tray */}
        {learnSkills.length > 0 && (
          <div className="onboarding-chips-tray learn">
            {learnSkills.map((skill) => (
              <span
                key={skill}
                className="onboarding-chip learn"
              >
                <span>🎯 {skill}</span>
                <button
                  type="button"
                  onClick={() => toggleLearnSkill(skill)}
                  className="onboarding-chip-remove"
                  title={`Remove ${skill}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Category Filter Tabs for Learn Skills */}
        <div className="onboarding-cat-scroll">
          {categories.map((cat) => {
            const isActive = currentLearnCatName === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setActiveLearnCategory(cat.name)}
                className={`onboarding-cat-pill ${isActive ? 'learn-active' : ''}`}
              >
                <span>{cat.icon || '⚡'}</span> {cat.name}
              </button>
            );
          })}
        </div>

        {/* Category Skills Chips Grid */}
        <div className="skill-tags-grid onboarding-tags-tray-spacing">
          {currentLearnSkills.map((skill) => {
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

        {/* Custom Learn Skill Input */}
        <div className="custom-skill-input-row">
          <input
            type="text"
            className="form-input custom-skill-input onboarding-custom-input"
            placeholder="Type any learning goal..."
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
            className="btn btn-secondary btn-pill-sm onboarding-custom-btn"
            onClick={addCustomLearn}
          >
            + Add
          </button>
        </div>
      </div>

      {/* SECTION 3: SKILL LEVEL */}
      <div className="form-group form-group-padded">
        <label className="form-label onboarding-level-label">Your Experience Level</label>
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