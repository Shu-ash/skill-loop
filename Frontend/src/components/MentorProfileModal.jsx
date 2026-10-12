// src/components/MentorProfileModal.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

const API_BASE_URL = 'http://localhost:5000/api';

export default function MentorProfileModal({
  isOpen,
  onClose,
  member,
  onRequestSwap,
  onOpenChat
}) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);

  const memberId = member?.id || member?._id;

  const currentUserSkills = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('skillloop_user') || '{}');
      return {
        canTeach: (stored.skillsCanTeach || stored.teachSkills || []).map((s) =>
          String(s).toLowerCase()
        ),
        wantToLearn: (stored.skillsWantToLearn || stored.learnSkills || []).map((s) =>
          String(s).toLowerCase()
        )
      };
    } catch {
      return { canTeach: [], wantToLearn: [] };
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !memberId) return;
    let isMounted = true;
    const fetchPublicProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/users/${memberId}/public`);
        const data = await res.json();
        if (isMounted && res.ok && data.success && data.data) {
          setProfileData(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch public mentor profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPublicProfile();
    return () => {
      isMounted = false;
    };
  }, [isOpen, memberId]);

  if (!isOpen || !member) return null;

  const user = profileData?.user || {
    id: memberId,
    name: member.name || 'SkillLoop Member',
    username: member.username ? `@${member.username.replace(/^@/, '')}` : '',
    profilePhotoUrl: member.profilePhotoUrl || '',
    headline: member.headline || member.title || 'SkillLoop Community Member 🚀',
    bio: member.bio || '',
    skillsCanTeach: member.skillsCanTeach || member.skills || [],
    skillsWantToLearn: member.skillsWantToLearn || [],
    skillLevel: member.skillLevel || 'intermediate',
    availability: member.availability || {
      weekdayEvenings: true,
      weekendMornings: false,
      mode: 'Online Only'
    },
    rating: member.ratingValue ?? (typeof member.rating === 'number' ? member.rating : 5.0),
    ratingCount: member.ratingCount || 0
  };

  const stats = profileData?.stats || {
    sessionsTaught: 0,
    sessionsLearned: 0,
    totalReviews: user.ratingCount || 0
  };

  const badges = profileData?.badges || [];
  const reviews = profileData?.reviews || [];

  const mutualTeachMatches = (user.skillsCanTeach || []).filter((s) =>
    currentUserSkills.wantToLearn.includes(String(s).toLowerCase())
  );
  const mutualLearnMatches = (user.skillsWantToLearn || []).filter((s) =>
    currentUserSkills.canTeach.includes(String(s).toLowerCase())
  );
  const isMutualSwap = mutualTeachMatches.length > 0 && mutualLearnMatches.length > 0;

  return createPortal(
    <div
      className="modal-overlay full-viewport-blur-overlay"
      style={{ zIndex: 9998 }}
      onClick={onClose}
    >
      <div
        className="glass-panel clay-card-3d"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '88vh',
          overflowY: 'auto',
          borderRadius: '26px',
          padding: '1.6rem'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              className="user-avatar"
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'var(--violet-primary, #2563EB)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)'
              }}
            >
              {user.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                (user.name || 'SL').slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {user.name}
                </h3>
                {user.username && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {user.username}
                  </span>
                )}
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {user.headline}
              </p>
            </div>
          </div>

          <button type="button" className="close-modal-btn" onClick={onClose} aria-label="Close profile modal">
            ✕
          </button>
        </div>

        {/* Mutual Swap Highlight Banner */}
        {isMutualSwap && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              marginBottom: '1rem',
              fontSize: '0.84rem',
              color: 'var(--text-primary)'
            }}
          >
            <strong style={{ color: '#059669' }}>✨ Perfect 2-Way Skill Swap Match!</strong>
            <div style={{ marginTop: '2px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              They teach <strong>{mutualTeachMatches.join(', ')}</strong> (which you want to learn) &amp; want to learn{' '}
              <strong>{mutualLearnMatches.join(', ')}</strong> (which you teach)!
            </div>
          </div>
        )}

        {/* KPI Stats Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            marginBottom: '1.2rem'
          }}
        >
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '14px',
              background: 'rgba(37, 99, 235, 0.06)',
              border: '1px solid rgba(37, 99, 235, 0.15)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--violet-primary)' }}>
              ⭐ {Number(user.rating || 5.0).toFixed(1)}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {stats.totalReviews} {stats.totalReviews === 1 ? 'Review' : 'Reviews'}
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.18)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>
              🎓 {stats.sessionsTaught}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Sessions Taught
            </div>
          </div>

          <div
            style={{
              padding: '0.75rem',
              borderRadius: '14px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.22)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706' }}>
              🧠 {stats.sessionsLearned}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Sessions Learned
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div style={{ marginBottom: '1.1rem' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              About {user.name}
            </h4>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>
              {user.bio}
            </p>
          </div>
        )}

        {/* Skills Can Teach & Want To Learn */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.2rem' }}>
          <div
            style={{
              padding: '0.85rem',
              borderRadius: '16px',
              background: 'rgba(37, 99, 235, 0.04)',
              border: '1px solid rgba(37, 99, 235, 0.15)'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--violet-primary)', marginBottom: '0.5rem' }}>
              🎓 Skills They Teach ({(user.skillsCanTeach || []).length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {(user.skillsCanTeach || []).length > 0 ? (
                user.skillsCanTeach.map((sk) => (
                  <span key={sk} className="pill-badge pill-violet" style={{ fontSize: '0.74rem' }}>
                    {sk}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>None listed yet</span>
              )}
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem',
              borderRadius: '16px',
              background: 'rgba(16, 185, 129, 0.04)',
              border: '1px solid rgba(16, 185, 129, 0.15)'
            }}
          >
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', marginBottom: '0.5rem' }}>
              🌱 Skills They Want to Learn ({(user.skillsWantToLearn || []).length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {(user.skillsWantToLearn || []).length > 0 ? (
                user.skillsWantToLearn.map((sk) => (
                  <span key={sk} className="pill-badge pill-mint" style={{ fontSize: '0.74rem' }}>
                    {sk}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Open to all skills</span>
              )}
            </div>
          </div>
        </div>

        {/* Availability & Badges */}
        <div style={{ marginBottom: '1.2rem' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
            📅 Preferred Availability &amp; Achievements
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
            {user.availability?.weekdayEvenings && (
              <span className="pill-badge pill-white" style={{ fontSize: '0.75rem' }}>
                🌙 Weekday Evenings
              </span>
            )}
            {user.availability?.weekendMornings && (
              <span className="pill-badge pill-white" style={{ fontSize: '0.75rem' }}>
                ☀️ Weekend Mornings
              </span>
            )}
            <span className="pill-badge pill-white" style={{ fontSize: '0.75rem' }}>
              🎥 {user.availability?.mode || 'Online Only'}
            </span>
            {badges.map((b) => (
              <span
                key={b.code || b.name}
                className="pill-badge pill-gold"
                title={b.description || b.reason}
                style={{ fontSize: '0.75rem' }}
              >
                {b.icon || '🏆'} {b.name}
              </span>
            ))}
          </div>
        </div>

        {/* Student Reviews */}
        <div style={{ marginBottom: '1.3rem' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            ⭐ Student Reviews ({reviews.length})
          </h4>
          {loading ? (
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
              ⏳ Loading verified reviews...
            </div>
          ) : reviews.length === 0 ? (
            <div
              style={{
                padding: '0.85rem',
                borderRadius: '12px',
                background: 'var(--slate-100, #f1f5f9)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}
            >
              No student reviews yet — be the first to swap skills with {user.name}!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '190px', overflowY: 'auto' }}>
              {reviews.map((rev) => (
                <div
                  key={rev._id}
                  style={{
                    padding: '0.75rem 0.9rem',
                    borderRadius: '12px',
                    background: 'var(--slate-100, #f1f5f9)',
                    border: '1px solid var(--slate-200, #e2e8f0)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.83rem', color: 'var(--text-primary)' }}>
                      {rev.reviewer?.name || 'SkillLoop Student'}
                      {rev.skill && (
                        <span style={{ fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>
                          • {rev.skill}
                        </span>
                      )}
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
                      {'★'.repeat(Math.round(rev.rating || 5))}
                    </span>
                  </div>
                  {rev.comment && (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {onOpenChat && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                onOpenChat(user);
              }}
            >
              💬 Message {user.name.split(' ')[0]}
            </button>
          )}
          {onRequestSwap && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onRequestSwap(user);
              }}
            >
              🔄 Request Skill Swap
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
