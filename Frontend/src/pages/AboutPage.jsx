// src/pages/AboutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <>
      {/* Liquid animated background */}
      <div className="liquid-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-blob blob-3"></div>
      </div>

      <Navbar />

      <main className="public-content-container">
        {/* Header Hero Banner */}
        <div className="glass-panel clay-card-3d public-hero-card">
          <span className="pill-badge pill-purple">
            🚀 Our Mission &amp; Story
          </span>
          <h1 className="public-hero-title">
            Empowering Anyone to <span className="brand-accent-text">Learn by Teaching</span>
          </h1>
          <p className="public-hero-desc">
            SkillLoop is a decentralized peer-to-peer micro-learning exchange where financial barriers disappear. Everyone has something valuable to teach, and everyone has a passion to learn.
          </p>

          <div className="public-btn-group">
            <Link to="/browse" className="btn btn-primary public-btn">
              🔍 Explore Skills
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary public-btn">
              ⚡ How It Works
            </Link>
          </div>
        </div>

        {/* 3 Core Pillars Grid */}
        <div className="public-pillars-grid">
          <div className="glass-panel clay-card-3d public-pillar-card">
            <div className="public-pillar-icon violet">
              🪙
            </div>
            <h3 className="public-pillar-title">
              Fair Time-Banking Economy
            </h3>
            <p className="public-pillar-desc">
              1 Hour of Teaching = 1 Skill Credit Earned. 1 Credit = 1 Hour of Learning from another expert. No hidden subscriptions, no fees.
            </p>
          </div>

          <div className="glass-panel clay-card-3d public-pillar-card">
            <div className="public-pillar-icon mint">
              👥
            </div>
            <h3 className="public-pillar-title">
              Direct 1-on-1 Mentorship
            </h3>
            <p className="public-pillar-desc">
              Instead of watching impersonal pre-recorded videos, you practice live with real developers, designers, polyglots, and mentors via video calls.
            </p>
          </div>

          <div className="glass-panel clay-card-3d public-pillar-card">
            <div className="public-pillar-icon coral">
              🛡️
            </div>
            <h3 className="public-pillar-title">
              Audited &amp; Safe Learning
            </h3>
            <p className="public-pillar-desc">
              Every swap transaction is logged in an auditable ledger. Our admin moderation team guarantees a respectful, harassment-free environment.
            </p>
          </div>
        </div>

        {/* Community Values & Culture */}
        <div className="glass-panel public-card-box">
          <h2 className="public-card-title-lg">
            Why We Built SkillLoop
          </h2>
          <p className="public-body-text">
            Traditional education is expensive, static, and often out of date. Meanwhile, millions of passionate practitioners around the world have incredible expertise in coding, design, languages, musical instruments, and modern tools that they would love to share.
          </p>
          <p className="public-body-text no-mb">
            SkillLoop bridges that gap by creating a vibrant circle of knowledge. When you teach React to a beginner, you earn credits to master Spanish or Guitar from someone else. It's a continuous, self-sustaining loop of growth.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
