// src/pages/TermsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <>
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <Navbar />

      <main className="public-content-container" style={{ maxWidth: '960px', margin: '2.5rem auto 4rem', padding: '0 1.5rem' }}>
        <div className="glass-panel clay-card-3d" style={{ padding: '3rem 2.5rem', borderRadius: '28px', background: 'rgba(255, 255, 255, 0.9)' }}>
          <span className="pill-badge pill-purple" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>
            📜 Member Agreement
          </span>
          <h1 style={{ fontSize: '2.3rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--slate-900)', margin: '0.4rem 0 0.5rem' }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginBottom: '2rem' }}>
            Last Updated: August 2026 • Effective for all registered SkillLoop members
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(226, 232, 240, 0.9)', margin: '1.5rem 0 2rem' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--slate-700)', lineHeight: '1.8', fontSize: '0.96rem' }}>
            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                1. Acceptance of Terms
              </h2>
              <p style={{ margin: 0 }}>
                By creating an account or using the SkillLoop platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you should not access or use SkillLoop.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                2. The Skill Credit Economy &amp; Time-Banking
              </h2>
              <p style={{ margin: '0 0 0.6rem' }}>
                SkillLoop operates on a peer-to-peer time-banking economy. Every verified teaching session earns the mentor credit, which can subsequently be spent on learning sessions.
              </p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li>Credits hold no fiat monetary value and cannot be redeemed for cash or transferred outside of SkillLoop.</li>
                <li>Users are given initial starting credits upon signup to foster early community engagement.</li>
                <li>Gaming, artificially inflating, or trading credits for external financial compensation is strictly prohibited.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                3. Member Code of Conduct
              </h2>
              <p style={{ margin: '0 0 0.6rem' }}>
                SkillLoop is a respectful, safe, and supportive educational space. All members agree to:
              </p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li>Show up promptly for scheduled video call sessions.</li>
                <li>Refrain from hate speech, harassment, unsolicited commercial spam, or abusive behavior.</li>
                <li>Respect intellectual property and privacy of peer mentors and learners.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                4. Session Attendance &amp; Dispute Resolution
              </h2>
              <p style={{ margin: 0 }}>
                If a participant fails to attend a confirmed session or if a session is disrupted, either party may file an in-app dispute. SkillLoop system moderators review meeting logs and resolve credit awards fairly and impartially.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                5. Account Suspension &amp; Termination
              </h2>
              <p style={{ margin: 0 }}>
                SkillLoop reserves the right to suspend or ban any user account that violates our community standards, distributes harmful material, or engages in fraudulent activity without prior notice.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                6. Contact Information
              </h2>
              <p style={{ margin: 0 }}>
                For any legal or terms inquiries, please reach out through our <Link to="/contact" style={{ color: 'var(--violet-primary)', fontWeight: 600 }}>Contact Page</Link> or email us directly at <a href="mailto:support@skillloop.com" style={{ color: 'var(--violet-primary)' }}>support@skillloop.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
