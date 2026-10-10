// src/components/EditProfileModal.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { MASTER_CATEGORIES } from '../data/categoriesData';
import './OnboardingSkillsSection.css';

const API_BASE_URL = 'http://localhost:5000/api';

export default function EditProfileModal({
  isOpen,
  user,
  availability = {},
  initialTab = 'basic',
  onClose,
  onSave
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'basic' | 'skills' | 'availability'

  const [categoriesList, setCategoriesList] = useState(MASTER_CATEGORIES);
  const [dbSkills, setDbSkills] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    headline: '',
    bio: '',
    skillsCanTeach: [],
    skillsWantToLearn: [],
    skillLevel: 'intermediate',
    weekdayEvenings: true,
    weekendMornings: false,
    sessionMode: 'Online Only'
  });

  const [selectedTeachCategory, setSelectedTeachCategory] = useState(
    MASTER_CATEGORIES[0]?.name || ''
  );
  const [customTeachSkill, setCustomTeachSkill] = useState('');
  const [isTeachDropdownOpen, setIsTeachDropdownOpen] = useState(false);
  const [focusedTeachIdx, setFocusedTeachIdx] = useState(-1);
  const [liveTeachBackend, setLiveTeachBackend] = useState(null);
  const [teachSkillError, setTeachSkillError] = useState('');
  const teachDropdownRef = useRef(null);

  const [selectedLearnCategory, setSelectedLearnCategory] = useState(
    MASTER_CATEGORIES[1]?.name || MASTER_CATEGORIES[0]?.name || ''
  );
  const [customLearnSkill, setCustomLearnSkill] = useState('');
  const [isLearnDropdownOpen, setIsLearnDropdownOpen] = useState(false);
  const [focusedLearnIdx, setFocusedLearnIdx] = useState(-1);
  const [liveLearnBackend, setLiveLearnBackend] = useState(null);
  const [learnSkillError, setLearnSkillError] = useState('');
  const learnDropdownRef = useRef(null);

  const [submitError, setSubmitError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch live categories and all database skills from MongoDB
  useEffect(() => {
    let isMounted = true;
    const fetchLiveCatalog = async () => {
      try {
        const [catRes, skillRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories`),
          fetch(`${API_BASE_URL}/skills?limit=200`)
        ]);
        const catData = await catRes.json();
        const skillData = await skillRes.json();

        if (
          isMounted &&
          catData.success &&
          Array.isArray(catData.data?.categories) &&
          catData.data.categories.length > 0
        ) {
          const mergedCats = catData.data.categories.map((cat) => {
            const masterMatch = MASTER_CATEGORIES.find(
              (m) => m.name.toLowerCase() === (cat.name || '').toLowerCase()
            );
            const skills = Array.from(
              new Set([
                ...(Array.isArray(cat.skills) ? cat.skills : []),
                ...(masterMatch?.skills || [])
              ])
            );
            return {
              ...cat,
              icon: cat.icon || masterMatch?.icon || '⚡',
              skills
            };
          });
          setCategoriesList(mergedCats);
          setSelectedTeachCategory((prev) => prev || mergedCats[0].name);
          setSelectedLearnCategory(
            (prev) => prev || mergedCats[1]?.name || mergedCats[0].name
          );
        }

        if (isMounted && skillData.success && Array.isArray(skillData.data?.skills)) {
          setDbSkills(skillData.data.skills);
        }
      } catch (err) {
        console.error('Failed to load live skills catalog in EditProfileModal:', err);
      }
    };
    fetchLiveCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Flatten all valid database skills with category metadata & aliases
  const allDatabaseSkills = useMemo(() => {
    const list = [];
    const seen = new Map();

    dbSkills.forEach((sk) => {
      const name = (sk.name || '').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!seen.has(key)) {
        const entry = {
          name,
          category: sk.category?.name || sk.categoryName || 'General',
          icon: sk.category?.icon || sk.icon || '⚡',
          aliases: Array.isArray(sk.aliases)
            ? sk.aliases.map((a) => String(a).toLowerCase())
            : []
        };
        seen.set(key, entry);
        list.push(entry);
      }
    });

    categoriesList.forEach((cat) => {
      (cat.skills || []).forEach((skill) => {
        const name = String(skill || '').trim();
        if (!name) return;
        const key = name.toLowerCase();
        if (!seen.has(key)) {
          const entry = {
            name,
            category: cat.name,
            icon: cat.icon || '⚡',
            aliases: []
          };
          seen.set(key, entry);
          list.push(entry);
        }
      });
    });

    return list;
  }, [dbSkills, categoriesList]);

  // Close live suggestion dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (teachDropdownRef.current && !teachDropdownRef.current.contains(e.target)) {
        setIsTeachDropdownOpen(false);
      }
      if (learnDropdownRef.current && !learnDropdownRef.current.contains(e.target)) {
        setIsLearnDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Live backend search for Teach input
  useEffect(() => {
    const q = customTeachSkill.trim();
    if (!q) {
      setLiveTeachBackend(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/skills?search=${encodeURIComponent(q)}&limit=15`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.skills)) {
          setLiveTeachBackend(
            data.data.skills.map((sk) => ({
              name: sk.name,
              category: sk.category?.name || sk.categoryName || 'General',
              icon: sk.category?.icon || sk.icon || '⚡',
              aliases: Array.isArray(sk.aliases)
                ? sk.aliases.map((a) => String(a).toLowerCase())
                : []
            }))
          );
        }
      } catch (e) {}
    }, 120);
    return () => clearTimeout(timer);
  }, [customTeachSkill]);

  // Live backend search for Learn input
  useEffect(() => {
    const q = customLearnSkill.trim();
    if (!q) {
      setLiveLearnBackend(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/skills?search=${encodeURIComponent(q)}&limit=15`
        );
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.skills)) {
          setLiveLearnBackend(
            data.data.skills.map((sk) => ({
              name: sk.name,
              category: sk.category?.name || sk.categoryName || 'General',
              icon: sk.category?.icon || sk.icon || '⚡',
              aliases: Array.isArray(sk.aliases)
                ? sk.aliases.map((a) => String(a).toLowerCase())
                : []
            }))
          );
        }
      } catch (e) {}
    }, 120);
    return () => clearTimeout(timer);
  }, [customLearnSkill]);

  useEffect(() => {
    if (isOpen && user) {
      const rawTeach =
        Array.isArray(user.teachSkills) && user.teachSkills.length
          ? [...user.teachSkills]
          : Array.isArray(user.skillsCanTeach)
          ? [...user.skillsCanTeach]
          : [];
      const rawLearn =
        Array.isArray(user.learnSkills) && user.learnSkills.length
          ? [...user.learnSkills]
          : Array.isArray(user.skillsWantToLearn)
          ? [...user.skillsWantToLearn]
          : [];

      setFormData({
        name: user.name || '',
        username: (user.username || '').replace(/^@/, ''),
        headline: user.headline || '',
        bio: user.bio || '',
        skillsCanTeach: rawTeach,
        skillsWantToLearn: rawLearn,
        skillLevel: user.skillLevel || 'intermediate',
        weekdayEvenings: availability.weekdayEvenings ?? true,
        weekendMornings: availability.weekendMornings ?? false,
        sessionMode: availability.mode || 'Online Only'
      });
      setTeachSkillError('');
      setLearnSkillError('');
      setSubmitError('');
      setCustomTeachSkill('');
      setCustomLearnSkill('');
      setActiveTab(initialTab || 'basic');

      // Validate/normalize existing skills against backend database
      if (rawTeach.length > 0) {
        fetch(`${API_BASE_URL}/skills/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skills: rawTeach })
        })
          .then((r) => r.json())
          .then((d) => {
            if (d?.data?.validSkills) {
              setFormData((prev) => ({ ...prev, skillsCanTeach: d.data.validSkills }));
            }
          })
          .catch(() => {});
      }

      if (rawLearn.length > 0) {
        fetch(`${API_BASE_URL}/skills/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skills: rawLearn })
        })
          .then((r) => r.json())
          .then((d) => {
            if (d?.data?.validSkills) {
              setFormData((prev) => ({ ...prev, skillsWantToLearn: d.data.validSkills }));
            }
          })
          .catch(() => {});
      }
    }
  }, [isOpen, user, availability, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const currentTeachCategoryObj =
    categoriesList.find((c) => c.name === selectedTeachCategory) || categoriesList[0];
  const currentLearnCategoryObj =
    categoriesList.find((c) => c.name === selectedLearnCategory) ||
    categoriesList[1] ||
    categoriesList[0];

  // Filter live dropdown results for Teach
  const filteredTeachDropdown = useMemo(() => {
    const q = customTeachSkill.trim().toLowerCase();
    if (!q) {
      const catSkills = (currentTeachCategoryObj?.skills || []).map((name) => ({
        name,
        category: currentTeachCategoryObj?.name || 'General',
        icon: currentTeachCategoryObj?.icon || '⚡',
        aliases: []
      }));
      return catSkills.length > 0 ? catSkills.slice(0, 10) : allDatabaseSkills.slice(0, 10);
    }

    const localMatches = allDatabaseSkills.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.aliases && item.aliases.some((al) => al.includes(q)))
    );

    const combinedMap = new Map();
    if (Array.isArray(liveTeachBackend)) {
      liveTeachBackend.forEach((item) => combinedMap.set(item.name.toLowerCase(), item));
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
      const aExact = aName === q || (a.aliases || []).includes(q);
      const bExact = bName === q || (b.aliases || []).includes(q);
      if (aExact !== bExact) return aExact ? -1 : 1;
      const aStarts = aName.startsWith(q);
      const bStarts = bName.startsWith(q);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return aName.localeCompare(bName);
    });

    return combined.slice(0, 12);
  }, [customTeachSkill, liveTeachBackend, allDatabaseSkills, currentTeachCategoryObj]);

  // Filter live dropdown results for Learn
  const filteredLearnDropdown = useMemo(() => {
    const q = customLearnSkill.trim().toLowerCase();
    if (!q) {
      const catSkills = (currentLearnCategoryObj?.skills || []).map((name) => ({
        name,
        category: currentLearnCategoryObj?.name || 'General',
        icon: currentLearnCategoryObj?.icon || '⚡',
        aliases: []
      }));
      return catSkills.length > 0 ? catSkills.slice(0, 10) : allDatabaseSkills.slice(0, 10);
    }

    const localMatches = allDatabaseSkills.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.aliases && item.aliases.some((al) => al.includes(q)))
    );

    const combinedMap = new Map();
    if (Array.isArray(liveLearnBackend)) {
      liveLearnBackend.forEach((item) => combinedMap.set(item.name.toLowerCase(), item));
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
      const aExact = aName === q || (a.aliases || []).includes(q);
      const bExact = bName === q || (b.aliases || []).includes(q);
      if (aExact !== bExact) return aExact ? -1 : 1;
      const aStarts = aName.startsWith(q);
      const bStarts = bName.startsWith(q);
      if (aStarts !== bStarts) return aStarts ? -1 : 1;
      return aName.localeCompare(bName);
    });

    return combined.slice(0, 12);
  }, [customLearnSkill, liveLearnBackend, allDatabaseSkills, currentLearnCategoryObj]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Resolve typed text to a canonical database skill (returns null if not in DB)
  const resolveValidDbSkill = (rawText, dropdownMatches = []) => {
    const clean = (rawText || '').trim().toLowerCase();
    if (!clean) return null;

    const exact = allDatabaseSkills.find(
      (sk) =>
        sk.name.toLowerCase() === clean ||
        (sk.aliases && sk.aliases.includes(clean))
    );
    if (exact) return exact.name;

    if (dropdownMatches.length === 1) {
      return dropdownMatches[0].name;
    }

    return null;
  };

  const handleAddTeachSkill = (skillToAdd) => {
    setTeachSkillError('');
    if (skillToAdd) {
      // Clicked directly from live suggestions or category pills
      if (
        !formData.skillsCanTeach.some(
          (s) => s.toLowerCase() === skillToAdd.toLowerCase()
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          skillsCanTeach: [...prev.skillsCanTeach, skillToAdd]
        }));
      }
      setCustomTeachSkill('');
      setFocusedTeachIdx(-1);
      setIsTeachDropdownOpen(false);
      return;
    }

    const raw = customTeachSkill.trim();
    if (!raw) return;

    if (focusedTeachIdx >= 0 && focusedTeachIdx < filteredTeachDropdown.length) {
      const chosen = filteredTeachDropdown[focusedTeachIdx].name;
      if (
        !formData.skillsCanTeach.some(
          (s) => s.toLowerCase() === chosen.toLowerCase()
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          skillsCanTeach: [...prev.skillsCanTeach, chosen]
        }));
      }
      setCustomTeachSkill('');
      setFocusedTeachIdx(-1);
      setIsTeachDropdownOpen(false);
      return;
    }

    const canonical = resolveValidDbSkill(raw, filteredTeachDropdown);
    if (canonical) {
      if (
        !formData.skillsCanTeach.some(
          (s) => s.toLowerCase() === canonical.toLowerCase()
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          skillsCanTeach: [...prev.skillsCanTeach, canonical]
        }));
      }
      setCustomTeachSkill('');
      setFocusedTeachIdx(-1);
      setIsTeachDropdownOpen(false);
    } else {
      setTeachSkillError(
        filteredTeachDropdown.length > 0
          ? `Please select one of the matching skills from the live suggestions for "${raw}".`
          : `"${raw}" is not in the skills database. Only verified database skills can be added.`
      );
      setIsTeachDropdownOpen(true);
    }
  };

  const handleRemoveTeachSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skillsCanTeach: prev.skillsCanTeach.filter((s) => s !== skillToRemove)
    }));
  };

  const handleAddLearnSkill = (skillToAdd) => {
    setLearnSkillError('');
    if (skillToAdd) {
      if (
        !formData.skillsWantToLearn.some(
          (s) => s.toLowerCase() === skillToAdd.toLowerCase()
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          skillsWantToLearn: [...prev.skillsWantToLearn, skillToAdd]
        }));
      }
      setCustomLearnSkill('');
      setFocusedLearnIdx(-1);
      setIsLearnDropdownOpen(false);
      return;
    }

    const raw = customLearnSkill.trim();
    if (!raw) return;

    if (focusedLearnIdx >= 0 && focusedLearnIdx < filteredLearnDropdown.length) {
      const chosen = filteredLearnDropdown[focusedLearnIdx].name;
      if (
        !formData.skillsWantToLearn.some(
          (s) => s.toLowerCase() === chosen.toLowerCase()
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          skillsWantToLearn: [...prev.skillsWantToLearn, chosen]
        }));
      }
      setCustomLearnSkill('');
      setFocusedLearnIdx(-1);
      setIsLearnDropdownOpen(false);
      return;
    }

    const canonical = resolveValidDbSkill(raw, filteredLearnDropdown);
    if (canonical) {
      if (
        !formData.skillsWantToLearn.some(
          (s) => s.toLowerCase() === canonical.toLowerCase()
        )
      ) {
        setFormData((prev) => ({
          ...prev,
          skillsWantToLearn: [...prev.skillsWantToLearn, canonical]
        }));
      }
      setCustomLearnSkill('');
      setFocusedLearnIdx(-1);
      setIsLearnDropdownOpen(false);
    } else {
      setLearnSkillError(
        filteredLearnDropdown.length > 0
          ? `Please select one of the matching skills from the live suggestions for "${raw}".`
          : `"${raw}" is not in the skills database. Only verified database skills can be added.`
      );
      setIsLearnDropdownOpen(true);
    }
  };

  const handleRemoveLearnSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skillsWantToLearn: prev.skillsWantToLearn.filter((s) => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Prevent saving if user left unadded invalid text in the input boxes
    if (customTeachSkill.trim()) {
      const canonicalTeach = resolveValidDbSkill(customTeachSkill, filteredTeachDropdown);
      if (!canonicalTeach) {
        setActiveTab('skills');
        setTeachSkillError(
          `"${customTeachSkill.trim()}" is not in the skills database. Please clear it or pick a valid skill from live suggestions.`
        );
        return;
      }
    }

    if (customLearnSkill.trim()) {
      const canonicalLearn = resolveValidDbSkill(customLearnSkill, filteredLearnDropdown);
      if (!canonicalLearn) {
        setActiveTab('skills');
        setLearnSkillError(
          `"${customLearnSkill.trim()}" is not in the skills database. Please clear it or pick a valid skill from live suggestions.`
        );
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave({
        name: formData.name.trim(),
        username: formData.username.trim().replace(/^@/, ''),
        headline: formData.headline.trim(),
        bio: formData.bio.trim(),
        skillsCanTeach: formData.skillsCanTeach,
        skillsWantToLearn: formData.skillsWantToLearn,
        skillLevel: formData.skillLevel,
        availability: {
          weekdayEvenings: formData.weekdayEvenings,
          weekendMornings: formData.weekendMornings,
          mode: formData.sessionMode
        }
      });
    } catch (err) {
      setSubmitError(err.message || 'Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const teachSuggestions = useMemo(() => {
    const catSkills = currentTeachCategoryObj?.skills || [];
    const q = customTeachSkill.trim().toLowerCase();
    if (!q) return catSkills;
    return filteredTeachDropdown.map((item) => item.name);
  }, [currentTeachCategoryObj, customTeachSkill, filteredTeachDropdown]);

  const learnSuggestions = useMemo(() => {
    const catSkills = currentLearnCategoryObj?.skills || [];
    const q = customLearnSkill.trim().toLowerCase();
    if (!q) return catSkills;
    return filteredLearnDropdown.map((item) => item.name);
  }, [currentLearnCategoryObj, customLearnSkill, filteredLearnDropdown]);

  const modalJSX = (
    <div className="modal-overlay modal-overlay-portal" onClick={onClose}>
      <div
        className="glass-panel clay-card-3d user-modal-lg user-modal-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="user-modal-header">
          <h3 className="user-modal-title">✏️ Edit Profile &amp; Skills</h3>
          <button
            type="button"
            className="close-modal-btn user-modal-close-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tab-bar">
          <button
            type="button"
            className={`action-btn modal-tab-btn ${activeTab === 'basic' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            👤 Basic Details
          </button>
          <button
            type="button"
            className={`action-btn modal-tab-btn ${activeTab === 'skills' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            🎓 Skills &amp; Categories (
            {formData.skillsCanTeach.length + formData.skillsWantToLearn.length})
          </button>
          <button
            type="button"
            className={`action-btn modal-tab-btn ${
              activeTab === 'availability' ? 'btn-primary' : ''
            }`}
            onClick={() => setActiveTab('availability')}
          >
            📅 Availability
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form modal-body-padded">
          {submitError && (
            <div className="oss-validation-error" style={{ marginBottom: '0.85rem' }}>
              <span>⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="tab-pane-content">
              <div className="form-group user-modal-form-group">
                <label className="form-label user-modal-label">Display Name *</label>
                <input
                  className="form-input user-modal-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Harsh Vishwakarma"
                  required
                />
              </div>

              <div className="form-group user-modal-form-group">
                <label className="form-label user-modal-label">Username / Handle *</label>
                <input
                  className="form-input user-modal-input"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. Harsh_developer"
                  required
                />
              </div>

              <div className="form-group user-modal-form-group">
                <label className="form-label user-modal-label">Short Headline</label>
                <input
                  className="form-input user-modal-input"
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack React Developer & UI Enthusiast"
                />
              </div>

              <div className="form-group user-modal-form-group">
                <label className="form-label user-modal-label">About Bio</label>
                <textarea
                  className="form-textarea-styled user-modal-textarea"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell the community about yourself, your projects, and what you love learning..."
                />
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS & CATEGORIES (FETCHED LIVE & VALIDATED WITH MONGODB) */}
          {activeTab === 'skills' && (
            <div className="tab-pane-content">
              {/* SECTION: SKILLS I CAN TEACH */}
              <div className="skill-editor-box">
                <div className="skill-editor-box-header">
                  <label className="skill-editor-label-teach">
                    🎓 Skills I Can Teach ({formData.skillsCanTeach.length})
                  </label>

                  {/* Skill Level Selection */}
                  <select
                    name="skillLevel"
                    value={formData.skillLevel}
                    onChange={handleChange}
                    className="skill-cat-select"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Active Teach Skills Chips */}
                <div className="skill-chips-wrap">
                  {formData.skillsCanTeach.map((skill) => (
                    <span key={skill} className="skill-chip-teach">
                      ⚡ {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveTeachSkill(skill)}
                        className="skill-chip-del-btn teach"
                        title={`Remove ${skill}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {formData.skillsCanTeach.length === 0 && (
                    <span className="user-modal-subtitle">No teach skills added yet.</span>
                  )}
                </div>

                {/* Live Category Picker & Live Database Search Input */}
                <div
                  className="oss-search-wrapper"
                  ref={teachDropdownRef}
                  style={{ marginBottom: '0.65rem' }}
                >
                  <div className="skill-add-input-row" style={{ marginBottom: 0 }}>
                    <select
                      value={selectedTeachCategory}
                      onChange={(e) => {
                        setSelectedTeachCategory(e.target.value);
                        setTeachSkillError('');
                      }}
                      className="skill-cat-select"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.id || cat.name} value={cat.name}>
                          {cat.icon ? `${cat.icon} ` : ''}
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <div style={{ position: 'relative', flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={customTeachSkill}
                        onChange={(e) => {
                          setCustomTeachSkill(e.target.value);
                          setTeachSkillError('');
                          setFocusedTeachIdx(-1);
                          setIsTeachDropdownOpen(true);
                        }}
                        onFocus={() => setIsTeachDropdownOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setIsTeachDropdownOpen(true);
                            setFocusedTeachIdx((prev) =>
                              prev < filteredTeachDropdown.length - 1 ? prev + 1 : 0
                            );
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setFocusedTeachIdx((prev) =>
                              prev > 0 ? prev - 1 : filteredTeachDropdown.length - 1
                            );
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddTeachSkill();
                          } else if (e.key === 'Escape') {
                            setIsTeachDropdownOpen(false);
                          }
                        }}
                        placeholder="Search skill in database (e.g. React JS, Python)..."
                        className="skill-add-input"
                        style={{ width: '100%', paddingRight: customTeachSkill ? '2rem' : '0.75rem' }}
                      />
                      {customTeachSkill && (
                        <button
                          type="button"
                          className="oss-clear-btn"
                          onClick={() => {
                            setCustomTeachSkill('');
                            setTeachSkillError('');
                            setFocusedTeachIdx(-1);
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="action-btn btn-primary skill-add-btn"
                      onClick={() => handleAddTeachSkill()}
                    >
                      + Add Skill
                    </button>
                  </div>

                  {teachSkillError && (
                    <div className="oss-validation-error" role="alert">
                      <span>⚠️</span>
                      <span>{teachSkillError}</span>
                    </div>
                  )}

                  {/* Live Autocomplete Dropdown from MongoDB */}
                  {isTeachDropdownOpen && (
                    <div className="oss-dropdown-menu">
                      <div className="oss-dropdown-header">
                        {customTeachSkill.trim()
                          ? `Live Database Matches (${filteredTeachDropdown.length})`
                          : `Suggested in ${selectedTeachCategory}`}
                      </div>
                      {filteredTeachDropdown.length > 0 ? (
                        filteredTeachDropdown.map((item, idx) => {
                          const isAlreadyAdded = formData.skillsCanTeach.some(
                            (s) => s.toLowerCase() === item.name.toLowerCase()
                          );
                          const isFocused = idx === focusedTeachIdx;
                          return (
                            <div
                              key={item.name}
                              className={`oss-dropdown-item ${
                                isAlreadyAdded ? 'selected' : ''
                              } ${isFocused ? 'focused' : ''}`}
                              onMouseEnter={() => setFocusedTeachIdx(idx)}
                              onClick={() => handleAddTeachSkill(item.name)}
                            >
                              <div className="oss-item-lead">
                                <span>{item.icon}</span>
                                <span className="oss-item-name">{item.name}</span>
                                <span className="oss-item-cat">{item.category}</span>
                              </div>
                              <span
                                className={`oss-item-action ${
                                  isAlreadyAdded ? 'selected' : 'add-teach'
                                }`}
                              >
                                {isAlreadyAdded ? '✓ Added' : '+ Add'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="oss-no-match-box">
                          <span className="oss-no-match-icon">🚫</span>
                          <div>
                            <div className="oss-no-match-title">
                              No skill matching &ldquo;{customTeachSkill.trim()}&rdquo; in database
                            </div>
                            <div className="oss-no-match-sub">
                              Only verified database skills can be added. Please choose from the live suggestions.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Live Category Suggestions from MongoDB */}
                <div className="skill-suggestions-row">
                  <span className="skill-suggestions-label">Live suggestions:</span>
                  {teachSuggestions.map((item) => {
                    const isAlreadyAdded = formData.skillsCanTeach.some(
                      (s) => s.toLowerCase() === item.toLowerCase()
                    );
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleAddTeachSkill(item)}
                        className={`suggestion-pill-btn teach ${
                          isAlreadyAdded ? 'active' : ''
                        }`}
                      >
                        {isAlreadyAdded ? `✓ ${item}` : `+ ${item}`}
                      </button>
                    );
                  })}
                  {teachSuggestions.length === 0 && (
                    <span className="user-modal-hint">
                      No matching database skills for &ldquo;{customTeachSkill.trim()}&rdquo;.
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION: SKILLS I WANT TO LEARN */}
              <div className="skill-editor-box">
                <label className="skill-editor-label-learn">
                  🎯 Skills I Want to Learn ({formData.skillsWantToLearn.length})
                </label>

                {/* Active Learn Skills Chips */}
                <div className="skill-chips-wrap">
                  {formData.skillsWantToLearn.map((skill) => (
                    <span key={skill} className="skill-chip-learn">
                      🎯 {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveLearnSkill(skill)}
                        className="skill-chip-del-btn learn"
                        title={`Remove ${skill}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {formData.skillsWantToLearn.length === 0 && (
                    <span className="user-modal-subtitle">No learning goals added yet.</span>
                  )}
                </div>

                {/* Live Category Picker & Live Database Search Input */}
                <div
                  className="oss-search-wrapper"
                  ref={learnDropdownRef}
                  style={{ marginBottom: '0.65rem' }}
                >
                  <div className="skill-add-input-row" style={{ marginBottom: 0 }}>
                    <select
                      value={selectedLearnCategory}
                      onChange={(e) => {
                        setSelectedLearnCategory(e.target.value);
                        setLearnSkillError('');
                      }}
                      className="skill-cat-select"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat.id || cat.name} value={cat.name}>
                          {cat.icon ? `${cat.icon} ` : ''}
                          {cat.name}
                        </option>
                      ))}
                    </select>

                    <div style={{ position: 'relative', flex: 1, minWidth: '180px', display: 'flex', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={customLearnSkill}
                        onChange={(e) => {
                          setCustomLearnSkill(e.target.value);
                          setLearnSkillError('');
                          setFocusedLearnIdx(-1);
                          setIsLearnDropdownOpen(true);
                        }}
                        onFocus={() => setIsLearnDropdownOpen(true)}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setIsLearnDropdownOpen(true);
                            setFocusedLearnIdx((prev) =>
                              prev < filteredLearnDropdown.length - 1 ? prev + 1 : 0
                            );
                          } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setFocusedLearnIdx((prev) =>
                              prev > 0 ? prev - 1 : filteredLearnDropdown.length - 1
                            );
                          } else if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddLearnSkill();
                          } else if (e.key === 'Escape') {
                            setIsLearnDropdownOpen(false);
                          }
                        }}
                        placeholder="Search skill to learn (e.g. Figma, Machine Learning)..."
                        className="skill-add-input"
                        style={{ width: '100%', paddingRight: customLearnSkill ? '2rem' : '0.75rem' }}
                      />
                      {customLearnSkill && (
                        <button
                          type="button"
                          className="oss-clear-btn"
                          onClick={() => {
                            setCustomLearnSkill('');
                            setLearnSkillError('');
                            setFocusedLearnIdx(-1);
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="action-btn btn-primary skill-add-btn"
                      onClick={() => handleAddLearnSkill()}
                    >
                      + Add Goal
                    </button>
                  </div>

                  {learnSkillError && (
                    <div className="oss-validation-error" role="alert">
                      <span>⚠️</span>
                      <span>{learnSkillError}</span>
                    </div>
                  )}

                  {/* Live Autocomplete Dropdown from MongoDB */}
                  {isLearnDropdownOpen && (
                    <div className="oss-dropdown-menu">
                      <div className="oss-dropdown-header">
                        {customLearnSkill.trim()
                          ? `Live Database Matches (${filteredLearnDropdown.length})`
                          : `Suggested in ${selectedLearnCategory}`}
                      </div>
                      {filteredLearnDropdown.length > 0 ? (
                        filteredLearnDropdown.map((item, idx) => {
                          const isAlreadyAdded = formData.skillsWantToLearn.some(
                            (s) => s.toLowerCase() === item.name.toLowerCase()
                          );
                          const isFocused = idx === focusedLearnIdx;
                          return (
                            <div
                              key={item.name}
                              className={`oss-dropdown-item ${
                                isAlreadyAdded ? 'selected' : ''
                              } ${isFocused ? 'focused' : ''}`}
                              onMouseEnter={() => setFocusedLearnIdx(idx)}
                              onClick={() => handleAddLearnSkill(item.name)}
                            >
                              <div className="oss-item-lead">
                                <span>{item.icon}</span>
                                <span className="oss-item-name">{item.name}</span>
                                <span className="oss-item-cat">{item.category}</span>
                              </div>
                              <span
                                className={`oss-item-action ${
                                  isAlreadyAdded ? 'selected' : 'add-learn'
                                }`}
                              >
                                {isAlreadyAdded ? '✓ Added' : '+ Add'}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <div className="oss-no-match-box">
                          <span className="oss-no-match-icon">🚫</span>
                          <div>
                            <div className="oss-no-match-title">
                              No skill matching &ldquo;{customLearnSkill.trim()}&rdquo; in database
                            </div>
                            <div className="oss-no-match-sub">
                              Only verified database skills can be added. Please choose from the live suggestions.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Live Category Suggestions from MongoDB */}
                <div className="skill-suggestions-row">
                  <span className="skill-suggestions-label">Live suggestions:</span>
                  {learnSuggestions.map((item) => {
                    const isAlreadyAdded = formData.skillsWantToLearn.some(
                      (s) => s.toLowerCase() === item.toLowerCase()
                    );
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleAddLearnSkill(item)}
                        className={`suggestion-pill-btn learn ${
                          isAlreadyAdded ? 'active' : ''
                        }`}
                      >
                        {isAlreadyAdded ? `✓ ${item}` : `+ ${item}`}
                      </button>
                    );
                  })}
                  {learnSuggestions.length === 0 && (
                    <span className="user-modal-hint">
                      No matching database skills for &ldquo;{customLearnSkill.trim()}&rdquo;.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AVAILABILITY & SESSION MODE */}
          {activeTab === 'availability' && (
            <div className="tab-pane-content">
              <div className="form-group user-modal-form-group spacing-lg">
                <label className="form-label user-modal-label">Preferred Meeting Days</label>

                <div className="checkbox-vertical-group">
                  <label className="user-modal-checkbox-row cursor-pointer">
                    <input
                      type="checkbox"
                      name="weekdayEvenings"
                      checked={formData.weekdayEvenings}
                      onChange={handleChange}
                      className="user-modal-checkbox"
                    />
                    🌙 Available on Weekday Evenings (after 6 PM)
                  </label>

                  <label className="user-modal-checkbox-row cursor-pointer">
                    <input
                      type="checkbox"
                      name="weekendMornings"
                      checked={formData.weekendMornings}
                      onChange={handleChange}
                      className="user-modal-checkbox"
                    />
                    ☀️ Available on Weekend Mornings (10 AM - 2 PM)
                  </label>
                </div>
              </div>

              <div className="form-group user-modal-form-group">
                <label className="form-label user-modal-label">Session Mode</label>
                <select
                  name="sessionMode"
                  value={formData.sessionMode}
                  onChange={handleChange}
                  className="form-select-styled user-modal-input"
                >
                  <option value="Online Video Only">🎥 Online Video Call Only</option>
                  <option value="In Person & Online">🤝 In Person &amp; Online</option>
                  <option value="In Person Only">📍 In Person Only</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="user-modal-actions user-modal-actions-border">
            <button
              type="button"
              className="action-btn user-modal-btn-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary user-modal-btn-submit"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes 💾'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : null;
}
