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
    <div className="glass-panel profile-skills-card" style={{ padding: '1.6rem 1.8rem', borderRadius: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
          My Skills &amp; Focus
        </h3>
        {onOpenEdit && (
          <button 
            type="button" 
            className="action-btn" 
            onClick={onOpenEdit}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
          >
            ✏️ Manage Skills
          </button>
        )}
      </div>

      {/* SKILLS I CAN TEACH */}
      <div className="skills-display-group" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--violet-primary, #6c5ce7)' }}>
            🎓 Skills I Can Teach
          </span>
          <span className="pill pill-admin" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem', textTransform: 'capitalize' }}>
            Level: {skillLevel}
          </span>
        </div>

        {teachSkills.length > 0 ? (
          <div className="profile-tags-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {teachSkills.map((skill) => (
              <span 
                key={skill} 
                className="skill-chip teach-chip"
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>⚡</span> {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="empty-skills-notice" style={{ padding: '1rem', borderRadius: '14px', textAlign: 'center', fontSize: '0.85rem' }}>
            No teaching skills added yet. Click <strong>"Manage Skills"</strong> to add what you can teach!
          </div>
        )}
      </div>

      {/* SKILLS I WANT TO LEARN */}
      <div className="skills-display-group">
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--coral-primary, #ff7675)', display: 'block', marginBottom: '0.65rem' }}>
          🎯 Skills I Want to Learn
        </span>

        {learnSkills.length > 0 ? (
          <div className="profile-tags-wrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {learnSkills.map((skill) => (
              <span 
                key={skill} 
                className="skill-chip learn-chip"
                style={{
                  padding: '0.45rem 0.95rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <span>🎯</span> {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="empty-skills-notice" style={{ padding: '1rem', borderRadius: '14px', textAlign: 'center', fontSize: '0.85rem' }}>
            No learning goals added yet. Click <strong>"Manage Skills"</strong> to add skills you want to learn!
          </div>
        )}
      </div>
    </div>
  );
}
