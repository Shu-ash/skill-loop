// src/components/HowItWorksHero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getAuthStatus } from '../utils/auth';

// HowItWorksHero: Top banner introducing the peer-to-peer skill loop concept
export default function HowItWorksHero() {
  const { isAuthenticated } = getAuthStatus();
  const targetLink = isAuthenticated ? '/browse' : '/login?mode=signup';

  return (
    <section className="how-hero-section">
      <span className="pill-badge pill-violet">✦ ZERO COST SKILL ECONOMY</span>
      <h1 className="how-hero-title">
        How <span className="highlight-violet">SkillLoop</span> Works
      </h1>
      <p className="how-hero-desc">
        Trade knowledge directly with peers. No tutors, no subscriptions, and no money exchanged — ever.
        Teach a session, earn a Skill Credit, and spend it learning anything you want.
      </p>

      <div className="how-hero-btns">
        <Link to={targetLink} className="btn btn-primary">
          {isAuthenticated ? 'Explore skills to learn →' : 'Join the loop →'}
        </Link>
        <Link to="/browse" className="btn btn-secondary">
          Explore skills
        </Link>
      </div>
    </section>
  );
}
