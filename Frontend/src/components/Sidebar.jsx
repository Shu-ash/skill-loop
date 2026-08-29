// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ user = { name: "User Account", credits: 3, avatar: "UA" } }) {
  const location = useLocation();
  const navigate = useNavigate();

  // Read initial collapsed state from localStorage so state persists across page transitions
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('user_sidebar_collapsed') === 'true';
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { label: 'Browse skills', icon: '🔍', path: '/browse' },
    { label: 'My requests', icon: '📥', path: '/requests', badge: 2 },
    { label: 'Sessions', icon: '📅', path: '/schedule' },
    { label: 'Credits', icon: '🪙', path: '/credits' },
    { label: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
    { label: 'My profile', icon: '👤', path: '/profile' },
  ];

  // Manual toggle handler for sliding collapse/expand
  const handleToggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('user_sidebar_collapsed', String(nextState));
  };

  // Click handler for menu items: navigate directly without altering collapse state
  const handleMenuClick = (path) => {
    navigate(path);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('skillloop_user');
    navigate('/login');
  };

  return (
    <>
      <aside className={`user-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div>
          {/* Sidebar Header with Collapse Toggle */}
          <div className="sidebar-header-row">
            <span className="sidebar-title">NAVIGATION</span>
            <button 
              type="button" 
              className="toggle-btn" 
              onClick={handleToggleSidebar}
              title="Toggle Sidebar Width"
            >
              {isCollapsed ? '▶' : '◀'}
            </button>
          </div>

          {/* Navigation Menu List */}
          <ul className="user-sidebar-menu">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    type="button"
                    className={`user-menu-item-btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleMenuClick(item.path)}
                    title={item.label}
                  >
                    <span className="sidebar-icon-wrapper">
                      <span className="icon">{item.icon}</span>
                      {isCollapsed && item.badge && (
                        <span className="collapsed-badge-dot">{item.badge}</span>
                      )}
                    </span>
                    <span className="menu-text">{item.label}</span>
                    {!isCollapsed && item.badge && (
                      <span className="subnav-badge-count">{item.badge}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Bottom User Info & Logout Button */}
        <div className="user-sidebar-bottom">
          <Link className="user-chip-link" to="/profile" title="View Profile">
            <div className="subnav-avatar">{user.avatar}</div>
            <div className="subnav-user-text">
              <span className="subnav-user-name">{user.name}</span>
              <span className="subnav-user-credits">🪙 {user.credits} credits</span>
            </div>
          </Link>
          <button 
            type="button" 
            className="user-menu-item-btn logout-btn logout-btn-sidebar" 
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
          >
            <span className="sidebar-icon-wrapper">
              <span className="icon">↪️</span>
            </span>
            <span className="menu-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* Glassmorphic Confirmation Modal for Logout */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div 
            className="glass-panel logout-confirm-box clay-card-3d" 
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
                Are you sure you want to log out of SkillLoop?
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