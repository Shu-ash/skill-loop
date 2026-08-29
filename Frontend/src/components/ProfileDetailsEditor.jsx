// src/components/ProfileDetailsEditor.jsx
import React from 'react';

// ProfileDetailsEditor: Clean, elegant showcase card for user bio, availability, and profile strength
export default function ProfileDetailsEditor({
  bio,
  availability = { weekdayEvenings: true, weekendMornings: false, mode: 'Online Only' },
  profileStrength = 85,
  onOpenEdit
}) {
  return (
    <div className="glass-panel profile-details-card" style={{ padding: '1.6rem 1.8rem', borderRadius: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'var(--font-display)' }}>
          About &amp; Availability
        </h3>
        {onOpenEdit && (
          <button 
            type="button" 
            className="action-btn" 
            onClick={onOpenEdit}
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {/* Bio Display Quote Card */}
      <div className="profile-bio-display-box" style={{
        background: 'rgba(255, 255, 255, 0.7)',
        borderRadius: '16px',
        padding: '1.1rem 1.25rem',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        marginBottom: '1.4rem',
        position: 'relative'
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--violet-primary, #6c5ce7)', display: 'block', marginBottom: '0.4rem' }}>
          About Me
        </span>
        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--slate-700, #334155)', fontStyle: bio ? 'normal' : 'italic' }}>
          {bio || 'Tell the community about yourself, your learning goals, and what you love trading! Click "Edit" to customize.'}
        </p>
      </div>

      {/* Weekly Availability Showcase */}
      <div className="availability-section" style={{ marginBottom: '1.4rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--slate-500, #64748b)', display: 'block', marginBottom: '0.65rem' }}>
          Weekly Availability &amp; Mode
        </span>
        
        <div className="availability-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div className="availability-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 1rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.6)' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800, #1e293b)' }}>
              🌙 Weekday evenings
            </span>
            <span className={`pill ${availability.weekdayEvenings ? 'pill-earned' : 'pill-spent'}`} style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}>
              {availability.weekdayEvenings ? '✓ Available' : 'Busy'}
            </span>
          </div>

          <div className="availability-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 1rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.6)' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800, #1e293b)' }}>
              ☀️ Weekend mornings
            </span>
            <span className={`pill ${availability.weekendMornings ? 'pill-earned' : 'pill-spent'}`} style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}>
              {availability.weekendMornings ? '✓ Available' : 'Busy'}
            </span>
          </div>

          <div className="availability-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 1rem', background: 'rgba(255, 255, 255, 0.6)', borderRadius: '14px', border: '1px solid rgba(226, 232, 240, 0.6)' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800, #1e293b)' }}>
              🎥 Preferred Session Mode
            </span>
            <span className="pill pill-user" style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem' }}>
              {availability.mode || 'Online Video Only'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Strength Progress Bar */}
      <div className="profile-strength-card" style={{ background: 'rgba(108, 92, 231, 0.05)', border: '1px solid rgba(108, 92, 231, 0.15)', borderRadius: '16px', padding: '1rem 1.2rem' }}>
        <div className="strength-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--slate-800, #1e293b)' }}>Profile Strength</span>
          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--violet-primary, #6c5ce7)' }}>{profileStrength}%</span>
        </div>
        <div className="strength-bar-track" style={{ height: '8px', background: 'rgba(203, 213, 225, 0.5)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div 
            className="strength-bar-fill" 
            style={{ 
              width: `${profileStrength}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #6c5ce7 0%, #10b981 100%)',
              borderRadius: '9999px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
        <p className="strength-tip" style={{ fontSize: '0.75rem', color: 'var(--slate-500, #64748b)', margin: '0.5rem 0 0 0' }}>
          💡 Complete your bio and skills to reach 100% profile strength!
        </p>
      </div>
    </div>
  );
}
