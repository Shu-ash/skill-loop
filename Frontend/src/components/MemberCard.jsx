import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api';

export default function MemberCard({ member }) {
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
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleOpenRequest = () => {
    setSuccess('');
    setError('');

    if (skills.length === 0) {
      setError('This member has no teaching skills available.');
      return;
    }

    setSelectedSkill(selectedSkill || skills[0]);
    setShowRequestForm(true);
  };

  const handleSendRequest = async () => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      setError('Please login before sending a swap request.');
      return;
    }

    if (!id) {
      setError('This member does not have a valid user ID.');
      return;
    }

    if (!selectedSkill) {
      setError('Please select a skill.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to send swap request.');
      }

      setSuccess('Swap request sent successfully!');
      setMessage('');

    } catch (err) {
      console.error('Swap request error:', err);
      setError(err.message || 'Unable to send swap request.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
            {rating || '☆☆☆☆☆'}
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

      {!showRequestForm && (
        <div className="member-card-actions">
          <button
            type="button"
            className="btn btn-primary btn-full btn-pill-sm"
            onClick={handleOpenRequest}
            disabled={skills.length === 0}
          >
            🔄 Request Skill Swap
          </button>

          <Link
            className="btn btn-secondary btn-pill-sm btn-full"
            to={`/requests?user=${id}`}
          >
            View requests
          </Link>
        </div>
      )}

      {showRequestForm && (
        <div className="glass-panel request-inline-form">
          <h4>Request Skill Swap</h4>

          <div className="form-group">
            <label htmlFor={`skill-${id}`}>Skill you want</label>
            <select
              id={`skill-${id}`}
              value={selectedSkill}
              onChange={(event) => setSelectedSkill(event.target.value)}
              disabled={loading}
            >
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor={`message-${id}`}>Message</label>
            <textarea
              id={`message-${id}`}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Tell them what you would like to learn..."
              rows={3}
              maxLength={1000}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="onboarding-error-banner">
              {error}
            </div>
          )}

          {success && (
            <div className="glass-panel request-success-banner">
              ✓ {success}
            </div>
          )}

          <div className="request-modal-btns">
            <button
              type="button"
              className="btn btn-primary btn-full"
              onClick={handleSendRequest}
              disabled={loading || !selectedSkill}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={() => {
                setShowRequestForm(false);
                setError('');
              }}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}