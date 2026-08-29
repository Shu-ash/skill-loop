// src/admin/components/AdminNavbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function AdminNavbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('admin_sidebar_collapsed');
    navigate('/login');
  };

  const navLinks = [
    { label: 'Admin Dashboard', icon: '📊', path: '/admin' },
    { label: 'User Management', icon: '👥', path: '/admin/users' },
    { label: 'Skill Categories', icon: '🏷️', path: '/admin/categories' },
    { label: 'Sessions & Disputes', icon: '📅', path: '/admin/sessions' },
    { label: 'Credit Audit Ledger', icon: '🪙', path: '/admin/credits' },
    { label: 'Moderation Reports', icon: '🚨', path: '/admin/reports' }
  ];

  return (
    <>
      <header className="admin-navbar">
        {/* Brand logo and admin badge */}
        <Link to="/admin" className="admin-brand" onClick={closeMobileMenu}>
          <div className="brand-icon">
            <span className="circle-violet"></span>
            <span className="circle-mint"></span>
          </div>
          <span className="brand-name">Skill<span>Loop</span></span>
          <span className="admin-tag">ADMIN</span>
        </Link>

        {/* System Status, Theme Toggle & Admin Profile */}
        <div className="admin-nav-right">
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

          <div className="system-status desktop-only-btn">
            <span className="status-dot"></span>
            <span>System Healthy</span>
          </div>

          <div className="admin-profile desktop-only-btn">
            <div className="admin-avatar">SA</div>
            <div className="admin-details">
              <span className="admin-name">Super Admin</span>
              <span className="admin-role">System Moderator</span>
            </div>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button 
            type="button" 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Admin Navigation Menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Glassmorphic Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu-drawer glass-panel clay-card-3d">
            <div className="mobile-drawer-header">
              <div className="admin-profile mobile-drawer-profile">
                <div className="admin-avatar">SA</div>
                <div className="admin-details">
                  <span className="admin-name">Super Admin</span>
                  <span className="admin-role">System Moderator</span>
                </div>
              </div>
              <button 
                type="button" 
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title="Toggle Theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            </div>

            <ul className="mobile-nav-list">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link 
                      className={`mobile-nav-link ${isActive ? 'active' : ''}`} 
                      to={item.path} 
                      onClick={closeMobileMenu}
                    >
                      <span className="mobile-nav-icon">{item.icon}</span>
                      <span className="mobile-nav-label">{item.label}</span>
                      {isActive && <span className="mobile-active-dot">●</span>}
                    </Link>
                  </li>
                );
              })}

              <li className="mobile-drawer-divider"></li>
              <li>
                <button 
                  type="button" 
                  className="btn btn-secondary btn-full-mobile btn-logout-danger" 
                  onClick={() => { closeMobileMenu(); setShowLogoutModal(true); }}
                >
                  ↪️ Logout of Admin
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Sleek Glassmorphic Confirmation Modal for Logout */}
      {showLogoutModal && (
        <div className="modal-overlay full-viewport-blur-overlay" onClick={() => setShowLogoutModal(false)}>
          <div 
            className="glass-panel logout-confirm-box clay-card-3d admin-action-center-modal" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>↪️ Confirm Logout</h3>
              <button 
                type="button" 
                className="close-modal-btn" 
                onClick={() => setShowLogoutModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body modal-body-padded">
              <p className="logout-modal-text">
                Are you sure you want to log out of the Admin Control Panel?
              </p>
              <div className="modal-action-buttons">
                <button 
                  type="button" 
                  className="action-btn" 
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-danger-pill" 
                  onClick={confirmLogout}
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
