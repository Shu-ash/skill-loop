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

      <main className="public-content-container">
        {/* Header */}
        <div className="contact-header">
          <span className="pill-badge pill-purple">
            💬 Get in Touch
          </span>
          <h1 className="contact-title">
            We'd Love to Hear From You
          </h1>
          <p className="contact-subtitle">
            Have questions about credits, swap sessions, partnership opportunities, or safety reports? Reach out directly.
          </p>
        </div>

        <div className="contact-grid-2col">
          {/* Contact Details Card */}
          <div className="glass-panel clay-card-3d contact-info-card">
            <div>
              <h3 className="contact-section-title">
                Support &amp; Community Channels
              </h3>
              <p className="contact-section-desc">
                Our team responds to all member inquiries within 24 hours. For active session disputes, use the in-app dispute button or contact us here.
              </p>

              <div className="contact-channels-list">
                <div className="contact-channel-row">
                  <div className="contact-channel-icon violet">
                    ✉️
                  </div>
                  <div>
                    <span className="contact-channel-label">Email Support</span>
                    <strong className="contact-channel-value">support@skillloop.com</strong>
                  </div>
                </div>

                <div className="contact-channel-row">
                  <div className="contact-channel-icon mint">
                    🛡️
                  </div>
                  <div>
                    <span className="contact-channel-label">Safety &amp; Moderation</span>
                    <strong className="contact-channel-value">safety@skillloop.com</strong>
                  </div>
                </div>

                <div className="contact-channel-row">
                  <div className="contact-channel-icon gold">
                    📍
                  </div>
                  <div>
                    <span className="contact-channel-label">Global Headquarters</span>
                    <strong className="contact-channel-value">Online Community Hub • Worldwide</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-tip-box">
              <span className="contact-tip-heading">💡 Quick Tip:</span>
              <p className="contact-tip-text">
                You can report suspicious profiles or spam directly from any member's profile using the flag button.
              </p>
            </div>
          </div>

          {/* Interactive Message Form */}
          <div className="glass-panel clay-card-3d contact-form-card">
            <h3 className="contact-section-title">
              Send Us a Message
            </h3>

            {submitted ? (
              <div className="contact-success-box">
                <span className="contact-success-icon">✅</span>
                <h4 className="contact-success-title">
                  Message Sent Successfully!
                </h4>
                <p className="contact-success-desc">
                  Thank you for reaching out. Our support team has received your ticket and will respond via email shortly.
                </p>
                <button type="button" className="action-btn" onClick={() => setSubmitted(false)}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form-stack">
                <div className="form-group">
                  <label className="contact-input-label">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input contact-full-width-control"
                    placeholder="e.g. Harsh Vishwakarma"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="contact-input-label">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input contact-full-width-control"
                    placeholder="e.g. harsh@gmail.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="contact-input-label">
                    Subject / Topic
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input contact-full-width-control"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Credits & Ledger Issue">Credits &amp; Ledger Issue</option>
                    <option value="Session Dispute">Session Dispute / Report</option>
                    <option value="Account & Login">Account &amp; Login</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="contact-input-label">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea-styled contact-full-width-control"
                    placeholder="Describe how we can help you..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary contact-submit-btn"
                  disabled={loading}
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
