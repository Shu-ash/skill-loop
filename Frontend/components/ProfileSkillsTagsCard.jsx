// src/components/ProfileSkillsTagsCard.jsx
import React from 'react';

// ProfileSkillsTagsCard: Clean, read-only tag showcase for skills you teach and want to learn
export default function ProfileSkillsTagsCard({
  teachSkills = [],
  learnSkills = [],
  skillLevel = 'intermediate',
  onOpenEdit
}) {
  return (
    <div className="glass-panel profile-skills-card">
      <div className="profile-card-header">
        <h3 className="profile-card-title">
          My Skills &amp; Focus
        </h3>
        {onOpenEdit && (
          <button 
            type="button" 
            className="action-btn action-btn-sm" 
            onClick={onOpenEdit}
          >
            ✏️ Manage Skills
          </button>
        )}
      </div>

      {/* SKILLS I CAN TEACH */}
      <div className="skills-display-group spacing-md">
        <div className="profile-skill-subhead-row">
          <span className="profile-section-badge violet">
            🎓 Skills I Can Teach
          </span>
          <span className="pill pill-admin profile-level-badge">
            Level: {skillLevel}
          </span>
        </div>

        {teachSkills.length > 0 ? (
          <div className="profile-tags-wrapper">
            {teachSkills.map((skill) => (
              <span 
                key={skill} 
                className="skill-chip teach-chip profile-chip-lg"
              >
                <span>⚡</span> {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="empty-skills-notice profile-empty-notice">
            No teaching skills added yet. Click <strong>"Manage Skills"</strong> to add what you can teach!
          </div>
        )}
      </div>

      {/* SKILLS I WANT TO LEARN */}
      <div className="skills-display-group">
        <span className="profile-section-badge coral">
          🎯 Skills I Want to Learn
        </span>

        {learnSkills.length > 0 ? (
          <div className="profile-tags-wrapper">
            {learnSkills.map((skill) => (
              <span 
                key={skill} 
                className="skill-chip learn-chip profile-chip-lg"
              >
                <span>🎯</span> {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="empty-skills-notice profile-empty-notice">
            No learning goals added yet. Click <strong>"Manage Skills"</strong> to add skills you want to learn!
          </div>
        )}
      </div>
    </div>
  );
}
