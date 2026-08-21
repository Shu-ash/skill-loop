// src/components/Navbar.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New swap request received from Sujit!", read: false },
    { id: 2, text: "Debosmita accepted your skill swap!", read: false }
  ]);

  const toggleNotifications = () => {
    setShowNotifs(!showNotifs);
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="navbar">
      {/* Brand logo and name */}
      <Link className="brand-logo" to="/">
        <div className="brand-icon">
          <span className="circle-violet"></span>
          <span className="circle-mint"></span>
        </div>
        <span className="brand-name">Skill<span>Loop</span></span>
      </Link>

      {/* Navigation links */}
      <ul className="nav-links">
        <li><Link className="nav-item" to="/browse">Explore</Link></li>
        <li><Link className="nav-item" to="/how-it-works">How it works</Link></li>
        <li><Link className="nav-item" to="/credits">Credits</Link></li>
        <li><Link className="nav-item" to="/leaderboard">Community</Link></li>
      </ul>

      {/* Notification bell and user action buttons */}
      <div className="nav-actions">
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

        <Link className="btn btn-secondary btn-pill-sm" to="/login">Log in</Link>
        <Link className="btn btn-primary btn-pill-sm" to="/onboarding">Get started</Link>
      </div>
    </header>
  );
}