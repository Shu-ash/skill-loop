// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-panel app-footer-wrapper">
      <div className="footer-inner-container">
        <div className="footer-columns-grid">
          {/* Brand Col */}
          <div>
            <Link to="/" className="brand-logo footer-brand-link">
              <div className="brand-icon">
                <span className="circle-violet"></span>
                <span className="circle-mint"></span>
              </div>
              <span className="brand-name footer-brand-title">Skill<span className="footer-brand-title-accent">Loop</span></span>
            </Link>
            <p className="footer-brand-desc">
              The decentralized peer-to-peer micro-learning platform where you teach to earn credits and spend credits to learn any skill.
            </p>
            <div className="footer-status-pill">
              <span className="footer-status-dot"></span>
              <span className="footer-status-text">System Operational</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="footer-col-title">
              Platform
            </h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/browse" className="footer-nav-link">
                  🔍 Browse Skills
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="footer-nav-link">
                  ⚡ How It Works
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="footer-nav-link">
                  🏆 Community Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="footer-col-title">
              Company &amp; Help
            </h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/about" className="footer-nav-link">
                  📖 About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-nav-link">
                  💬 Contact &amp; Support
                </Link>
              </li>
              <li>
                <a href="mailto:support@skillloop.com" className="footer-nav-link">
                  ✉️ support@skillloop.com
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="footer-col-title">
              Legal &amp; Trust
            </h4>
            <ul className="footer-links-list">
              <li>
                <Link to="/terms" className="footer-nav-link">
                  📜 Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="footer-nav-link">
                  🔒 Privacy Policy
                </Link>
              </li>
              <li>
                <span className="footer-trust-badge">
                  🛡️ 100% Fair Credit Protection
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            &copy; {currentYear} SkillLoop Platform. All rights reserved. Built for peer skill exchange.
          </p>
          <div className="footer-bottom-links">
            <Link to="/terms" className="footer-bottom-link">Terms</Link>
            <Link to="/privacy" className="footer-bottom-link">Privacy</Link>
            <Link to="/contact" className="footer-bottom-link">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
