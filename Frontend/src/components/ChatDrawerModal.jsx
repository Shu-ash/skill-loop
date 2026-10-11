// src/components/ChatDrawerModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fetchWithAuth } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

const QUICK_PROMPTS = [
  "Hi! When are you free for our skill swap session? 👋",
  "What topics or prerequisites should I prepare beforehand? 📚",
  "I'm ready to join the video call whenever you are! 🎥"
];

export default function ChatDrawerModal({
  isOpen,
  onClose,
  partner,
  skillContext = '',
  swapRequestId = null
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const partnerId = partner?.id || partner?._id;
  const partnerName = partner?.name || 'SkillLoop Member';

  const currentUserId = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('skillloop_user') || '{}');
      return u._id || u.id || u.userId || null;
    } catch {
      return null;
    }
  })();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async (showSpinner = false) => {
    if (!partnerId) return;
    if (showSpinner) setLoading(true);
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/messages/${partnerId}`);
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data?.messages)) {
        setMessages(data.data.messages);
        // Mark incoming unread messages as read
        fetchWithAuth(`${API_BASE_URL}/messages/${partnerId}/read`, {
          method: 'PATCH'
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !partnerId) return;
    setError('');
    fetchConversation(true);

    const interval = setInterval(() => {
      fetchConversation(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, partnerId]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages.length, isOpen]);

  if (!isOpen || !partner) return null;

  const handleSend = async (e, presetText = null) => {
    if (e) e.preventDefault();
    const content = (presetText !== null ? presetText : input).trim();
    if (!content || !partnerId || sending) return;

    setSending(true);
    setError('');
    try {
      const res = await fetchWithAuth(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: partnerId,
          content,
          swapRequestId: swapRequestId || undefined
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to send message');
      }
      if (presetText === null) {
        setInput('');
      }
      setMessages((prev) => [...prev, data.data.message]);
      setTimeout(scrollToBottom, 60);
    } catch (err) {
      setError(err.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  const formatMsgTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  };

  return createPortal(
    <div
      className="modal-overlay full-viewport-blur-overlay"
      style={{ zIndex: 10000 }}
      onClick={onClose}
    >
      <div
        className="glass-panel clay-card-3d"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          height: 'min(640px, 88vh)',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          overflow: 'hidden',
          padding: 0
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--slate-200, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(37, 99, 235, 0.04)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              className="user-avatar"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--violet-primary, #2563EB)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.95rem',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {partner.profilePhotoUrl ? (
                <img
                  src={partner.profilePhotoUrl}
                  alt={partnerName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                partnerName.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                💬 {partnerName}
              </h4>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {skillContext ? `Skill Swap: ${skillContext}` : 'Direct SkillLoop Chat'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="close-modal-btn"
            onClick={onClose}
            aria-label="Close chat"
          >
            ✕
          </button>
        </div>

        {/* Messages Scroll Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem 1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem'
          }}
        >
          {loading ? (
            <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
              ⏳ Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ margin: 'auto', textAlign: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.4rem', marginBottom: '0.4rem' }}>👋</div>
              <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Start a conversation with {partnerName}
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Coordinate session timing, learning goals, or share helpful links.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-secondary btn-pill-sm"
                    style={{ fontSize: '0.76rem', textAlign: 'left', justifyContent: 'flex-start', whiteSpace: 'normal' }}
                    onClick={() => handleSend(null, prompt)}
                    disabled={sending}
                  >
                    ✨ {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
              const isMine =
                (currentUserId && String(senderId) === String(currentUserId)) ||
                String(senderId) !== String(partnerId);

              return (
                <div
                  key={msg._id || msg.createdAt}
                  style={{
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div
                    style={{
                      padding: '0.6rem 0.9rem',
                      borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMine
                        ? 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)'
                        : 'var(--slate-100, #f1f5f9)',
                      color: isMine ? '#ffffff' : 'var(--text-primary, #0f172a)',
                      fontSize: '0.86rem',
                      lineHeight: 1.45,
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.content}
                  </div>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', padding: '0 4px' }}>
                    {formatMsgTime(msg.createdAt)}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div style={{ padding: '0.4rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', fontSize: '0.78rem', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => handleSend(e)}
          style={{
            padding: '0.85rem 1rem',
            borderTop: '1px solid var(--slate-200, #e2e8f0)',
            display: 'flex',
            gap: '0.55rem',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            className="form-input"
            placeholder={`Message ${partnerName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            style={{ flex: 1, margin: 0 }}
          />
          <button
            type="submit"
            className="btn btn-primary btn-pill-sm"
            disabled={sending || !input.trim()}
            style={{ height: '40px', padding: '0 1.1rem' }}
          >
            {sending ? '...' : 'Send ➤'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}
