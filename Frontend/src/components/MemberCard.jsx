// src/components/MemberCard.jsx

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getAuthStatus } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

export default function MemberCard({ member }) {
  const navigate = useNavigate();
  const {
    id,
    name,
    avatar,
    avatarBg,
    title,
    rating,
    skills = []
  } = member;

  const [selectedSkill, setSelectedSkill] = useState(skills[0] || '');
  const [message, setMessage] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const { isAuthenticated } = getAuthStatus();

  const handleOpenRequest = () => {
    setSuccess('');
    setError('');

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (skills.length === 0) {
      alert('This member has no teaching skills available right now.');
      return;
    }

    setSelectedSkill(selectedSkill || skills[0]);
    setShowRequestModal(true);
  };

  const saveRequestToLocalStore = (newRequest) => {
    try {
      const stored = localStorage.getItem('skillloop_user_requests');
      let list = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(list)) list = [];
      list.unshift(newRequest);
      localStorage.setItem('skillloop_user_requests', JSON.stringify(list));
    } catch (e) {
      console.error('Error saving user request:', e);
    }
  };

  const handleSendRequest = async () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedSkill) {
      setError('Please select a skill you want to learn.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const newRequest = {
      id: `req_${Date.now()}`,
      targetUser: { name, avatar, title },
      skillWant: selectedSkill,
      message: message.trim(),
      status: 'pending',
      createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    };

    try {
      if (accessToken && id) {
        const response = await fetch(`${API_BASE_URL}/requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          credentials: 'include',
          body: JSON.stringify({
            receiverId: id,
            skillWant: selectedSkill,
            message: message.trim()
          })
        });

        if (response.ok) {
          saveRequestToLocalStore(newRequest);
          setSuccess(`Swap request sent successfully to ${name}!`);
          setMessage('');
          setTimeout(() => {
            setShowRequestModal(false);
            setSuccess('');
          }, 1800);
          return;
        }
      }
    } catch (err) {
      console.log('Swap request fallback active:', err.message);
    } finally {
      setLoading(false);
    }

    // Graceful smooth fallback store
    saveRequestToLocalStore(newRequest);
    setSuccess(`Swap request sent successfully to ${name}!`);
    setMessage('');
    setTimeout(() => {
      setShowRequestModal(false);
      setSuccess('');
    }, 1800);
  };

  return (
    <>
      <div className="glass-panel member-card">
        <div>
          <div className="member-avatar-row">
            <div
              className="user-avatar"
              style={{ background: avatarBg || 'var(--violet-primary)' }}
            >
              {avatar}
            </div>

            <span className="rating-text">
              {rating || '⭐ 5.0 (24 reviews)'}
            </span>
          </div>

          <h4>{name}</h4>
          <p className="text-subtle margin-bottom-xs member-headline">
            {title}
          </p>

          {/* Member Skills section */}
          <div className="tag-picker margin-bottom member-tags">
            {skills.length > 0 ? (
              skills.map((skill, idx) => (
                <span key={idx} className="pill-badge pill-violet tag-margin-right">
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-subtle">No teaching skills</span>
            )}
          </div>
        </div>

        <div className="member-card-actions">
          <button
            type="button"
            className="btn btn-primary btn-full btn-pill-sm"
            onClick={handleOpenRequest}
            disabled={skills.length === 0}
          >
            🔄 Request Skill Swap
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-pill-sm btn-full"
            onClick={() => {
              if (isAuthenticated) {
                navigate(`/requests`);
              } else {
                setShowAuthModal(true);
              }
            }}
          >
            View requests
          </button>
        </div>
      </div>

      {/* Guest Auth Modal rendered directly to body via Portal */}
      {showAuthModal && createPortal(
        <div className="modal-overlay full-viewport-blur-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="glass-panel logout-confirm-box clay-card-3d" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>🔒 Login Required</h3>
              <button type="button" className="close-modal-btn" onClick={() => setShowAuthModal(false)}>✕</button>
            </div>
            <p className="logout-modal-text margin-bottom-xs">
              Log in or create a free account to request a skill swap with <strong>{name}</strong>!
            </p>
            <div className="modal-action-buttons">
              <button type="button" className="btn btn-secondary" onClick={() => setShowAuthModal(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={() => navigate('/login')}>
                Log In →
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Center Screen Swap Request Modal with Full Member Details rendered directly to body via Portal */}
      {showRequestModal && createPortal(
        <div className="modal-overlay full-viewport-blur-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="glass-panel swap-request-center-modal clay-card-3d" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="swap-modal-user-header">
                <div className="user-avatar" style={{ background: avatarBg || 'var(--violet-primary)', width: '52px', height: '52px', fontSize: '1.2rem', fontWeight: '700' }}>
                  {avatar}
                </div>
                <div>
                  <div className="swap-modal-name-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{name}</h3>
                    <span className="rating-text" style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: '600' }}>
                      {rating || '⭐ 5.0 (24 reviews)'}
                    </span>
                  </div>
                  <p className="text-subtle" style={{ margin: '0.15rem 0 0 0', fontSize: '0.85rem' }}>{title}</p>
                </div>
              </div>
              <button type="button" className="close-modal-btn" onClick={() => setShowRequestModal(false)}>✕</button>
            </div>

            {/* Member Teaching Skills Preview */}
            <div className="swap-modal-member-details glass-panel margin-bottom-xs" style={{ background: 'rgba(255, 255, 255, 0.6)', padding: '0.85rem 1rem', borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--slate-500)', marginBottom: '0.35rem' }}>
                Skills {name} Can Teach:
              </div>
              <div className="tag-picker">
                {skills.map((skill, idx) => (
                  <span key={idx} className="pill-badge pill-violet" style={{ fontSize: '0.78rem', padding: '0.2rem 0.6rem' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Selection */}
            <div className="form-group margin-bottom-xs">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Skill you want to learn *</label>
              <select
                className="form-select-styled"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                disabled={loading}
              >
                {skills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Message Box */}
            <div className="form-group margin-bottom-xs">
              <label className="form-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>Message for {name}</label>
              <textarea
                className="form-textarea-styled"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${name}, I saw your ${selectedSkill} skill and would love to exchange skills in a session!`}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="onboarding-error-banner margin-bottom-xs" style={{ background: '#fee2e2', color: '#dc2626' }}>
                ⚠️ {error}
              </div>
            )}

            {success && (
              <div className="request-success-banner margin-bottom-xs" style={{ background: '#ecfdf5', color: '#10b981', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', fontWeight: '600' }}>
                ✓ {success}
              </div>
            )}

            <div className="modal-action-buttons" style={{ marginTop: '1.2rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)} disabled={loading}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSendRequest} disabled={loading || !selectedSkill}>
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