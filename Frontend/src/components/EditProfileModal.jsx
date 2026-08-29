// src/components/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const CATEGORY_SKILL_SUGGESTIONS = {
  'Code & Data': ['React JS', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB', 'SQL', 'Docker', 'Next.js'],
  'Design & UI': ['Figma', 'UI/UX Design', 'Logo Design', 'Design Systems', 'Adobe Illustrator', 'Photoshop', 'Canva'],
  'Languages': ['English Conversation', 'Spanish', 'French', 'German', 'Japanese', 'Hindi', 'Mandarin'],
  'AI & Data Science': ['Machine Learning', 'Prompt Engineering', 'ChatGPT & LLMs', 'Data Analysis', 'Deep Learning', 'PyTorch'],
  'Marketing & Growth': ['SEO Optimization', 'Content Strategy', 'Social Media Growth', 'Copywriting', 'Email Marketing'],
  'Music & Audio': ['Acoustic Guitar', 'Piano Basics', 'Vocal Training', 'Music Production', 'FL Studio', 'Ableton']
};

export default function EditProfileModal({ isOpen, user, availability = {}, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'skills' | 'availability'

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

  const [selectedTeachCategory, setSelectedTeachCategory] = useState('Code & Data');
  const [customTeachSkill, setCustomTeachSkill] = useState('');

  const [selectedLearnCategory, setSelectedLearnCategory] = useState('Design & UI');
  const [customLearnSkill, setCustomLearnSkill] = useState('');

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
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Teach Skills Handlers
  const handleAddTeachSkill = (skillToAdd) => {
    const raw = typeof skillToAdd === 'string' ? skillToAdd : customTeachSkill;
    const val = (raw || '').trim();
    if (!val) return;

    if (!formData.skillsCanTeach.some(s => s.toLowerCase() === val.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        skillsCanTeach: [...prev.skillsCanTeach, val]
      }));
    }
    setCustomTeachSkill('');
  };

  const handleRemoveTeachSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsCanTeach: prev.skillsCanTeach.filter(s => s.toLowerCase() !== skillToRemove.toLowerCase())
    }));
  };

  // Learn Skills Handlers
  const handleAddLearnSkill = (skillToAdd) => {
    const raw = typeof skillToAdd === 'string' ? skillToAdd : customLearnSkill;
    const val = (raw || '').trim();
    if (!val) return;

    if (!formData.skillsWantToLearn.some(s => s.toLowerCase() === val.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        skillsWantToLearn: [...prev.skillsWantToLearn, val]
      }));
    }
    setCustomLearnSkill('');
  };

  const handleRemoveLearnSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skillsWantToLearn: prev.skillsWantToLearn.filter(s => s.toLowerCase() !== skillToRemove.toLowerCase())
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedUsername = formData.username.startsWith('@') 
      ? formData.username 
      : `@${formData.username.trim()}`;

    onSave({
      ...formData,
      username: formattedUsername,
      teachSkills: formData.skillsCanTeach,
      learnSkills: formData.skillsWantToLearn,
      skillsCanTeach: formData.skillsCanTeach,
      skillsWantToLearn: formData.skillsWantToLearn,
      availability: {
        weekdayEvenings: formData.weekdayEvenings,
        weekendMornings: formData.weekendMornings,
        mode: formData.sessionMode
      }
    });
  };

  const modalContent = (
    <div className="full-viewport-blur-overlay modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel edit-profile-modal-box clay-card-3d admin-action-center-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '94%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '1.25rem' }}>✏️</span>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Edit Profile &amp; Skills</h3>
          </div>
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
            <div>
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

          {/* TAB 2: SKILLS & CATEGORIES */}
          {activeTab === 'skills' && (
            <div>
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

                {/* Category Picker & Custom Input */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                  <select 
                    value={selectedTeachCategory}
                    onChange={(e) => setSelectedTeachCategory(e.target.value)}
                    style={{ padding: '0.45rem 0.65rem', borderRadius: '10px', border: '1px solid var(--slate-300)', fontSize: '0.82rem', fontWeight: 600 }}
                  >
                    {Object.keys(CATEGORY_SKILL_SUGGESTIONS).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
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

                {/* Predefined Category Suggestions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', fontWeight: 600 }}>Quick suggestions:</span>
                  {(CATEGORY_SKILL_SUGGESTIONS[selectedTeachCategory] || []).map(item => {
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

                {/* Category Picker & Custom Input */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
                  <select 
                    value={selectedLearnCategory}
                    onChange={(e) => setSelectedLearnCategory(e.target.value)}
                    style={{ padding: '0.45rem 0.65rem', borderRadius: '10px', border: '1px solid var(--slate-300)', fontSize: '0.82rem', fontWeight: 600 }}
                  >
                    {Object.keys(CATEGORY_SKILL_SUGGESTIONS).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
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

                {/* Predefined Category Suggestions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--slate-500)', fontWeight: 600 }}>Quick suggestions:</span>
                  {(CATEGORY_SKILL_SUGGESTIONS[selectedLearnCategory] || []).map(item => {
                    const isAlreadyAdded = formData.skillsWantToLearn.some(s => s.toLowerCase() === item.toLowerCase());
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleAddLearnSkill(item)}
                        style={{
                          background: isAlreadyAdded ? 'rgba(255, 118, 117, 0.15)' : 'white',
                          border: `1px ${isAlreadyAdded ? 'solid #d63031' : 'dashed var(--slate-300)'}`,
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
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AVAILABILITY & PREFERENCES */}
          {activeTab === 'availability' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.1rem', background: 'rgba(248, 250, 252, 0.75)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--slate-800)' }}>🌙 Weekday Evenings</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Available for swap sessions after 6:00 PM</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, weekdayEvenings: !p.weekdayEvenings }))}
                  className={`pill ${formData.weekdayEvenings ? 'pill-earned' : 'pill-spent'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {formData.weekdayEvenings ? '✓ Active' : 'Off'}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1.1rem', background: 'rgba(248, 250, 252, 0.75)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--slate-800)' }}>☀️ Weekend Mornings</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>Available Saturday &amp; Sunday mornings</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, weekendMornings: !p.weekendMornings }))}
                  className={`pill ${formData.weekendMornings ? 'pill-earned' : 'pill-spent'}`}
                  style={{ cursor: 'pointer', border: 'none' }}
                >
                  {formData.weekendMornings ? '✓ Active' : 'Off'}
                </button>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.86rem', color: 'var(--slate-700, #334155)', marginBottom: '0.35rem' }}>
                  🎥 Preferred Session Mode
                </label>
                <select
                  name="sessionMode"
                  value={formData.sessionMode}
                  onChange={handleChange}
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="Online Only">Online Video Call (Google Meet / Zoom)</option>
                  <option value="In-Person & Online">Both In-Person &amp; Online Video</option>
                  <option value="In-Person Only">In-Person Meetup Only</option>
                </select>
              </div>
            </div>
          )}

          {/* Modal Action Footer Buttons */}
          <div className="modal-action-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.4rem' }}>
            <button 
              type="button" 
              className="action-btn" 
              onClick={onClose}
              style={{ padding: '0.65rem 1.25rem' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.4rem' }}
            >
              Save Profile &amp; Skills
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
