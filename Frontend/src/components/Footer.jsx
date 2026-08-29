// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-panel app-footer-section" style={{
      marginTop: '4rem',
      padding: '3.5rem 2rem 2rem 2rem',
      borderTop: '1px solid rgba(255, 255, 255, 0.7)',
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(248, 250, 252, 0.85) 100%)',
      backdropFilter: 'blur(20px)',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="footer-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Col */}
          <div>
            <Link to="/" className="brand-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div className="brand-icon">
                <span className="circle-violet"></span>
                <span className="circle-mint"></span>
              </div>
              <span className="brand-name" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Skill<span style={{ color: 'var(--violet-primary, #6c5ce7)' }}>Loop</span></span>
            </Link>
            <p style={{ fontSize: '0.88rem', color: 'var(--slate-600, #475569)', lineHeight: '1.6', margin: '0 0 1.2rem 0' }}>
              The decentralized peer-to-peer micro-learning platform where you teach to earn credits and spend credits to learn any skill.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981' }}>System Operational</span>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800, #1e293b)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '1.1rem' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/browse" style={{ color: 'var(--slate-600, #475569)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                  🔍 Browse Skills
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" style={{ color: 'var(--slate-600, #475569)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                  ⚡ How It Works
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" style={{ color: 'var(--slate-600, #475569)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                  🏆 Community Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800, #1e293b)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '1.1rem' }}>
              Company &amp; Help
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/about" style={{ color: 'var(--slate-600, #475569)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                  📖 About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ color: 'var(--slate-600, #475569)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                  💬 Contact &amp; Support
                </Link>
              </li>
              <li>
                <a href="mailto:support@skillloop.com" style={{ color: 'var(--slate-600, #475569)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                  ✉️ support@skillloop.com
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--slate-800, #1e293b)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '1.1rem' }}>
              Legal &amp; Trust
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <li>
                <Link to="/terms" style={{ color: 'var(--slate-600, #475569)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                  📜 Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" style={{ color: 'var(--slate-600, #475569)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                  🔒 Privacy Policy
                </Link>
              </li>
              <li>
                <span style={{ fontSize: '0.85rem', color: 'var(--slate-500, #64748b)' }}>
                  🛡️ 100% Fair Credit Protection
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--slate-500, #64748b)' }}>
            &copy; {currentYear} SkillLoop Platform. All rights reserved. Built for peer skill exchange.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <Link to="/terms" style={{ fontSize: '0.82rem', color: 'var(--slate-500, #64748b)', textDecoration: 'none' }}>Terms</Link>
            <Link to="/privacy" style={{ fontSize: '0.82rem', color: 'var(--slate-500, #64748b)', textDecoration: 'none' }}>Privacy</Link>
            <Link to="/contact" style={{ fontSize: '0.82rem', color: 'var(--slate-500, #64748b)', textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
