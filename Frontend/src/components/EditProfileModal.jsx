// src/components/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const API_BASE_URL = 'http://localhost:5000/api';

export default function EditProfileModal({ isOpen, user, availability = {}, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'skills' | 'availability'

  const [categoriesList, setCategoriesList] = useState([]);

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

  const [selectedTeachCategory, setSelectedTeachCategory] = useState('');
  const [customTeachSkill, setCustomTeachSkill] = useState('');

  const [selectedLearnCategory, setSelectedLearnCategory] = useState('');
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
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <div
        className="glass-panel edit-profile-modal-box clay-card-3d"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px',
          padding: '2rem 2.2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.35rem', fontFamily: 'var(--font-display)' }}>
            ✏️ Edit Profile &amp; Skills
          </h3>
          <button type="button" className="close-modal-btn" onClick={onClose} title="Close">✕</button>
        </div>

        {/* Modal Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', paddingBottom: '0.75rem', marginTop: '0.75rem' }}>
          <button
            type="button"
            className={`action-btn ${activeTab === 'basic' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('basic')}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
          >
            👤 Basic Details
          </button>
          <button
            type="button"
            className={`action-btn ${activeTab === 'skills' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('skills')}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
          >
            🎓 Skills &amp; Categories ({formData.skillsCanTeach.length + formData.skillsWantToLearn.length})
          </button>
          <button
            type="button"
            className={`action-btn ${activeTab === 'availability' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('availability')}
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
          >
            📅 Availability
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-profile-form modal-body-padded">
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div style={{ paddingTop: '1rem' }}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700, #334155)', marginBottom: '0.35rem' }}>
                  Display Name *
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Harsh Vishwakarma"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700, #334155)', marginBottom: '0.35rem' }}>
                  Username / Handle *
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. Harsh_developer"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700, #334155)', marginBottom: '0.35rem' }}>
                  Short Headline
                </label>
                <input
                  className="form-input"
                  type="text"
                  name="headline"
                  value={formData.headline}
                  onChange={handleChange}
                  placeholder="e.g. Full Stack React Developer & UI Enthusiast"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700, #334155)', marginBottom: '0.35rem' }}>
                  About Bio
                </label>
                <textarea
                  className="form-textarea-styled"
                  name="bio"
                  rows="3"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell the community about yourself, your projects, and what you love learning..."
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: SKILLS & CATEGORIES (FETCHED LIVE FROM MONGODB) */}
          {activeTab === 'skills' && (
            <div style={{ paddingTop: '1rem' }}>
              {/* SECTION: SKILLS I CAN TEACH */}
              <div style={{ background: 'rgba(248, 250, 252, 0.75)', padding: '1rem 1.1rem', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--violet-primary, #6c5ce7)' }}>
                    🎓 Skills I Can Teach
                  </label>
                  
                  {/* Skill Level Selection */}
                  <select
                    name="skillLevel"
                    value={formData.skillLevel}
                    onChange={handleChange}
                    style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid var(--slate-300)' }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Active Teach Skills Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                  {formData.skillsCanTeach.map(skill => (
                    <span 
                      key={skill}
                      style={{
                        background: 'var(--violet-subtle, #f0edff)',
                        color: 'var(--violet-primary, #6c5ce7)',
                        border: '1px solid rgba(108, 92, 231, 0.3)',
                        borderRadius: '9999px',
                        padding: '0.28rem 0.75rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                      }}
                    >
                      ⚡ {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTeachSkill(skill)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--violet-primary)', fontWeight: 700, padding: '0 2px' }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {formData.skillsCanTeach.length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>No teach skills added yet.</span>
                  )}
                </div>

                {/* Live Category Picker & Custom Input */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                  <select 
                    value={selectedTeachCategory}
                    onChange={(e) => setSelectedTeachCategory(e.target.value)}
                    style={{ padding: '0.45rem 0.65rem', borderRadius: '10px', border: '1px solid var(--slate-300)', fontSize: '0.82rem', fontWeight: 600 }}
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
                    style={{ flex: 1, minWidth: '130px', padding: '0.45rem 0.75rem', borderRadius: '10px', border: '1px solid var(--slate-300)', fontSize: '0.82rem' }}
                  />

                  <button 
                    type="button" 
                    className="action-btn btn-primary"
                    onClick={() => handleAddTeachSkill()}
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
                  >
                    + Add Skill
                  </button>
                </div>

                {/* Live Category Suggestions from MongoDB */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', fontWeight: 600 }}>Live suggestions:</span>
                  {teachSuggestions.map(item => {
                    const isAlreadyAdded = formData.skillsCanTeach.some(s => s.toLowerCase() === item.toLowerCase());
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleAddTeachSkill(item)}
                        style={{
                          background: isAlreadyAdded ? 'var(--violet-subtle, #f0edff)' : 'white',
                          border: `1px ${isAlreadyAdded ? 'solid var(--violet-primary)' : 'dashed var(--slate-300)'}`,
                          borderRadius: '12px',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.74rem',
                          fontWeight: isAlreadyAdded ? 700 : 500,
                          color: isAlreadyAdded ? 'var(--violet-primary)' : 'var(--slate-600)',
                          cursor: 'pointer'
                        }}
                      >
                        {isAlreadyAdded ? `✓ ${item}` : `+ ${item}`}
                      </button>
                    );
                  })}
                  {teachSuggestions.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>
                      Type a custom skill above.
                    </span>
                  )}
                </div>
              </div>

              {/* SECTION: SKILLS I WANT TO LEARN */}
              <div style={{ background: 'rgba(248, 250, 252, 0.75)', padding: '1rem 1.1rem', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', color: 'var(--coral-primary, #ff7675)', marginBottom: '0.65rem' }}>
                  🎯 Skills I Want to Learn
                </label>

                {/* Active Learn Skills Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                  {formData.skillsWantToLearn.map(skill => (
                    <span 
                      key={skill}
                      style={{
                        background: 'rgba(255, 118, 117, 0.12)',
                        color: '#d63031',
                        border: '1px solid rgba(255, 118, 117, 0.3)',
                        borderRadius: '9999px',
                        padding: '0.28rem 0.75rem',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.45rem'
                      }}
                    >
                      🎯 {skill}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveLearnSkill(skill)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#d63031', fontWeight: 700, padding: '0 2px' }}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {formData.skillsWantToLearn.length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>No learning goals added yet.</span>
                  )}
                </div>

                {/* Live Category Picker & Custom Input */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                  <select 
                    value={selectedLearnCategory}
                    onChange={(e) => setSelectedLearnCategory(e.target.value)}
                    style={{ padding: '0.45rem 0.65rem', borderRadius: '10px', border: '1px solid var(--slate-300)', fontSize: '0.82rem', fontWeight: 600 }}
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
                    style={{ flex: 1, minWidth: '130px', padding: '0.45rem 0.75rem', borderRadius: '10px', border: '1px solid var(--slate-300)', fontSize: '0.82rem' }}
                  />

                  <button 
                    type="button" 
                    className="action-btn btn-primary"
                    onClick={() => handleAddLearnSkill()}
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.95rem' }}
                  >
                    + Add Goal
                  </button>
                </div>

                {/* Live Category Suggestions from MongoDB */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', fontWeight: 600 }}>Live suggestions:</span>
                  {learnSuggestions.map(item => {
                    const isAlreadyAdded = formData.skillsWantToLearn.some(s => s.toLowerCase() === item.toLowerCase());
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleAddLearnSkill(item)}
                        style={{
                          background: isAlreadyAdded ? 'rgba(255, 118, 117, 0.15)' : 'white',
                          border: `1px ${isAlreadyAdded ? 'solid #ff7675' : 'dashed var(--slate-300)'}`,
                          borderRadius: '12px',
                          padding: '0.2rem 0.55rem',
                          fontSize: '0.74rem',
                          fontWeight: isAlreadyAdded ? 700 : 500,
                          color: isAlreadyAdded ? '#d63031' : 'var(--slate-600)',
                          cursor: 'pointer'
                        }}
                      >
                        {isAlreadyAdded ? `✓ ${item}` : `+ ${item}`}
                      </button>
                    );
                  })}
                  {learnSuggestions.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>
                      Type a custom skill above.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AVAILABILITY & SESSION MODE */}
          {activeTab === 'availability' && (
            <div style={{ paddingTop: '1rem' }}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700, #334155)', marginBottom: '0.65rem' }}>
                  Preferred Meeting Days
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      name="weekdayEvenings"
                      checked={formData.weekdayEvenings}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--violet-primary)' }}
                    />
                    🌙 Available on Weekday Evenings (after 6 PM)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      name="weekendMornings"
                      checked={formData.weekendMornings}
                      onChange={handleChange}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--violet-primary)' }}
                    />
                    ☀️ Available on Weekend Mornings (10 AM - 2 PM)
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700, #334155)', marginBottom: '0.35rem' }}>
                  Session Mode
                </label>
                <select
                  name="sessionMode"
                  value={formData.sessionMode}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '10px', border: '1px solid var(--slate-300)', fontSize: '0.86rem' }}
                >
                  <option value="Online Video Only">🎥 Online Video Call Only</option>
                  <option value="In Person & Online">🤝 In Person &amp; Online</option>
                  <option value="In Person Only">📍 In Person Only</option>
                </select>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(226, 232, 240, 0.8)' }}>
            <button type="button" className="action-btn" onClick={onClose} style={{ padding: '0.65rem 1.2rem', borderRadius: '12px' }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem', borderRadius: '12px', fontWeight: 700 }}>
              Save Changes 💾
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : null;
}
