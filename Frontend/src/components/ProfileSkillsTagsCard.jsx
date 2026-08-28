// src/components/ProfileSkillsTagsCard.jsx
import React, { useState } from 'react';

// ProfileSkillsTagsCard: Component for editing skills you teach & skills you want to learn
export default function ProfileSkillsTagsCard({
  teachSkills = [],
  setTeachSkills,
  learnSkills = [],
  setLearnSkills
}) {
  const [newTeach, setNewTeach] = useState('');
  const [newLearn, setNewLearn] = useState('');

  // Add new skill to teach list
  const addTeachSkill = () => {
    if (newTeach.trim() && !teachSkills.includes(newTeach.trim())) {
      setTeachSkills([...teachSkills, newTeach.trim()]);
      setNewTeach('');
    }
  };

  // Remove skill from teach list
  const removeTeachSkill = (skillToRemove) => {
    setTeachSkills(teachSkills.filter((s) => s !== skillToRemove));
  };

  // Add new skill to learn list
  const addLearnSkill = () => {
    if (newLearn.trim() && !learnSkills.includes(newLearn.trim())) {
      setLearnSkills([...learnSkills, newLearn.trim()]);
      setNewLearn('');
    }
  };

  // Remove skill from learn list
  const removeLearnSkill = (skillToRemove) => {
    setLearnSkills(learnSkills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="glass-panel profile-skills-card">
      <h3>Skills Editor</h3>

      {/* SKILLS I CAN TEACH */}
      <div className="skills-edit-group">
        <label className="form-label">Skills I Can Teach</label>
        <div className="profile-tags-wrapper">
          {teachSkills.map((skill) => (
            <span key={skill} className="skill-chip teach-chip">
              {skill}
              <button type="button" onClick={() => removeTeachSkill(skill)}>✕</button>
            </span>
          ))}
        </div>
        <div className="add-tag-row">
          <input
            type="text"
            className="form-input custom-skill-input"
            placeholder="Add new teach skill..."
            value={newTeach}
            onChange={(e) => setNewTeach(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTeachSkill(); } }}
          />
          <button type="button" className="btn btn-secondary btn-pill-sm" onClick={addTeachSkill}>
            + Add skill
          </button>
        </div>
      </div>

      {/* SKILLS I WANT TO LEARN */}
      <div className="skills-edit-group form-group-padded">
        <label className="form-label">Skills I Want to Learn</label>
        <div className="profile-tags-wrapper">
          {learnSkills.map((skill) => (
            <span key={skill} className="skill-chip learn-chip">
              {skill}
              <button type="button" onClick={() => removeLearnSkill(skill)}>✕</button>
            </span>
          ))}
        </div>
        <div className="add-tag-row">
          <input
            type="text"
            className="form-input custom-skill-input"
            placeholder="Add new learn skill..."
            value={newLearn}
            onChange={(e) => setNewLearn(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLearnSkill(); } }}
          />
          <button type="button" className="btn btn-secondary btn-pill-sm" onClick={addLearnSkill}>
            + Add skill
          </button>
        </div>
      </div>
    </div>
  );
}
