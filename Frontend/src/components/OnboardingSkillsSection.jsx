// src/components/OnboardingSkillsSection.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MASTER_CATEGORIES } from '../data/categoriesData';
import './OnboardingSkillsSection.css';

const DEFAULT_CATEGORIES = MASTER_CATEGORIES;

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
  // Merge live categories with default curated database
  const categories = useMemo(() => {
    if (categoriesList && categoriesList.length > 0) {
      return categoriesList.map(cat => ({
        ...cat,
        icon: cat.icon || DEFAULT_CATEGORIES.find(d => d.name.toLowerCase() === cat.name.toLowerCase())?.icon || '⚡',
        skills: Array.isArray(cat.skills) && cat.skills.length > 0 
          ? cat.skills 
          : DEFAULT_CATEGORIES.find(d => d.name.toLowerCase() === cat.name.toLowerCase())?.skills || []
      }));
    }
    return DEFAULT_CATEGORIES;
  }, [categoriesList]);

  // Flatten all skills with category metadata for instant search
  const allFlattenedSkills = useMemo(() => {
    const list = [];
    const seen = new Set();
    categories.forEach(cat => {
      (cat.skills || []).forEach(skill => {
        const key = skill.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            name: skill,
            category: cat.name,
            icon: cat.icon || '⚡'
          });
        }
      });
    });
    return list;
  }, [categories]);

  // Tab State
  const [activeTeachCat, setActiveTeachCat] = useState(categories[0]?.name || 'AI & Data Science');
  const [activeLearnCat, setActiveLearnCat] = useState(categories[1]?.name || 'Tech & Code');

  // Search State for Teach
  const [teachSearch, setTeachSearch] = useState('');
  const [isTeachDropdownOpen, setIsTeachDropdownOpen] = useState(false);
  const teachSearchRef = useRef(null);

  // Search State for Learn
  const [learnSearch, setLearnSearch] = useState('');
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const learnSearchRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (teachSearchRef.current && !teachSearchRef.current.contains(e.target)) {
        setIsTeachDropdownOpen(false);
      }
      if (learnSearchRef.current && !learnSearchRef.current.contains(e.target)) {
        setIsLearnDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter Search Results for Teach
  const filteredTeachResults = useMemo(() => {
    const query = teachSearch.trim().toLowerCase();
    if (!query) return allFlattenedSkills.slice(0, 8);
    return allFlattenedSkills.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [teachSearch, allFlattenedSkills]);

  // Filter Search Results for Learn
  const filteredLearnResults = useMemo(() => {
    const query = learnSearch.trim().toLowerCase();
    if (!query) return allFlattenedSkills.slice(0, 8);
    return allFlattenedSkills.filter(item =>
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  }, [learnSearch, allFlattenedSkills]);

  // Active Category Skills
  const currentTeachCatObj = categories.find(c => c.name === activeTeachCat) || categories[0];
  const currentLearnCatObj = categories.find(c => c.name === activeLearnCat) || categories[1] || categories[0];

  const currentTeachCatSkills = currentTeachCatObj?.skills || [];
  const currentLearnCatSkills = currentLearnCatObj?.skills || [];

  // Handlers for adding custom skills safely
  const handleAddCustomTeachSkill = (customName) => {
    const skill = (customName || teachSearch).trim();
    if (skill.length < 2) return;
    if (!teachSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      toggleTeachSkill(skill);
    }
    setTeachSearch('');
    setIsTeachDropdownOpen(false);
  };

  const handleAddCustomLearnSkill = (customName) => {
    const skill = (customName || learnSearch).trim();
    if (skill.length < 2) return;
    if (!learnSkills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      toggleLearnSkill(skill);
    }
    setLearnSearch('');
    setIsLearnDropdownOpen(false);
  };

  return (
    <div className="onboarding-section">
      <div className="section-step-title">
        <span className="step-num step-num-mint">2</span>
        <h3>Skills &amp; Expertise</h3>
      </div>

      <div className="oss-container">
        {/* ======================================================== */}
        {/* SECTION 1: SKILLS YOU CAN TEACH */}
        {/* ======================================================== */}
        <div className="oss-block">
          <div className="oss-block-header">
            <label className="oss-label teach">
              🎓 Skills You Can Teach <span className="req-star">* (at least 1)</span>
            </label>
            <span className="oss-count-badge">
              Selected: <strong className="teach">{teachSkills.length}</strong>
            </span>
          </div>

          {/* Selected Teach Skills Chips Tray */}
          {teachSkills.length > 0 && (
            <div className="oss-selected-tray teach">
              {teachSkills.map((skill) => (
                <span key={skill} className="oss-chip teach">
                  <span>⚡ {skill}</span>
                  <button
                    type="button"
                    onClick={() => toggleTeachSkill(skill)}
                    className="oss-chip-remove"
                    title={`Remove ${skill}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search Dropdown Input for Teach */}
          <div className="oss-search-wrapper" ref={teachSearchRef}>
            <div className="oss-search-input-box">
              <span className="oss-search-icon">🔍</span>
              <input
                type="text"
                className="oss-search-input"
                placeholder="Search genuine skills (e.g. Python, Figma, English, React, AI...)"
                value={teachSearch}
                onChange={(e) => {
                  setTeachSearch(e.target.value);
                  setIsTeachDropdownOpen(true);
                }}
                onFocus={() => setIsTeachDropdownOpen(true)}
              />
              {teachSearch && (
                <button
                  type="button"
                  className="oss-clear-btn"
                  onClick={() => setTeachSearch('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {isTeachDropdownOpen && (
              <div className="oss-dropdown-menu">
                {filteredTeachResults.map((item) => {
                  const isSelected = teachSkills.some(s => s.toLowerCase() === item.name.toLowerCase());
                  return (
                    <div
                      key={item.name}
                      className={`oss-dropdown-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        toggleTeachSkill(item.name);
                        setTeachSearch('');
                        setIsTeachDropdownOpen(false);
                      }}
                    >
                      <div className="oss-item-lead">
                        <span>{item.icon}</span>
                        <span className="oss-item-name">{item.name}</span>
                        <span className="oss-item-cat">{item.category}</span>
                      </div>
                      <span className={`oss-item-action ${isSelected ? 'selected' : 'add-teach'}`}>
                        {isSelected ? '✓ Added' : '+ Add'}
                      </span>
                    </div>
                  );
                })}

                {/* Fallback Option for Custom Skill */}
                {teachSearch.trim().length >= 2 && !allFlattenedSkills.some(s => s.name.toLowerCase() === teachSearch.trim().toLowerCase()) && (
                  <div
                    className="oss-custom-add-item"
                    onClick={() => handleAddCustomTeachSkill(teachSearch)}
                  >
                    <span>✨</span>
                    <span>+ Add custom skill: "<strong>{teachSearch.trim()}</strong>"</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category Filter Tabs for Teach Skills */}
          <div className="oss-category-tabs">
            {categories.map((cat) => {
              const isActive = activeTeachCat === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveTeachCat(cat.name)}
                  className={`oss-category-tab ${isActive ? 'teach-active' : ''}`}
                >
                  <span>{cat.icon || '⚡'}</span> {cat.name}
                </button>
              );
            })}
          </div>

          {/* Curated Skills Tag Pills Grid */}
          <div className="oss-skills-grid">
            {currentTeachCatSkills.map((skill) => {
              const isSelected = teachSkills.some(s => s.toLowerCase() === skill.toLowerCase());
              return (
                <button
                  key={skill}
                  type="button"
                  className={`oss-skill-pill ${isSelected ? 'selected-teach' : ''}`}
                  onClick={() => toggleTeachSkill(skill)}
                >
                  <span>{skill}</span>
                  <span>{isSelected ? '✓' : '+'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: SKILLS YOU WANT TO LEARN */}
        {/* ======================================================== */}
        <div className="oss-block">
          <div className="oss-block-header">
            <label className="oss-label learn">
              🎯 Skills You Want to Learn <span className="req-star">* (at least 1)</span>
            </label>
            <span className="oss-count-badge">
              Selected: <strong className="learn">{learnSkills.length}</strong>
            </span>
          </div>

          {/* Selected Learn Skills Chips Tray */}
          {learnSkills.length > 0 && (
            <div className="oss-selected-tray learn">
              {learnSkills.map((skill) => (
                <span key={skill} className="oss-chip learn">
                  <span>🎯 {skill}</span>
                  <button
                    type="button"
                    onClick={() => toggleLearnSkill(skill)}
                    className="oss-chip-remove"
                    title={`Remove ${skill}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search Dropdown Input for Learn */}
          <div className="oss-search-wrapper" ref={learnSearchRef}>
            <div className="oss-search-input-box">
              <span className="oss-search-icon">🔍</span>
              <input
                type="text"
                className="oss-search-input"
                placeholder="Search genuine skills (e.g. AI, English, UI/UX, Python, Video Editing...)"
                value={learnSearch}
                onChange={(e) => {
                  setLearnSearch(e.target.value);
                  setIsLearnDropdownOpen(true);
                }}
                onFocus={() => setIsLearnDropdownOpen(true)}
              />
              {learnSearch && (
                <button
                  type="button"
                  className="oss-clear-btn"
                  onClick={() => setLearnSearch('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Menu */}
            {isLearnDropdownOpen && (
              <div className="oss-dropdown-menu">
                {filteredLearnResults.map((item) => {
                  const isSelected = learnSkills.some(s => s.toLowerCase() === item.name.toLowerCase());
                  return (
                    <div
                      key={item.name}
                      className={`oss-dropdown-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        toggleLearnSkill(item.name);
                        setLearnSearch('');
                        setIsLearnDropdownOpen(false);
                      }}
                    >
                      <div className="oss-item-lead">
                        <span>{item.icon}</span>
                        <span className="oss-item-name">{item.name}</span>
                        <span className="oss-item-cat">{item.category}</span>
                      </div>
                      <span className={`oss-item-action ${isSelected ? 'selected' : 'add-learn'}`}>
                        {isSelected ? '✓ Added' : '+ Add'}
                      </span>
                    </div>
                  );
                })}

                {/* Fallback Option for Custom Skill */}
                {learnSearch.trim().length >= 2 && !allFlattenedSkills.some(s => s.name.toLowerCase() === learnSearch.trim().toLowerCase()) && (
                  <div
                    className="oss-custom-add-item"
                    onClick={() => handleAddCustomLearnSkill(learnSearch)}
                  >
                    <span>✨</span>
                    <span>+ Add custom skill: "<strong>{learnSearch.trim()}</strong>"</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category Filter Tabs for Learn Skills */}
          <div className="oss-category-tabs">
            {categories.map((cat) => {
              const isActive = activeLearnCat === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setActiveLearnCat(cat.name)}
                  className={`oss-category-tab ${isActive ? 'learn-active' : ''}`}
                >
                  <span>{cat.icon || '⚡'}</span> {cat.name}
                </button>
              );
            })}
          </div>

          {/* Curated Skills Tag Pills Grid */}
          <div className="oss-skills-grid">
            {currentLearnCatSkills.map((skill) => {
              const isSelected = learnSkills.some(s => s.toLowerCase() === skill.toLowerCase());
              return (
                <button
                  key={skill}
                  type="button"
                  className={`oss-skill-pill ${isSelected ? 'selected-learn' : ''}`}
                  onClick={() => toggleLearnSkill(skill)}
                >
                  <span>{skill}</span>
                  <span>{isSelected ? '✓' : '+'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: YOUR EXPERIENCE LEVEL */}
        <div className="form-group form-group-padded">
          <label className="form-label onboarding-level-label">
            Your Experience Level
          </label>
          <div className="level-btn-grid">
            {['beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                className={`level-card-btn ${skillLevel === lvl ? 'active' : ''}`}
                onClick={() => setSkillLevel(lvl)}
              >
                <span className="level-title">
                  {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </span>
                <span className="level-desc">
                  {lvl === 'beginner' && 'Just starting out, eager to learn'}
                  {lvl === 'intermediate' && 'Comfortable, looking to refine & swap'}
                  {lvl === 'advanced' && 'Highly experienced mentor'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}