// src/components/OnboardingSkillsSection.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MASTER_CATEGORIES } from '../data/categoriesData';
import './OnboardingSkillsSection.css';

const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_CATEGORIES = MASTER_CATEGORIES;

export default function OnboardingSkillsSection({
  teachSkills = [],
  toggleTeachSkill,
  learnSkills = [],
  toggleLearnSkill,
  skillLevel,
  setSkillLevel,
  categoriesList = []
}) {
  const [dbSkills, setDbSkills] = useState([]);
  const [liveTeachSuggestions, setLiveTeachSuggestions] = useState(null);
  const [liveLearnSuggestions, setLiveLearnSuggestions] = useState(null);

  // Merge live categories with default curated database
  const categories = useMemo(() => {
    if (categoriesList && categoriesList.length > 0) {
      return categoriesList.map((cat) => {
        const masterMatch = DEFAULT_CATEGORIES.find(
          (d) => d.name.toLowerCase() === (cat.name || '').toLowerCase()
        );
        const mergedSkills = Array.from(
          new Set([
            ...(Array.isArray(cat.skills) ? cat.skills : []),
            ...(masterMatch?.skills || [])
          ])
        );
        return {
          ...cat,
          icon: cat.icon || masterMatch?.icon || '⚡',
          skills: mergedSkills
        };
      });
    }
    return DEFAULT_CATEGORIES;
  }, [categoriesList]);

  // Fetch all active skills from backend MongoDB on mount
  useEffect(() => {
    let isMounted = true;
    const fetchAllDbSkills = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/skills?limit=200`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.data?.skills)) {
          setDbSkills(data.data.skills);
        }
      } catch (err) {
        console.error('Failed to fetch live skills in OnboardingSkillsSection:', err);
      }
    };
    fetchAllDbSkills();
    return () => {
      isMounted = false;
    };
  }, []);

  // Flatten all valid database skills with category metadata and aliases
  const allFlattenedSkills = useMemo(() => {
    const list = [];
    const seen = new Map();

    // 1. Add skills from live /api/skills endpoint (includes aliases)
    dbSkills.forEach((sk) => {
      const name = (sk.name || '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        const entry = {
          name,
          category: sk.category?.name || sk.categoryName || 'General',
          icon: sk.category?.icon || sk.icon || '⚡',
          aliases: Array.isArray(sk.aliases) ? sk.aliases.map((a) => String(a).toLowerCase()) : [],
          isPopular: Boolean(sk.isPopular)
        };
        seen.set(key, entry);
        list.push(entry);
      }
    });

    // 2. Ensure all category skills are also represented
    categories.forEach((cat) => {
      (cat.skills || []).forEach((skill) => {
        const name = String(skill || '').trim();
        if (!name) return;
        const key = name.toLowerCase();
        if (!seen.has(key)) {
          const entry = {
            name,
            category: cat.name,
            icon: cat.icon || '⚡',
            aliases: [],
            isPopular: false
          };
          seen.set(key, entry);
          list.push(entry);
        }
      });
    });

    return list;
  }, [dbSkills, categories]);

  // Tab State
  const [activeTeachCat, setActiveTeachCat] = useState(categories[0]?.name || 'AI & Data Science');
  const [activeLearnCat, setActiveLearnCat] = useState(categories[1]?.name || 'Tech & Code');

  // Search State for Teach
  const [teachSearch, setTeachSearch] = useState('');
  const [isTeachDropdownOpen, setIsTeachDropdownOpen] = useState(false);
  const [focusedTeachIdx, setFocusedTeachIdx] = useState(-1);
  const [teachError, setTeachError] = useState('');
  const teachSearchRef = useRef(null);

  // Search State for Learn
  const [learnSearch, setLearnSearch] = useState('');
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const [focusedLearnIdx, setFocusedLearnIdx] = useState(-1);
  const [learnError, setLearnError] = useState('');
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

  // Live Backend Search for Teach Input
  useEffect(() => {
    const q = teachSearch.trim();
    if (!q) {
      setLiveTeachSuggestions(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/skills?search=${encodeURIComponent(q)}&limit=20`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.skills)) {
          setLiveTeachSuggestions(
            data.data.skills.map((sk) => ({
              name: sk.name,
              category: sk.category?.name || sk.categoryName || 'General',
              icon: sk.category?.icon || sk.icon || '⚡',
              aliases: Array.isArray(sk.aliases) ? sk.aliases.map((a) => String(a).toLowerCase()) : []
            }))
          );
        }
      } catch (e) {
        // Fallback to local database list
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [teachSearch]);

  // Live Backend Search for Learn Input
  useEffect(() => {
    const q = learnSearch.trim();
    if (!q) {
      setLiveLearnSuggestions(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/skills?search=${encodeURIComponent(q)}&limit=20`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.skills)) {
          setLiveLearnSuggestions(
            data.data.skills.map((sk) => ({
              name: sk.name,
              category: sk.category?.name || sk.categoryName || 'General',
              icon: sk.category?.icon || sk.icon || '⚡',
              aliases: Array.isArray(sk.aliases) ? sk.aliases.map((a) => String(a).toLowerCase()) : []
            }))
          );
        }
      } catch (e) {
        // Fallback to local database list
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [learnSearch]);

  // Helper to filter and rank skills locally against database list
  const filterSkillsList = (queryRaw, backendResults) => {
    const query = queryRaw.trim().toLowerCase();
    if (!query) {
      return allFlattenedSkills.slice(0, 10);
    }

    const localMatches = allFlattenedSkills.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.aliases && item.aliases.some((al) => al.includes(query)))
    );

    const combinedMap = new Map();
    if (Array.isArray(backendResults)) {
      backendResults.forEach((item) => {
        combinedMap.set(item.name.toLowerCase(), item);
      });
    }
    localMatches.forEach((item) => {
      if (!combinedMap.has(item.name.toLowerCase())) {
        combinedMap.set(item.name.toLowerCase(), item);
      }
    });

    const combined = Array.from(combinedMap.values());
    combined.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aExact = aName === query || (a.aliases || []).includes(query);
      const bExact = bName === query || (b.aliases || []).includes(query);
      if (aExact !== bExact) return aExact ? -1 : 1;

      const aStarts = aName.startsWith(query);
      const bStarts = bName.startsWith(query);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;

      return aName.localeCompare(bName);
    });

    return combined.slice(0, 12);
  };

  // Filter Search Results for Teach
  const filteredTeachResults = useMemo(
    () => filterSkillsList(teachSearch, liveTeachSuggestions),
    [teachSearch, liveTeachSuggestions, allFlattenedSkills]
  );

  // Filter Search Results for Learn
  const filteredLearnResults = useMemo(
    () => filterSkillsList(learnSearch, liveLearnSuggestions),
    [learnSearch, liveLearnSuggestions, allFlattenedSkills]
  );

  // Active Category Skills
  const currentTeachCatObj = categories.find((c) => c.name === activeTeachCat) || categories[0];
  const currentLearnCatObj =
    categories.find((c) => c.name === activeLearnCat) || categories[1] || categories[0];

  const currentTeachCatSkills = currentTeachCatObj?.skills || [];
  const currentLearnCatSkills = currentLearnCatObj?.skills || [];

  // Resolve a typed skill against the database only (returns canonical skill name or null)
  const resolveDatabaseSkill = (rawText, filteredList = []) => {
    const clean = (rawText || '').trim().toLowerCase();
    if (!clean) return null;

    // 1. Exact name or alias match in allFlattenedSkills
    const exactMatch = allFlattenedSkills.find(
      (item) =>
        item.name.toLowerCase() === clean ||
        (item.aliases && item.aliases.includes(clean))
    );
    if (exactMatch) return exactMatch.name;

    // 2. If there is exactly 1 matching suggestion in the dropdown, use it
    if (filteredList.length === 1) {
      return filteredList[0].name;
    }

    return null;
  };

  // Select a verified skill for Teach
  const handleSelectTeachSkill = (skillName) => {
    setTeachError('');
    const isAlreadySelected = teachSkills.some(
      (s) => s.toLowerCase() === skillName.toLowerCase()
    );
    if (!isAlreadySelected) {
      toggleTeachSkill(skillName);
    }
    setTeachSearch('');
    setFocusedTeachIdx(-1);
    setIsTeachDropdownOpen(false);
  };

  // Attempt to add from Teach input (Enter key or button) — blocks non-database skills
  const handleAttemptAddTeach = () => {
    const raw = teachSearch.trim();
    if (!raw) return;

    if (focusedTeachIdx >= 0 && focusedTeachIdx < filteredTeachResults.length) {
      handleSelectTeachSkill(filteredTeachResults[focusedTeachIdx].name);
      return;
    }

    const matchedSkillName = resolveDatabaseSkill(raw, filteredTeachResults);
    if (matchedSkillName) {
      handleSelectTeachSkill(matchedSkillName);
    } else {
      setTeachError(
        filteredTeachResults.length > 0
          ? `Please click one of the matching database skills below for "${raw}".`
          : `"${raw}" is not a recognized skill in our database. Only verified skills from the database can be added.`
      );
      setIsTeachDropdownOpen(true);
    }
  };

  // Select a verified skill for Learn
  const handleSelectLearnSkill = (skillName) => {
    setLearnError('');
    const isAlreadySelected = learnSkills.some(
      (s) => s.toLowerCase() === skillName.toLowerCase()
    );
    if (!isAlreadySelected) {
      toggleLearnSkill(skillName);
    }
    setLearnSearch('');
    setFocusedLearnIdx(-1);
    setIsLearnDropdownOpen(false);
  };

  // Attempt to add from Learn input (Enter key or button) — blocks non-database skills
  const handleAttemptAddLearn = () => {
    const raw = learnSearch.trim();
    if (!raw) return;

    if (focusedLearnIdx >= 0 && focusedLearnIdx < filteredLearnResults.length) {
      handleSelectLearnSkill(filteredLearnResults[focusedLearnIdx].name);
      return;
    }

    const matchedSkillName = resolveDatabaseSkill(raw, filteredLearnResults);
    if (matchedSkillName) {
      handleSelectLearnSkill(matchedSkillName);
    } else {
      setLearnError(
        filteredLearnResults.length > 0
          ? `Please click one of the matching database skills below for "${raw}".`
          : `"${raw}" is not a recognized skill in our database. Only verified skills from the database can be added.`
      );
      setIsLearnDropdownOpen(true);
    }
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

          {/* Live Search Dropdown Input for Teach */}
          <div className="oss-search-wrapper" ref={teachSearchRef}>
            <div className="oss-search-input-box">
              <span className="oss-search-icon">🔍</span>
              <input
                type="text"
                className="oss-search-input"
                placeholder="Search & select skills from database (e.g. Python, Figma, React JS, English...)"
                value={teachSearch}
                onChange={(e) => {
                  setTeachSearch(e.target.value);
                  setTeachError('');
                  setFocusedTeachIdx(-1);
                  setIsTeachDropdownOpen(true);
                }}
                onFocus={() => setIsTeachDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setIsTeachDropdownOpen(true);
                    setFocusedTeachIdx((prev) =>
                      prev < filteredTeachResults.length - 1 ? prev + 1 : 0
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setFocusedTeachIdx((prev) =>
                      prev > 0 ? prev - 1 : filteredTeachResults.length - 1
                    );
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAttemptAddTeach();
                  } else if (e.key === 'Escape') {
                    setIsTeachDropdownOpen(false);
                  }
                }}
              />
              {teachSearch && (
                <button
                  type="button"
                  className="oss-clear-btn"
                  onClick={() => {
                    setTeachSearch('');
                    setTeachError('');
                    setFocusedTeachIdx(-1);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {teachError && (
              <div className="oss-validation-error" role="alert">
                <span>⚠️</span>
                <span>{teachError}</span>
              </div>
            )}

            {/* Live Suggestions Dropdown Menu */}
            {isTeachDropdownOpen && (
              <div className="oss-dropdown-menu">
                <div className="oss-dropdown-header">
                  {teachSearch.trim()
                    ? `Live Database Matches (${filteredTeachResults.length})`
                    : 'Suggested Database Skills'}
                </div>

                {filteredTeachResults.length > 0 ? (
                  filteredTeachResults.map((item, idx) => {
                    const isSelected = teachSkills.some(
                      (s) => s.toLowerCase() === item.name.toLowerCase()
                    );
                    const isFocused = idx === focusedTeachIdx;
                    return (
                      <div
                        key={item.name}
                        className={`oss-dropdown-item ${isSelected ? 'selected' : ''} ${
                          isFocused ? 'focused' : ''
                        }`}
                        onMouseEnter={() => setFocusedTeachIdx(idx)}
                        onClick={() => {
                          setTeachError('');
                          toggleTeachSkill(item.name);
                          setTeachSearch('');
                          setFocusedTeachIdx(-1);
                          setIsTeachDropdownOpen(false);
                        }}
                      >
                        <div className="oss-item-lead">
                          <span>{item.icon}</span>
                          <span className="oss-item-name">{item.name}</span>
                          <span className="oss-item-cat">{item.category}</span>
                        </div>
                        <span
                          className={`oss-item-action ${
                            isSelected ? 'selected' : 'add-teach'
                          }`}
                        >
                          {isSelected ? '✓ Added' : '+ Select'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="oss-no-match-box">
                    <span className="oss-no-match-icon">🚫</span>
                    <div>
                      <div className="oss-no-match-title">
                        No skill matching &ldquo;{teachSearch.trim()}&rdquo; in database
                      </div>
                      <div className="oss-no-match-sub">
                        Unrecognized text cannot be added. Please search a valid skill or pick from the categories below.
                      </div>
                    </div>
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
              const isSelected = teachSkills.some(
                (s) => s.toLowerCase() === skill.toLowerCase()
              );
              return (
                <button
                  key={skill}
                  type="button"
                  className={`oss-skill-pill ${isSelected ? 'selected-teach' : ''}`}
                  onClick={() => {
                    setTeachError('');
                    toggleTeachSkill(skill);
                  }}
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

          {/* Live Search Dropdown Input for Learn */}
          <div className="oss-search-wrapper" ref={learnSearchRef}>
            <div className="oss-search-input-box">
              <span className="oss-search-icon">🔍</span>
              <input
                type="text"
                className="oss-search-input"
                placeholder="Search & select skills from database (e.g. Machine Learning, UI/UX Design, Spanish...)"
                value={learnSearch}
                onChange={(e) => {
                  setLearnSearch(e.target.value);
                  setLearnError('');
                  setFocusedLearnIdx(-1);
                  setIsLearnDropdownOpen(true);
                }}
                onFocus={() => setIsLearnDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setIsLearnDropdownOpen(true);
                    setFocusedLearnIdx((prev) =>
                      prev < filteredLearnResults.length - 1 ? prev + 1 : 0
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setFocusedLearnIdx((prev) =>
                      prev > 0 ? prev - 1 : filteredLearnResults.length - 1
                    );
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAttemptAddLearn();
                  } else if (e.key === 'Escape') {
                    setIsLearnDropdownOpen(false);
                  }
                }}
              />
              {learnSearch && (
                <button
                  type="button"
                  className="oss-clear-btn"
                  onClick={() => {
                    setLearnSearch('');
                    setLearnError('');
                    setFocusedLearnIdx(-1);
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {learnError && (
              <div className="oss-validation-error" role="alert">
                <span>⚠️</span>
                <span>{learnError}</span>
              </div>
            )}

            {/* Live Suggestions Dropdown Menu */}
            {isLearnDropdownOpen && (
              <div className="oss-dropdown-menu">
                <div className="oss-dropdown-header">
                  {learnSearch.trim()
                    ? `Live Database Matches (${filteredLearnResults.length})`
                    : 'Suggested Database Skills'}
                </div>

                {filteredLearnResults.length > 0 ? (
                  filteredLearnResults.map((item, idx) => {
                    const isSelected = learnSkills.some(
                      (s) => s.toLowerCase() === item.name.toLowerCase()
                    );
                    const isFocused = idx === focusedLearnIdx;
                    return (
                      <div
                        key={item.name}
                        className={`oss-dropdown-item ${isSelected ? 'selected' : ''} ${
                          isFocused ? 'focused' : ''
                        }`}
                        onMouseEnter={() => setFocusedLearnIdx(idx)}
                        onClick={() => {
                          setLearnError('');
                          toggleLearnSkill(item.name);
                          setLearnSearch('');
                          setFocusedLearnIdx(-1);
                          setIsLearnDropdownOpen(false);
                        }}
                      >
                        <div className="oss-item-lead">
                          <span>{item.icon}</span>
                          <span className="oss-item-name">{item.name}</span>
                          <span className="oss-item-cat">{item.category}</span>
                        </div>
                        <span
                          className={`oss-item-action ${
                            isSelected ? 'selected' : 'add-learn'
                          }`}
                        >
                          {isSelected ? '✓ Added' : '+ Select'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="oss-no-match-box">
                    <span className="oss-no-match-icon">🚫</span>
                    <div>
                      <div className="oss-no-match-title">
                        No skill matching &ldquo;{learnSearch.trim()}&rdquo; in database
                      </div>
                      <div className="oss-no-match-sub">
                        Unrecognized text cannot be added. Please search a valid skill or pick from the categories below.
                      </div>
                    </div>
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
              const isSelected = learnSkills.some(
                (s) => s.toLowerCase() === skill.toLowerCase()
              );
              return (
                <button
                  key={skill}
                  type="button"
                  className={`oss-skill-pill ${isSelected ? 'selected-learn' : ''}`}
                  onClick={() => {
                    setLearnError('');
                    toggleLearnSkill(skill);
                  }}
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