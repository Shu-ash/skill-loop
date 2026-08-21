// src/components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Sidebar component transformed into a full-width horizontal navigation sub-bar
export default function Sidebar({ user = { name: "User Account", credits: 3, avatar: "UA" } }) {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { label: 'Browse skills', icon: '🔍', path: '/browse' },
    { label: 'My requests', icon: '📥', path: '/requests', badge: 2 },
    { label: 'Sessions', icon: '📅', path: '/schedule' },
    { label: 'Credits', icon: '🪙', path: '/credits' },
    { label: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
    { label: 'My profile', icon: '👤', path: '/profile' },
  ];

  return (
    <aside className="fullwidth-subnav-bar glass-panel">
      <ul className="subnav-menu-list">
        {menuItems.map((item) => (
          <li key={item.path}>
            <Link 
              className={`subnav-pill-link ${location.pathname === item.path ? 'active' : ''}`} 
              to={item.path}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge && <span className="subnav-badge-count">{item.badge}</span>}
            </Link>
          </li>
        ))}
      </ul>

      {/* User Info Credit Chip */}
      <Link className="subnav-user-chip" to="/profile">
        <div className="subnav-avatar">{user.avatar}</div>
        <div className="subnav-user-text">
          <span className="subnav-user-name">{user.name}</span>
          <span className="subnav-user-credits">🪙 {user.credits} credits</span>
        </div>
      </Link>
    </aside>
  );
}