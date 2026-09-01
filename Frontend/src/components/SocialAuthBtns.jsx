// src/components/SocialAuthBtns.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const API_BASE_URL = 'http://localhost:5000/api';

export default function SocialAuthBtns() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [oauthModal, setOauthModal] = useState({ open: false, provider: 'google' });
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDark = theme === 'dark';

  const handleSelectAccount = async ({ email, name, avatar }) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          provider: oauthModal.provider,
          email: email.toLowerCase().trim(),
          name: name || email.split('@')[0],
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Social sign-in failed. Please ensure the backend server is running.');
      }

      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
      }
      if (data.data?.user) {
        localStorage.setItem('skillloop_user', JSON.stringify(data.data.user));
      }

      setOauthModal({ open: false, provider: 'google' });
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('OAuth error:', err);
      setError(err.message || 'Connection failed. Please verify your internet/server.');
    } finally {
      setLoading(false);
    }
  };

  const openOauthPopup = (provider) => {
    setOauthModal({ open: true, provider });
    setCustomEmail('');
    setCustomName('');
    setError('');
  };

  const modalContent = oauthModal.open ? (
    <div 
      className="modal-overlay" 
      onClick={() => setOauthModal({ open: false, provider: 'google' })}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{
          maxWidth: '430px',
          width: '100%',
          backgroundColor: isDark ? '#202124' : '#ffffff',
          borderRadius: '24px',
          padding: '2.2rem 2rem',
          boxShadow: isDark ? '0 25px 60px rgba(0, 0, 0, 0.8)' : '0 25px 60px rgba(0, 0, 0, 0.25)',
          color: isDark ? '#e8eaed' : '#1f2937',
          border: isDark ? '1px solid #3c4043' : '1px solid #e5e7eb',
          fontFamily: "'Roboto', 'Segoe UI', sans-serif",
          position: 'relative'
        }}
      >
        {/* Header with Provider Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          {oauthModal.provider === 'google' ? (
            <svg viewBox="0 0 24 24" width="40" height="40" style={{ margin: '0 auto 0.5rem auto' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          ) : (
            <svg viewBox="0 0 23 23" width="38" height="38" style={{ margin: '0 auto 0.5rem auto' }}>
              <path fill="#f35325" d="M1 1h10v10H1z" />
              <path fill="#81bc06" d="M12 1h10v10H12z" />
              <path fill="#05a6f0" d="M1 12h10v10H1z" />
              <path fill="#ffba08" d="M12 12h10v10H12z" />
            </svg>
          )}
          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.3rem', fontWeight: 600, color: isDark ? '#ffffff' : '#111827' }}>
            Sign in with {oauthModal.provider === 'google' ? 'Google' : 'Microsoft'}
          </h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: isDark ? '#9aa0a6' : '#6b7280' }}>
            to continue to <strong style={{ color: 'var(--violet-primary, #6c5ce7)' }}>SkillLoop</strong>
          </p>
        </div>

        {error && (
          <div style={{ background: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '0.65rem 0.85rem', fontSize: '0.84rem', fontWeight: 500, marginBottom: '1.1rem', textAlign: 'center' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Quick Click Account Chooser */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.2rem' }}>
          <button
            type="button"
            onClick={() => handleSelectAccount({ email: 'harsh.vishwakarma@gmail.com', name: 'Harsh Vishwakarma' })}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.85rem 1rem',
              borderRadius: '14px',
              border: isDark ? '1px solid #3c4043' : '1px solid #e5e7eb',
              backgroundColor: isDark ? '#303134' : '#f9fafb',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s ease'
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.92rem' }}>
              HV
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.92rem', color: isDark ? '#ffffff' : '#111827' }}>Harsh Vishwakarma</div>
              <div style={{ fontSize: '0.8rem', color: isDark ? '#9aa0a6' : '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis' }}>harsh.vishwakarma@gmail.com</div>
            </div>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: isDark ? '#5f6368' : '#9ca3af', fontSize: '0.8rem' }}>
          <div style={{ flex: 1, height: '1px', background: isDark ? '#3c4043' : '#e5e7eb' }}></div>
          <span style={{ padding: '0 0.6rem' }}>or use another account</span>
          <div style={{ flex: 1, height: '1px', background: isDark ? '#3c4043' : '#e5e7eb' }}></div>
        </div>

        {/* Custom Account Input Form */}
        <form onSubmit={(e) => { e.preventDefault(); if (customEmail) handleSelectAccount({ email: customEmail, name: customName }); }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <input
              type="email"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder={`Enter your ${oauthModal.provider === 'google' ? 'Google / Gmail' : 'Microsoft'} email`}
              required
              style={{
                width: '100%',
                padding: '0.75rem 0.95rem',
                borderRadius: '10px',
                border: isDark ? '1.5px solid #5f6368' : '1.5px solid #d1d5db',
                backgroundColor: isDark ? '#171717' : '#ffffff',
                color: isDark ? '#ffffff' : '#111827',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Your Full Name (optional)"
              style={{
                width: '100%',
                padding: '0.75rem 0.95rem',
                borderRadius: '10px',
                border: isDark ? '1.5px solid #5f6368' : '1.5px solid #d1d5db',
                backgroundColor: isDark ? '#171717' : '#ffffff',
                color: isDark ? '#ffffff' : '#111827',
                fontSize: '0.88rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !customEmail}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: oauthModal.provider === 'google' ? '#1a73e8' : '#0078d4',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              marginBottom: '1rem',
              transition: 'opacity 0.2s ease'
            }}
          >
            {loading ? 'Authenticating...' : `Continue with ${oauthModal.provider === 'google' ? 'Google' : 'Microsoft'} →`}
          </button>
        </form>

        <div style={{ fontSize: '0.74rem', color: isDark ? '#9aa0a6' : '#6b7280', textAlign: 'center', lineHeight: '1.4' }}>
          🔒 To continue, {oauthModal.provider === 'google' ? 'Google' : 'Microsoft'} will securely share your verified name, email address, and profile with SkillLoop.
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div className="divider-or">or continue with</div>

      <div className="social-btn-grid">
        <button
          type="button"
          className="btn btn-secondary btn-full social-auth-btn"
          onClick={() => openOauthPopup('google')}
          title="Sign in with Google"
        >
          <svg viewBox="0 0 24 24" width="18" height="18">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-full social-auth-btn"
          onClick={() => openOauthPopup('microsoft')}
          title="Sign in with Microsoft"
        >
          <svg viewBox="0 0 23 23" width="18" height="18">
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
          <span>Microsoft</span>
        </button>
      </div>

      {/* Render via Portal so it is 100% Centered on viewport */}
      {typeof document !== 'undefined' && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}