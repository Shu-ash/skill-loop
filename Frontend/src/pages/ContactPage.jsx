// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 800);
  };

  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <Navbar />

      <main className="public-content-container" style={{ maxWidth: '1080px', margin: '2.5rem auto 4rem', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="pill-badge pill-purple" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>
            💬 Get in Touch
          </span>
          <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--slate-900, #0f172a)', margin: '0.4rem 0 0.8rem' }}>
            We'd Love to Hear From You
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--slate-600, #475569)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
            Have questions about credits, swap sessions, partnership opportunities, or safety reports? Reach out directly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Contact Details Card */}
          <div className="glass-panel clay-card-3d" style={{ padding: '2.5rem', borderRadius: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--slate-900)' }}>
                Support &amp; Community Channels
              </h3>
              <p style={{ fontSize: '0.92rem', color: 'var(--slate-600)', lineHeight: '1.7', marginBottom: '2rem' }}>
                Our team responds to all member inquiries within 24 hours. For active session disputes, use the in-app dispute button or contact us here.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(108, 92, 231, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    ✉️
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-500)', display: 'block' }}>Email Support</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--slate-800)' }}>support@skillloop.com</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    🛡️
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-500)', display: 'block' }}>Safety &amp; Moderation</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--slate-800)' }}>safety@skillloop.com</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'rgba(254, 202, 87, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    📍
                  </div>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-500)', display: 'block' }}>Global Headquarters</span>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--slate-800)' }}>Online Community Hub • Worldwide</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.2rem', background: 'rgba(108, 92, 231, 0.08)', borderRadius: '18px', border: '1px solid rgba(108, 92, 231, 0.15)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--violet-primary)' }}>💡 Quick Tip:</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', margin: '0.25rem 0 0 0', lineHeight: '1.5' }}>
                You can report suspicious profiles or spam directly from any member's profile using the flag button.
              </p>
            </div>
          </div>

          {/* Interactive Message Form */}
          <div className="glass-panel clay-card-3d" style={{ padding: '2.5rem', borderRadius: '28px' }}>
            <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1.2rem', color: 'var(--slate-900)' }}>
              Send Us a Message
            </h3>

            {submitted ? (
              <div style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>✅</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981', margin: '0 0 0.5rem' }}>
                  Message Sent Successfully!
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: '1.6', margin: '0 0 1.5rem' }}>
                  Thank you for reaching out. Our support team has received your ticket and will respond via email shortly.
                </p>
                <button type="button" className="action-btn" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. Harsh Vishwakarma"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g. harsh@gmail.com"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
                    Subject / Topic
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Credits & Ledger Issue">Credits &amp; Ledger Issue</option>
                    <option value="Session Dispute">Session Dispute / Report</option>
                    <option value="Account & Login">Account &amp; Login</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea-styled"
                    placeholder="Describe how we can help you..."
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', justifyContent: 'center', marginTop: '0.5rem' }}
                >
                  {loading ? 'Sending Message...' : 'Send Message ✉️'}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
