// src/components/CtaSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function CtaSection() {
  return (
    <section className="cta-section">
      <div className="glass-panel cta-box clay-card-3d">
        <div className="cta-community-illustration">
          <div className="avatar-stack">
            <span className="community-avatar avatar-1">👨‍💻</span>
            <span className="community-avatar avatar-2">👩‍🎨</span>
            <span className="community-avatar avatar-3">👨‍🎓</span>
            <span className="community-avatar avatar-4">👩‍🔬</span>
          </div>
          <span className="pill-badge pill-violet">Join 10,000+ happy learners &amp; teachers</span>
        </div>

        <h2>Ready to Start Your Journey?</h2>
        <p>Join SkillLoop today and be part of our amazing peer-to-peer community.</p>

        <Link className="btn btn-primary btn-clay-primary" to="/login?mode=signup" state={{ mode: 'signup' }}>
          Get started for free &rarr;
        </Link>
      </div>
    </section>
  );
}