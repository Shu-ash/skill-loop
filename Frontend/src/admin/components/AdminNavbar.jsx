// src/admin/components/AdminNavbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

export default function AdminNavbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="admin-navbar">
      {/* Brand logo and admin badge */}
      <Link to="/admin" className="admin-brand">
        <div className="brand-icon">
          <span className="circle-violet"></span>
          <span className="circle-mint"></span>
        </div>
        <span className="brand-name">Skill<span>Loop</span> <span className="admin-tag">ADMIN</span></span>
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

        <div className="system-status">
          <span className="status-dot"></span>
          <span>System Healthy</span>
        </div>

        <div className="admin-profile">
          <div className="admin-avatar">SA</div>
          <div className="admin-details">
            <span className="admin-name">Super Admin</span>
            <span className="admin-role">System Moderator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
