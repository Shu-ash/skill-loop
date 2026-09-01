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

      <main className="public-content-container" style={{ maxWidth: '1080px', margin: '2.5rem auto 4rem', padding: '0 1.5rem' }}>
        {/* Header Hero Banner */}
        <div className="glass-panel clay-card-3d" style={{ padding: '3.5rem 2.5rem', borderRadius: '32px', textAlign: 'center', marginBottom: '3rem', background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 237, 255, 0.85) 100%)' }}>
          <span className="pill-badge pill-purple" style={{ marginBottom: '1rem', display: 'inline-block' }}>
            🚀 Our Mission &amp; Story
          </span>
          <h1 style={{ fontSize: '2.6rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--slate-900, #0f172a)', margin: '0.5rem 0 1rem' }}>
            Empowering Anyone to <span style={{ color: 'var(--violet-primary, #6c5ce7)' }}>Learn by Teaching</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--slate-600, #475569)', maxWidth: '720px', margin: '0 auto 2rem', lineHeight: '1.7' }}>
            SkillLoop is a decentralized peer-to-peer micro-learning exchange where financial barriers disappear. Everyone has something valuable to teach, and everyone has a passion to learn.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/browse" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
              🔍 Explore Skills
            </Link>
            <Link to="/how-it-works" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
              ⚡ How It Works
            </Link>
          </div>
        </div>

        {/* 3 Core Pillars Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', marginBottom: '3.5rem' }}>
          <div className="glass-panel clay-card-3d" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(108, 92, 231, 0.12)', color: 'var(--violet-primary, #6c5ce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.2rem' }}>
              🪙
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.6rem' }}>
              Fair Time-Banking Economy
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--slate-600, #475569)', lineHeight: '1.6', margin: 0 }}>
              1 Hour of Teaching = 1 Skill Credit Earned. 1 Credit = 1 Hour of Learning from another expert. No hidden subscriptions, no fees.
            </p>
          </div>

          <div className="glass-panel clay-card-3d" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.2rem' }}>
              👥
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.6rem' }}>
              Direct 1-on-1 Mentorship
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--slate-600, #475569)', lineHeight: '1.6', margin: 0 }}>
              Instead of watching impersonal pre-recorded videos, you practice live with real developers, designers, polyglots, and mentors via video calls.
            </p>
          </div>

          <div className="glass-panel clay-card-3d" style={{ padding: '2rem', borderRadius: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255, 118, 117, 0.12)', color: '#ff7675', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.2rem' }}>
              🛡️
            </div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '0.6rem' }}>
              Audited &amp; Safe Learning
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--slate-600, #475569)', lineHeight: '1.6', margin: 0 }}>
              Every swap transaction is logged in an auditable ledger. Our admin moderation team guarantees a respectful, harassment-free environment.
            </p>
          </div>
        </div>

        {/* Community Values & Culture */}
        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '28px', background: 'rgba(255, 255, 255, 0.8)' }}>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '1rem', color: 'var(--slate-900, #0f172a)' }}>
            Why We Built SkillLoop
          </h2>
          <p style={{ fontSize: '0.98rem', color: 'var(--slate-700, #334155)', lineHeight: '1.8', marginBottom: '1.25rem' }}>
            Traditional education is expensive, static, and often out of date. Meanwhile, millions of passionate practitioners around the world have incredible expertise in coding, design, languages, musical instruments, and modern tools that they would love to share.
          </p>
          <p style={{ fontSize: '0.98rem', color: 'var(--slate-700, #334155)', lineHeight: '1.8', margin: 0 }}>
            SkillLoop bridges that gap by creating a vibrant circle of knowledge. When you teach React to a beginner, you earn credits to master Spanish or Guitar from someone else. It's a continuous, self-sustaining loop of growth.
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
