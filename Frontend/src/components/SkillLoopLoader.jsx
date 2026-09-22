// src/components/SkillLoopLoader.jsx
import React from 'react';
import './SkillLoopLoader.css';

/**
 * SkillLoopLoader: 3D Multi-Orbit Gyroscopic Loading Animation
 * Represents real-time database connectivity and live MongoDB syncing.
 *
 * @param {string} title - Primary loading message
 * @param {string} subtitle - Secondary explanatory text
 * @param {string} badgeText - Live status indicator badge text
 * @param {'card' | 'transparent' | 'fullscreen' | 'compact'} variant - Layout style
 * @param {string} className - Optional custom class name
 */
export default function SkillLoopLoader({
  title = 'Connecting to MongoDB...',
  subtitle = 'Retrieving real-time records from database cluster...',
  badgeText = 'MongoDB Live Sync',
  variant = 'card',
  className = ''
}) {
  return (
    <div className={`skill-loop-loader-wrapper variant-${variant} ${className}`}>
      {/* 3D Multi-Orbit Gyroscope Stage */}
      <div className="loader-orbit-stage" aria-hidden="true">
        {/* Soft Concentric Ripple Waves */}
        <div className="loader-ripple ripple-1" />
        <div className="loader-ripple ripple-2" />

        {/* Outer Cyan Dotted Track */}
        <div className="loader-gyro-ring ring-cyan" />

        {/* Primary Royal Blue Gyro Ring with Orbiting Particle */}
        <div className="loader-gyro-ring ring-blue">
          <span className="orbiting-particle particle-blue" />
        </div>

        {/* Secondary Emerald Mint Gyro Ring with Orbiting Particle */}
        <div className="loader-gyro-ring ring-mint">
          <span className="orbiting-particle particle-mint" />
        </div>

        {/* Center Cybernetic Core Node */}
        <div className="loader-core">
          <div className="loader-core-icon">
            <span className="core-dot dot-violet" />
            <span className="core-dot dot-mint" />
          </div>
        </div>
      </div>

      {/* Real-time Status Badge, Titles & Progress Shimmer */}
      <div className="loader-info">
        {badgeText && (
          <div className="loader-badge">
            <span className="live-pulse-dot" />
            <span>{badgeText}</span>
          </div>
        )}

        {title && <h4 className="loader-title">{title}</h4>}
        {subtitle && <p className="loader-subtitle">{subtitle}</p>}

        <div className="loader-shimmer-track">
          <div className="loader-shimmer-bar" />
        </div>
      </div>
    </div>
  );
}
