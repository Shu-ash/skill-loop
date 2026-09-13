// src/components/HeroSection.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuthStatus } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

export default function HeroSection() {
  const { isAuthenticated } = getAuthStatus();
  const targetLink = isAuthenticated ? '/browse' : '/login?mode=signup';

  const [stats, setStats] = useState({
    members: '10+',
    sessions: '20+',
    rating: '5.0 ★'
  });

  useEffect(() => {
    const fetchCommunityStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/community-stats`);
        const data = await res.json();
        if (data.success && data.data) {
          setStats({
            members: String(data.data.totalMembers || 0),
            sessions: String(data.data.totalSessionsSwapped || 0),
            rating: data.data.averageRating || '5.0 ★'
          });
        }
      } catch (err) {
        console.error('Failed to load community stats:', err);
      }
    };

    fetchCommunityStats();
  }, []);

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
          <Link className="btn btn-primary" to={targetLink}>
            {isAuthenticated ? 'Browse skills to learn →' : 'Join the loop →'}
          </Link>
          <Link className="btn btn-secondary" to="/how-it-works">See how it works</Link>
        </div>

        {/* Hero stats */}
        <div className="hero-stats">
          <div className="stat-item">
            <h3>{stats.members}</h3>
            <p>active members</p>
          </div>
          <div className="stat-item">
            <h3>{stats.sessions}</h3>
            <p>sessions swapped</p>
          </div>
          <div className="stat-item">
            <h3>{stats.rating}</h3>
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