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

      <main className="public-content-container narrow">
        <div className="glass-panel clay-card-3d legal-card-panel">
          <span className="pill-badge pill-purple">
            🔒 Data Protection &amp; Security
          </span>
          <h1 className="legal-page-title">
            Privacy Policy
          </h1>
          <p className="legal-updated-meta">
            Last Updated: August 2026 • We respect your privacy and never sell your personal data
          </p>

          <hr className="legal-divider-line" />

          <div className="legal-sections-flow">
            <section>
              <h2 className="legal-section-heading">
                1. Information We Collect
              </h2>
              <p>
                We collect only the minimum information necessary to facilitate peer-to-peer skill swaps:
              </p>
              <ul className="legal-bullet-list">
                <li><strong>Account Data:</strong> Your name, username, email address, and encrypted passwords.</li>
                <li><strong>Profile Details:</strong> Bio, skills you teach, skills you want to learn, and uploaded profile/cover photos.</li>
                <li><strong>Platform Usage:</strong> Swap session records, audit ledger logs, and feedback reviews.</li>
              </ul>
            </section>

            <section>
              <h2 className="legal-section-heading">
                2. How We Use Your Data
              </h2>
              <p>
                Your data is exclusively used to:
              </p>
              <ul className="legal-bullet-list">
                <li>Match you with compatible peer mentors and learners based on skill categories.</li>
                <li>Maintain your verifiable credit ledger and transaction balance.</li>
                <li>Ensure community safety, resolve disputed sessions, and prevent spam.</li>
              </ul>
            </section>

            <section>
              <h2 className="legal-section-heading">
                3. Security &amp; Password Protection
              </h2>
              <p>
                All user passwords are cryptographically hashed using industry-standard bcrypt before being stored in our MongoDB database. We implement JWT Bearer authentication and secure HTTP cookies to safeguard active sessions.
              </p>
            </section>

            <section>
              <h2 className="legal-section-heading">
                4. Zero Data Selling Guarantee
              </h2>
              <p>
                SkillLoop <strong>does not sell, rent, or trade</strong> your personal information or email address to third-party advertisers or data brokers under any circumstances.
              </p>
            </section>

            <section>
              <h2 className="legal-section-heading">
                5. Your Rights &amp; Data Control
              </h2>
              <p>
                You have full control over your profile. You can edit your bio, update your skills, change photos, or request complete account deletion at any time via your <Link to="/profile" className="legal-link">Profile Page</Link> or by contacting our support team.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
