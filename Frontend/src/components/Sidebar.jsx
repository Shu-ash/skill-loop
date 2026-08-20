// src/components/Sidebar.jsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ user = { name: "Owen Reyes", credits: 3, avatar: "OR" } }) {
  const location = useLocation();

  //Sidebar menu items
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
    <aside className="sidebar">
      <div>
        <div className="sidebar-header">
          <p>NAVIGATION</p>
        </div>

        {/* Navigation Menu */}
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link 
                className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`} 
                to={item.path}
              >
                <span>{item.icon} {item.label}</span>
                {item.badge && <span className="badge-count">{item.badge}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* User Info Section */}
      <Link className="sidebar-user" to="/profile">
        <div className="user-avatar">{user.avatar}</div>
        <div className="user-info">
          <h4>{user.name}</h4>
          <p>{user.credits} credits available</p>
        </div>
      </Link>
    </aside>
  );
}