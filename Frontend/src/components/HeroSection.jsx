// src/components/HeroSection.jsx

import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="landing-hero">

      {/* Left side: Hero text and stats */}
      <div className="hero-left">
        <div className="hero-tag">
          <span className="pill-badge pill-violet">✦ No fees. No tutors. Just trade skills.</span>
        </div>
        <h1 className="hero-title">
          Teach what you know.<br />
          Learn what you<br />
          <span className="highlight-violet">don't</span> <span className="highlight-mint">— for free.</span>
        </h1>
        <p className="hero-desc">
          SkillLoop pairs people who want to trade knowledge. Teach a session, earn a Skill Credit, spend it learning from anyone else in the loop. No money changes hands — ever.
        </p>

        {/* Call-to-action buttons */}
        <div className="hero-btns">
          <Link className="btn btn-primary" to="/login?mode=signup" state={{ mode: 'signup' }}>Join the loop →</Link>
          <a className="btn btn-secondary" href="#how-it-works">See how it works</a>
        </div>

        {/* Hero stats */}
        <div className="hero-stats">
          <div className="stat-item">
            <h3>2,140</h3>
            <p>active members</p>
          </div>
          <div className="stat-item">
            <h3>5,600+</h3>
            <p>sessions swapped</p>
          </div>
          <div className="stat-item">
            <h3>4.9 ★</h3>
            <p>average rating</p>
          </div>
        </div>
      </div>

      {/* Right side: Hero visual */}
      <div className="hero-visual">
        <div className="hero-visual-card">
          <div className="orbit-container">
            <div className="orbit-line"></div>
            
            <div className="center-loop-ring">
              <div className="center-loop-inner">
                <span className="loop-infinity-icon">∞</span>
                <span className="loop-label">THE LOOP</span>
              </div>
            </div>

            {/* Orbit cards for teaching and learning */}
            <div className="orbit-card orbit-card-teach">
              <span className="pill-badge pill-violet">YOU TEACH</span>
              <h4>UI Design in Figma</h4>
              <p>+1 Skill Credit earned</p>
            </div>

            <div className="orbit-card orbit-card-learn">
              <span className="pill-badge pill-mint">YOU LEARN</span>
              <h4>Conversational Spanish</h4>
              <p>-1 Skill Credit spent</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}