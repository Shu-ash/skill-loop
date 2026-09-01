// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getAuthStatus } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Navbar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const { isAuthenticated, userType } = getAuthStatus();

  const fetchNotifications = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !isAuthenticated) return;

    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data?.notifications) {
        setNotifications(data.data.notifications);
      }
    } catch (err) {
      console.log('Notifications fallback active');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  const toggleNotifications = () => {
    setShowNotifs(!showNotifs);
    if (!showNotifs) {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    const token = localStorage.getItem('accessToken');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    if (token) {
      try {
        await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'credit_earned': return '🪙';
      case 'credit_spent': return '🎓';
      case 'swap_request': return '📩';
      case 'swap_accepted': return '🎉';
      case 'session_completed': return '✅';
      default: return '✨';
    }
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
              <div className="notifications-panel glass-panel show" id="notifications-dropdown" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                <div className="notif-header">
                  <h4>🔔 Notifications</h4>
                  {notifications.some(n => !n.read) && (
                    <span className="mark-read-btn" onClick={markAllRead} style={{ cursor: 'pointer' }}>Mark all read</span>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <Link 
                        key={n.id} 
                        to={n.link || '/dashboard'} 
                        className={`notif-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => setShowNotifs(false)}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="notif-icon-circle">{getNotifIcon(n.type)}</div>
                        <div className="notif-body">
                          <p className="notif-text" style={{ fontWeight: n.read ? 500 : 700 }}>{n.text || n.title}</p>
                          <span className="notif-time">{n.time || 'Recent'}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div style={{ padding: '1.75rem 1rem', textAlign: 'center', color: 'var(--slate-500)', fontSize: '0.86rem' }}>
                      No new notifications right now.
                    </div>
                  )}
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
                🪙 Credits &amp; Wallet
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