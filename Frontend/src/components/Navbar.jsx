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
    <header class="navbar">
        
        {/* Brand logo and name */}
      <Link class="brand-logo" to="/">
        <div class="brand-icon">
          <span class="circle-violet"></span>
          <span class="circle-mint"></span>
        </div>
        <span class="brand-name">Skill<span>Loop</span></span>
      </Link>

        {/* Navigation links */}
      <ul class="nav-links">
        <li><Link class="nav-item" to="/browse">Explore</Link></li>
        <li><a class="nav-item" href="#how-it-works">How it works</a></li>
        <li><Link class="nav-item" to="/credits">Credits</Link></li>
        <li><Link class="nav-item" to="/leaderboard">Community</Link></li>
      </ul>

        {/* Notification bell and user action buttons */}
      <div class="nav-actions">
        <button 
          class="nav-notification-btn" 
          id="notif-bell-btn" 
          title="Notifications" 
          onClick={toggleNotifications}
        >
          🔔
          {notifications.some(n => !n.read) && <span class="notification-badge"></span>}
        </button>
        <Link class="btn btn-secondary btn-pill-sm" to="/login">Log in</Link>
        <Link class="btn btn-primary btn-pill-sm" to="/onboarding">Get started</Link>
      </div>

        {/* Notifications panel */}
      {showNotifs && (
        <div class="notifications-panel glass-panel show" id="notifications-dropdown">
          <div class="notif-header">
            <h4>Notifications</h4>
            <span style={{ cursor: 'pointer' }} onClick={markAllRead}>Mark all read</span>
          </div>
          <div class="notif-list">
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