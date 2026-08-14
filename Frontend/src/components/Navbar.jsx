// src/components/Navbar.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
export default function Navbar() {

    // State to manage the visibility of the notifications panel
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New swap request received!", read: false }
  ]);

  // Function to toggle the notifications panel
  const toggleNotifications = () => {
    setShowNotifs(!showNotifs);
  };

  // Function to mark all notifications as read
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
        <li><a className="nav-item" href="#how-it-works">How it works</a></li>
        <li><Link className="nav-item" to="/credits">Credits</Link></li>
        <li><Link className="nav-item" to="/leaderboard">Community</Link></li>
      </ul>

        {/* Notification bell and user action buttons */}
      <div className="nav-actions">
        <button 
          className="nav-notification-btn" 
          id="notif-bell-btn" 
          title="Notifications" 
          onClick={toggleNotifications}
        >
          🔔
          {notifications.some(n => !n.read) && <span className="notification-badge"></span>}
        </button>
        <Link className="btn btn-secondary btn-pill-sm" to="/login">Log in</Link>
        <Link className="btn btn-primary btn-pill-sm" to="/onboarding">Get started</Link>
      </div>

        {/* Notifications panel */}
      {showNotifs && (
        <div className="notifications-panel glass-panel show" id="notifications-dropdown">
          <div className="notif-header">
            <h4>Notifications</h4>
            <span style={{ cursor: 'pointer' }} onClick={markAllRead}>Mark all read</span>
          </div>
          <div className="notif-list">
            {notifications.map(n => (
              <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                <p>{n.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}