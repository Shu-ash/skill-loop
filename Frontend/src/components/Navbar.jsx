// src/components/Navbar.jsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getAuthStatus } from '../utils/auth';

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New swap request received from Sujit!", read: false },
    { id: 2, text: "Debosmita accepted your skill swap!", read: false }
  ]);

  const { isAuthenticated, userType } = getAuthStatus();

  const toggleNotifications = () => {
    setShowNotifs(!showNotifs);
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      {/* Brand logo and name */}
      <Link className="brand-logo" to="/" onClick={closeMobileMenu}>
        <div className="brand-icon">
          <span className="circle-violet"></span>
          <span className="circle-mint"></span>
        </div>
        <span className="brand-name">Skill<span>Loop</span></span>
      </Link>

      {/* Desktop Navigation links */}
      <ul className="nav-links desktop-nav-links">
        <li><Link className={`nav-item ${location.pathname === '/browse' ? 'active' : ''}`} to="/browse">Explore</Link></li>
        <li><Link className={`nav-item ${location.pathname === '/how-it-works' ? 'active' : ''}`} to="/how-it-works">How it works</Link></li>
        <li><Link className={`nav-item ${location.pathname === '/credits' ? 'active' : ''}`} to="/credits">Credits</Link></li>
        <li><Link className={`nav-item ${location.pathname === '/leaderboard' ? 'active' : ''}`} to="/leaderboard">Community</Link></li>
      </ul>

      {/* Theme toggle button, Notification bell, Auth CTA */}
      <div className="nav-actions">
        {/* Theme Toggle Button */}
        <button 
          type="button"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {isAuthenticated && (
          <div className="notif-wrapper">
            <button 
              className="nav-notification-btn" 
              id="notif-bell-btn" 
              title="Notifications" 
              onClick={toggleNotifications}
            >
              🔔
              {notifications.some(n => !n.read) && <span className="notification-badge"></span>}
            </button>

            {/* Floating Notifications Dropdown */}
            {showNotifs && (
              <div className="notifications-panel glass-panel show" id="notifications-dropdown">
                <div className="notif-header">
                  <h4>🔔 Notifications</h4>
                  <span className="mark-read-btn" onClick={markAllRead}>Mark all read</span>
                </div>
                <div className="notif-list">
                  {notifications.map(n => (
                    <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                      <div className="notif-icon-circle">✨</div>
                      <div className="notif-body">
                        <p className="notif-text">{n.text}</p>
                        <span className="notif-time">Just now</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {userType === 'admin' ? (
          <Link className="btn btn-secondary btn-pill-sm desktop-only-btn" to="/admin">
            🛡️ Admin Panel
          </Link>
        ) : userType === 'user' ? (
          <Link className="btn btn-secondary btn-pill-sm desktop-only-btn" to="/profile">
            👤 My Profile
          </Link>
        ) : (
          <Link className="btn btn-primary btn-pill-sm desktop-only-btn" to="/login?mode=signup">
            Get started
          </Link>
        )}

        {/* Mobile Hamburger Toggle Button */}
        <button 
          type="button" 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Glassmorphic Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-drawer glass-panel">
          <ul className="mobile-nav-list">
            <li>
              <button 
                type="button" 
                className="mobile-nav-link mobile-theme-btn" 
                onClick={() => { toggleTheme(); closeMobileMenu(); }}
              >
                <span>{theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}</span>
              </button>
            </li>
            <li>
              <Link className="mobile-nav-link" to="/browse" onClick={closeMobileMenu}>
                🔍 Explore Skills
              </Link>
            </li>
            <li>
              <Link className="mobile-nav-link" to="/how-it-works" onClick={closeMobileMenu}>
                ℹ️ How it works
              </Link>
            </li>
            <li>
              <Link className="mobile-nav-link" to="/credits" onClick={closeMobileMenu}>
                🪙 Credits & Wallet
              </Link>
            </li>
            <li>
              <Link className="mobile-nav-link" to="/leaderboard" onClick={closeMobileMenu}>
                🏆 Community Leaderboard
              </Link>
            </li>
            <li className="mobile-drawer-divider"></li>
            <li>
              {userType === 'admin' ? (
                <Link className="btn btn-primary btn-full-mobile" to="/admin" onClick={closeMobileMenu}>
                  🛡️ Admin Panel
                </Link>
              ) : userType === 'user' ? (
                <Link className="btn btn-primary btn-full-mobile" to="/profile" onClick={closeMobileMenu}>
                  👤 My Profile
                </Link>
              ) : (
                <Link className="btn btn-primary btn-full-mobile" to="/login?mode=signup" onClick={closeMobileMenu}>
                  Get started
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}