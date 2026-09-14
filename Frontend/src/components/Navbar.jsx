import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getAuthStatus } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
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

  const deleteNotification = async (notifId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!notifId) return;

    // Remove ONLY this single notification from UI state
    setNotifications(prev => prev.filter(n => (n.id || n._id) !== notifId));

    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/notifications/${notifId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Error deleting notification:', err);
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
                    notifications.map(n => {
                      const notifId = n.id || n._id;
                      return (
                        <div 
                          key={notifId} 
                          className={`notif-item ${!n.read ? 'unread' : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                            gap: '0.75rem',
                            transition: 'background 0.15s ease',
                            position: 'relative'
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              flex: 1,
                              cursor: 'pointer',
                              minWidth: 0
                            }}
                            onClick={() => {
                              setShowNotifs(false);
                              if (n.link) {
                                navigate(n.link);
                              }
                            }}
                            title="Click to view details"
                          >
                            <div className="notif-icon-circle">{getNotifIcon(n.type)}</div>
                            <div className="notif-body" style={{ flex: 1, minWidth: 0 }}>
                              <p className="notif-text" style={{ fontWeight: n.read ? 500 : 700, margin: 0, fontSize: '0.86rem', wordBreak: 'break-word' }}>
                                {n.text || n.title}
                              </p>
                              <span className="notif-time" style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                                {n.time || 'Recent'}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => deleteNotification(notifId, e)}
                            title="Delete this notification only"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              color: 'var(--slate-400, #94a3b8)',
                              padding: '5px 7px',
                              borderRadius: '6px',
                              transition: 'all 0.15s ease',
                              flexShrink: 0,
                              lineHeight: 1
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = 'var(--slate-400, #94a3b8)';
                              e.currentTarget.style.background = 'none';
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })
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