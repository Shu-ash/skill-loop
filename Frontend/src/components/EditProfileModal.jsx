// src/components/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MASTER_CATEGORIES } from '../data/categoriesData';

const API_BASE_URL = 'http://localhost:5000/api';

export default function EditProfileModal({ isOpen, user, availability = {}, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'skills' | 'availability'

  const [categoriesList, setCategoriesList] = useState(MASTER_CATEGORIES);

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

  const [selectedTeachCategory, setSelectedTeachCategory] = useState(MASTER_CATEGORIES[0]?.name || '');
  const [customTeachSkill, setCustomTeachSkill] = useState('');

  const [selectedLearnCategory, setSelectedLearnCategory] = useState(MASTER_CATEGORIES[1]?.name || MASTER_CATEGORIES[0]?.name || '');
  const [customLearnSkill, setCustomLearnSkill] = useState('');

  // Fetch live categories and nested skills from MongoDB database
  useEffect(() => {
    const fetchLiveCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.categories) && data.data.categories.length > 0) {
          setCategoriesList(data.data.categories);
          setSelectedTeachCategory(data.data.categories[0].name);
          setSelectedLearnCategory(data.data.categories[1]?.name || data.data.categories[0].name);
        }
      } catch (err) {
        console.error('Failed to load categories in EditProfileModal:', err);
      }
    };
    fetchLiveCategories();
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        username: (user.username || '').replace(/^@/, ''),
        headline: user.headline || '',
        bio: user.bio || '',
        skillsCanTeach: Array.isArray(user.teachSkills) && user.teachSkills.length ? [...user.teachSkills] : (Array.isArray(user.skillsCanTeach) ? [...user.skillsCanTeach] : []),
        skillsWantToLearn: Array.isArray(user.learnSkills) && user.learnSkills.length ? [...user.learnSkills] : (Array.isArray(user.skillsWantToLearn) ? [...user.skillsWantToLearn] : []),
        skillLevel: user.skillLevel || 'intermediate',
        weekdayEvenings: availability.weekdayEvenings ?? true,
        weekendMornings: availability.weekendMornings ?? false,
        sessionMode: availability.mode || 'Online Only'
      });
      setActiveTab('basic');
    }
  }, [isOpen, user, availability]);

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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTeachSkill = (skillToAdd) => {
    const target = (skillToAdd || customTeachSkill).trim();
    if (!target) return;
    if (!formData.skillsCanTeach.some(s => s.toLowerCase() === target.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        skillsCanTeach: [...prev.skillsCanTeach, target]
      }));
    }
    if (!skillToAdd) setCustomTeachSkill('');
  };

  const handleRemoveTeachSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsCanTeach: prev.skillsCanTeach.filter(s => s !== skillToRemove)
    }));
  };

  const handleAddLearnSkill = (skillToAdd) => {
    const target = (skillToAdd || customLearnSkill).trim();
    if (!target) return;
    if (!formData.skillsWantToLearn.some(s => s.toLowerCase() === target.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        skillsWantToLearn: [...prev.skillsWantToLearn, target]
      }));
    }
    if (!skillToAdd) setCustomLearnSkill('');
  };

  const handleRemoveLearnSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsWantToLearn: prev.skillsWantToLearn.filter(s => s !== skillToRemove)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
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
  };

  const currentTeachCategoryObj = categoriesList.find(c => c.name === selectedTeachCategory) || categoriesList[0];
  const currentLearnCategoryObj = categoriesList.find(c => c.name === selectedLearnCategory) || categoriesList[1] || categoriesList[0];

  const teachSuggestions = currentTeachCategoryObj?.skills || [];
  const learnSuggestions = currentLearnCategoryObj?.skills || [];

  const modalJSX = (
    <div
      className="modal-overlay modal-overlay-portal"
      onClick={onClose}
    >
      <div
        className="glass-panel clay-card-3d user-modal-lg user-modal-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="user-modal-header">
          <h3 className="user-modal-title">
            ✏️ Edit Profile &amp; Skills
          </h3>
          <button type="button" className="close-modal-btn user-modal-close-btn" onClick={onClose} title="Close">✕</button>
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
            🎓 Skills &amp; Categories ({formData.skillsCanTeach.length + formData.skillsWantToLearn.length})
          </button>
          <button
            type="button"
            className={`action-btn modal-tab-btn ${activeTab === 'availability' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            📅 Availability
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form modal-body-padded">
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="tab-pane-content">
              <div className="form-group user-modal-form-group">
                <label className="form-label user-modal-label">
                  Display Name *
                </label>
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
                <label className="form-label user-modal-label">
                  Username / Handle *
                </label>
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
                <label className="form-label user-modal-label">
                  Short Headline
                </label>
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
                <label className="form-label user-modal-label">
                  About Bio
                </label>
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

          {/* TAB 2: SKILLS & CATEGORIES (FETCHED LIVE FROM MONGODB) */}
          {activeTab === 'skills' && (
            <div className="tab-pane-content">
              {/* SECTION: SKILLS I CAN TEACH */}
              <div className="skill-editor-box">
                <div className="skill-editor-box-header">
                  <label className="skill-editor-label-teach">
                    🎓 Skills I Can Teach
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
                  {formData.skillsCanTeach.map(skill => (
                    <span 
                      key={skill}
                      className="skill-chip-teach"
                    >
                      ⚡ {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTeachSkill(skill)}
                        className="skill-chip-del-btn teach"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {formData.skillsCanTeach.length === 0 && (
                    <span className="user-modal-subtitle">No teach skills added yet.</span>
                  )}
                </div>

                {/* Live Category Picker & Custom Input */}
                <div className="skill-add-input-row">
                  <select 
                    value={selectedTeachCategory}
                    onChange={(e) => setSelectedTeachCategory(e.target.value)}
                    className="skill-cat-select"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                      </option>
                    ))}
                  </select>

                  <input 
                    type="text"
                    value={customTeachSkill}
                    onChange={(e) => setCustomTeachSkill(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter') { 
                        e.preventDefault(); 
                        e.stopPropagation();
                        handleAddTeachSkill(); 
                      } 
                    }}
                    placeholder="Type custom skill..."
                    className="skill-add-input"
                  />

                  <button 
                    type="button" 
                    className="action-btn btn-primary skill-add-btn"
                    onClick={() => handleAddTeachSkill()}
                  >
                    + Add Skill
                  </button>
                </div>

                {/* Live Category Suggestions from MongoDB */}
                <div className="skill-suggestions-row">
                  <span className="skill-suggestions-label">Live suggestions:</span>
                  {teachSuggestions.map(item => {
                    const isAlreadyAdded = formData.skillsCanTeach.some(s => s.toLowerCase() === item.toLowerCase());
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleAddTeachSkill(item)}
                        className={`suggestion-pill-btn teach ${isAlreadyAdded ? 'active' : ''}`}
                      >
                        {isAlreadyAdded ? `✓ ${item}` : `+ ${item}`}
                      </button>
                    );
                  })}
                  {teachSuggestions.length === 0 && (
                    <span className="user-modal-hint">
                      Type a custom skill above.
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION: SKILLS I WANT TO LEARN */}
              <div className="skill-editor-box">
                <label className="skill-editor-label-learn">
                  🎯 Skills I Want to Learn
                </label>

                {/* Active Learn Skills Chips */}
                <div className="skill-chips-wrap">
                  {formData.skillsWantToLearn.map(skill => (
                    <span 
                      key={skill}
                      className="skill-chip-learn"
                    >
                      🎯 {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveLearnSkill(skill)}
                        className="skill-chip-del-btn learn"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {formData.skillsWantToLearn.length === 0 && (
                    <span className="user-modal-subtitle">No learning goals added yet.</span>
                  )}
                </div>

                {/* Live Category Picker & Custom Input */}
                <div className="skill-add-input-row">
                  <select 
                    value={selectedLearnCategory}
                    onChange={(e) => setSelectedLearnCategory(e.target.value)}
                    className="skill-cat-select"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id || cat.name} value={cat.name}>
                        {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                      </option>
                    ))}
                  </select>

                  <input 
                    type="text"
                    value={customLearnSkill}
                    onChange={(e) => setCustomLearnSkill(e.target.value)}
                    onKeyDown={(e) => { 
                      if (e.key === 'Enter') { 
                        e.preventDefault(); 
                        e.stopPropagation();
                        handleAddLearnSkill(); 
                      } 
                    }}
                    placeholder="Type skill you want to learn..."
                    className="skill-add-input"
                  />

                  <button 
                    type="button" 
                    className="action-btn btn-primary skill-add-btn"
                    onClick={() => handleAddLearnSkill()}
                  >
                    + Add Goal
                  </button>
                </div>

                {/* Live Category Suggestions from MongoDB */}
                <div className="skill-suggestions-row">
                  <span className="skill-suggestions-label">Live suggestions:</span>
                  {learnSuggestions.map(item => {
                    const isAlreadyAdded = formData.skillsWantToLearn.some(s => s.toLowerCase() === item.toLowerCase());
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleAddLearnSkill(item)}
                        className={`suggestion-pill-btn learn ${isAlreadyAdded ? 'active' : ''}`}
                      >
                        {isAlreadyAdded ? `✓ ${item}` : `+ ${item}`}
                      </button>
                    );
                  })}
                  {learnSuggestions.length === 0 && (
                    <span className="user-modal-hint">
                      Type a custom skill above.
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
                <label className="form-label user-modal-label">
                  Preferred Meeting Days
                </label>
                
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
                <label className="form-label user-modal-label">
                  Session Mode
                </label>
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
            <button type="button" className="action-btn user-modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary user-modal-btn-submit">
              Save Changes 💾
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : null;
}
