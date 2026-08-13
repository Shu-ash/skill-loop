import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <main class="landing-hero">

        {/* Left side: Hero text and stats */}
      <div class="hero-left">
        <div class="hero-tag">
          <span class="pill-badge pill-violet">✦ No fees. No tutors. Just trade skills.</span>
        </div>
        <h1 class="hero-title">
          Teach what you know.<br />
          Learn what you<br />
          <span class="highlight-violet">don't</span> <span class="highlight-mint">— for free.</span>
        </h1>
        <p class="hero-desc">
          SkillLoop pairs people who want to trade knowledge. Teach a session, earn a Skill Credit, spend it learning from anyone else in the loop. No money changes hands — ever.
        </p>

        {/* Call-to-action buttons */}
        <div class="hero-btns">
          <Link class="btn btn-primary" to="/login">Join the loop →</Link>
          <a class="btn btn-secondary" href="#how-it-works">See how it works</a>
        </div>

        {/* Hero stats */}
        <div class="hero-stats">
          <div class="stat-item">
            <h3>2,140</h3>
            <p>active members</p>
          </div>
          <div class="stat-item">
            <h3>5,600+</h3>
            <p>sessions swapped</p>
          </div>
          <div class="stat-item">
            <h3>4.9 ★</h3>
            <p>average rating</p>
          </div>
        </div>
      </div>


        {/* Right side: Hero visual */}
      <div class="hero-visual">
        <div class="hero-visual-card">
          <div class="orbit-container">
            <div class="orbit-line"></div>
            
            <div class="center-loop-ring">
              <div class="center-loop-inner">
                <span class="loop-infinity-icon">∞</span>
                <span class="loop-label">THE LOOP</span>
              </div>
            </div>


            {/* Orbit cards for teaching and learning */}
            <div class="orbit-card orbit-card-teach">
              <span class="pill-badge pill-violet">YOU TEACH</span>
              <h4>UI Design in Figma</h4>
              <p>+1 Skill Credit earned</p>
            </div>

            <div class="orbit-card orbit-card-learn">
              <span class="pill-badge pill-mint">YOU LEARN</span>
              <h4>Conversational Spanish</h4>
              <p>-1 Skill Credit spent</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}