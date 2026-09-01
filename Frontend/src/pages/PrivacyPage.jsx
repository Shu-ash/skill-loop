// src/pages/PrivacyPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPage() {
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
            🔒 Data Protection &amp; Security
          </span>
          <h1 style={{ fontSize: '2.3rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--slate-900)', margin: '0.4rem 0 0.5rem' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--slate-500)', marginBottom: '2rem' }}>
            Last Updated: August 2026 • We respect your privacy and never sell your personal data
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(226, 232, 240, 0.9)', margin: '1.5rem 0 2rem' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', color: 'var(--slate-700)', lineHeight: '1.8', fontSize: '0.96rem' }}>
            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                1. Information We Collect
              </h2>
              <p style={{ margin: '0 0 0.6rem' }}>
                We collect only the minimum information necessary to facilitate peer-to-peer skill swaps:
              </p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li><strong>Account Data:</strong> Your name, username, email address, and encrypted passwords.</li>
                <li><strong>Profile Details:</strong> Bio, skills you teach, skills you want to learn, and uploaded profile/cover photos.</li>
                <li><strong>Platform Usage:</strong> Swap session records, audit ledger logs, and feedback reviews.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                2. How We Use Your Data
              </h2>
              <p style={{ margin: '0 0 0.6rem' }}>
                Your data is exclusively used to:
              </p>
              <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                <li>Match you with compatible peer mentors and learners based on skill categories.</li>
                <li>Maintain your verifiable credit ledger and transaction balance.</li>
                <li>Ensure community safety, resolve disputed sessions, and prevent spam.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                3. Security &amp; Password Protection
              </h2>
              <p style={{ margin: 0 }}>
                All user passwords are cryptographically hashed using industry-standard bcrypt before being stored in our MongoDB database. We implement JWT Bearer authentication and secure HTTP cookies to safeguard active sessions.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                4. Zero Data Selling Guarantee
              </h2>
              <p style={{ margin: 0 }}>
                SkillLoop <strong>does not sell, rent, or trade</strong> your personal information or email address to third-party advertisers or data brokers under any circumstances.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.6rem' }}>
                5. Your Rights &amp; Data Control
              </h2>
              <p style={{ margin: 0 }}>
                You have full control over your profile. You can edit your bio, update your skills, change photos, or request complete account deletion at any time via your <Link to="/profile" style={{ color: 'var(--violet-primary)', fontWeight: 600 }}>Profile Page</Link> or by contacting our support team.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
