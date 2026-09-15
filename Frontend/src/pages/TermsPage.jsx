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

      <main className="public-content-container narrow">
        <div className="glass-panel clay-card-3d legal-card-panel">
          <span className="pill-badge pill-purple">
            📜 Member Agreement
          </span>
          <h1 className="legal-page-title">
            Terms &amp; Conditions
          </h1>
          <p className="legal-updated-meta">
            Last Updated: August 2026 • Effective for all registered SkillLoop members
          </p>

          <hr className="legal-divider-line" />

          <div className="legal-sections-flow">
            <section>
              <h2 className="legal-section-heading">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account or using the SkillLoop platform, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you should not access or use SkillLoop.
              </p>
            </section>

            <section>
              <h2 className="legal-section-heading">
                2. The Skill Credit Economy &amp; Time-Banking
              </h2>
              <p>
                SkillLoop operates on a peer-to-peer time-banking economy. Every verified teaching session earns the mentor credit, which can subsequently be spent on learning sessions.
              </p>
              <ul className="legal-bullet-list">
                <li>Credits hold no fiat monetary value and cannot be redeemed for cash or transferred outside of SkillLoop.</li>
                <li>Users are given initial starting credits upon signup to foster early community engagement.</li>
                <li>Gaming, artificially inflating, or trading credits for external financial compensation is strictly prohibited.</li>
              </ul>
            </section>

            <section>
              <h2 className="legal-section-heading">
                3. Member Code of Conduct
              </h2>
              <p>
                SkillLoop is a respectful, safe, and supportive educational space. All members agree to:
              </p>
              <ul className="legal-bullet-list">
                <li>Show up promptly for scheduled video call sessions.</li>
                <li>Refrain from hate speech, harassment, unsolicited commercial spam, or abusive behavior.</li>
                <li>Respect intellectual property and privacy of peer mentors and learners.</li>
              </ul>
            </section>

            <section>
              <h2 className="legal-section-heading">
                4. Session Attendance &amp; Dispute Resolution
              </h2>
              <p>
                If a participant fails to attend a confirmed session or if a session is disrupted, either party may file an in-app dispute. SkillLoop system moderators review meeting logs and resolve credit awards fairly and impartially.
              </p>
            </section>

            <section>
              <h2 className="legal-section-heading">
                5. Account Suspension &amp; Termination
              </h2>
              <p>
                SkillLoop reserves the right to suspend or ban any user account that violates our community standards, distributes harmful material, or engages in fraudulent activity without prior notice.
              </p>
            </section>

            <section>
              <h2 className="legal-section-heading">
                6. Contact Information
              </h2>
              <p>
                For any legal or terms inquiries, please reach out through our <Link to="/contact" className="legal-link">Contact Page</Link> or email us directly at <a href="mailto:support@skillloop.com" className="legal-link">support@skillloop.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
