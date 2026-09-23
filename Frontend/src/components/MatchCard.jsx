import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getAuthStatus } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

const renderMatchAvatar = (match) => {
  if (!match) return 'SL';
  const imgUrl = match.profilePhotoUrl || (typeof match.avatar === 'string' && (match.avatar.startsWith('data:image') || match.avatar.startsWith('http')) ? match.avatar : null);

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={match.name}
        className="avatar-round-img"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
    );
  }

  const initials = typeof match.avatar === 'string' && match.avatar.length <= 4 && !match.avatar.includes('/')
    ? match.avatar
    : (match.name || 'SL')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase() || 'SL';

  return initials;
};

export default function MatchCard({ match, onRequestSwap }) {
  const navigate = useNavigate();
  const {
    id,
    _id,
    name,
    title,
    headline,
    skillsCanTeach = [],
    skillsWantToLearn = [],
    teachSkills = [],
    learnSkills = [],
    rating,
    matchType,
    canTeachMe = [],
    canLearnFromMe = [],
    similarSkills = [],
    isMutual,
    isLearnMatch,
    isTeachMatch,
    isSimilar
  } = match;

  const actualTeach = skillsCanTeach.length ? skillsCanTeach : teachSkills;
  const actualLearn = skillsWantToLearn.length ? skillsWantToLearn : learnSkills;
  const targetId = id || _id;

  const [showModal, setShowModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(canTeachMe[0] || actualTeach[0] || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { isAuthenticated } = getAuthStatus();

  const handleOpenSwap = () => {
    if (onRequestSwap && typeof onRequestSwap === 'function') {
      onRequestSwap(match);
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSelectedSkill(canTeachMe[0] || actualTeach[0] || '');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleSendSwap = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!selectedSkill) {
      setError('Please select a skill you want to learn.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${API_BASE_URL}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          receiverId: targetId,
          skillWant: selectedSkill,
          message: message.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send swap request');
      }

      setSuccess(`Swap request sent to ${name}!`);
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        setMessage('');
      }, 1400);
    } catch (err) {
      setError(err.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  const getMatchBadge = () => {
    if (isMutual || matchType === 'mutual') {
      return { text: '✨ 2-Way Match', cls: 'pill-mint' };
    }
    if (isLearnMatch || matchType === 'learn') {
      return { text: '🎓 Teaches Your Goal', cls: 'pill-violet' };
    }
    if (isTeachMatch || matchType === 'teach') {
      return { text: '💡 Wants Your Skill', cls: 'pill-coral' };
    }
    if (isSimilar || matchType === 'similar') {
      return { text: '⚡ Similar Domain', cls: 'pill-gold' };
    }
    return { text: '🌟 Community Peer', cls: 'pill-violet' };
  };

  const badge = getMatchBadge();

  return (
    <>
      <div className="glass-panel match-card clay-card-3d">
        <div className="match-card-top">
          <div className="match-avatar">
            {renderMatchAvatar(match)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{name}</h4>
              <span className={`pill-badge ${badge.cls}`} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                {badge.text}
              </span>
            </div>
            <p className="match-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              {headline || title || 'SkillLoop Community Member 🚀'}
            </p>
          </div>
          <span className="match-rating" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
            {typeof rating === 'number' ? `⭐ ${rating.toFixed(1)}` : (rating || '⭐ 5.0')}
          </span>
        </div>

        {/* Skills Section */}
        <div className="match-skills-body">
          <div className="match-skill-row">
            <span className="skill-label" style={{ fontWeight: 600, fontSize: '0.78rem', minWidth: '55px' }}>Teaches:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {actualTeach.length ? actualTeach.map((s) => {
                const isHighlighted = canTeachMe.includes(s);
                return (
                  <span key={s} className={`pill-badge ${isHighlighted ? 'pill-mint' : 'pill-violet'}`} style={{ fontSize: '0.75rem' }}>
                    {isHighlighted ? `✓ ${s}` : s}
                  </span>
                );
              }) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Any skill</span>
              )}
            </div>
          </div>

          <div className="match-skill-row">
            <span className="skill-label" style={{ fontWeight: 600, fontSize: '0.78rem', minWidth: '55px' }}>Wants:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {actualLearn.length ? actualLearn.map((s) => {
                const isHighlighted = canLearnFromMe.includes(s);
                return (
                  <span key={s} className={`pill-badge ${isHighlighted ? 'pill-coral' : 'pill-gold'}`} style={{ fontSize: '0.75rem' }}>
                    {isHighlighted ? `★ ${s}` : s}
                  </span>
                );
              }) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Open to explore</span>
              )}
            </div>
          </div>
        </div>

        {/* Request Swap Button */}
        <button 
          type="button"
          className="btn btn-primary btn-full btn-pill-sm"
          onClick={handleOpenSwap}
          style={{ marginTop: '0.75rem' }}
        >
          🔄 Request Skill Swap
        </button>
      </div>

      {/* Swap Request Modal */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay full-viewport-blur-overlay" onClick={() => setShowModal(false)}>
          <div className="glass-panel swap-request-center-modal clay-card-3d modal-box-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="swap-modal-user-header">
                <div className="user-avatar swap-modal-avatar">
                  {renderMatchAvatar(match)}
                </div>
                <div>
                  <div className="swap-modal-name-row">
                    <h3 className="swap-modal-name-title">{name}</h3>
                    <span className="rating-text swap-modal-rating">
                      {typeof rating === 'number' ? `⭐ ${rating.toFixed(1)}` : (rating || '⭐ 5.0')}
                    </span>
                  </div>
                  <p className="text-subtle swap-modal-headline">{headline || title || 'SkillLoop Member'}</p>
                </div>
              </div>
              <button type="button" className="close-modal-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* Member Teaching Skills Preview */}
            <div className="swap-modal-member-details glass-panel margin-bottom-xs swap-skills-preview-box">
              <div className="swap-skills-preview-title">
                Skills {name} Can Teach:
              </div>
              <div className="tag-picker">
                {actualTeach.map((skill, idx) => (
                  <span key={idx} className={`pill-badge ${canTeachMe.includes(skill) ? 'pill-mint' : 'pill-violet'} swap-skill-pill`}>
                    {canTeachMe.includes(skill) ? `✓ ${skill}` : skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Selection */}
            <div className="form-group margin-bottom-xs">
              <label className="form-label modal-form-label">Skill you want to learn *</label>
              <select
                className="form-select-styled"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                disabled={loading}
              >
                {actualTeach.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Message Box */}
            <div className="form-group margin-bottom-xs">
              <label className="form-label modal-form-label">Message for {name}</label>
              <textarea
                className="form-textarea-styled"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${name}, I'd love to learn ${selectedSkill} with you and share skills in a session!`}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="onboarding-error-banner margin-bottom-xs alert-banner-danger">
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="request-success-banner margin-bottom-xs alert-banner-success">
                ✓ {success}
              </div>
            )}

            <div className="modal-action-buttons modal-actions-spaced">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={loading}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSendSwap} disabled={loading || !selectedSkill}>
                {loading ? 'Sending...' : 'Send Swap Request →'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
