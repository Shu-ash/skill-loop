// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../utils/auth';

export default function Sidebar({ user: propUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    if (propUser && propUser.name && propUser.name !== "User Account" && propUser.name !== "Member") {
      return propUser;
    }
    const stored = localStorage.getItem('skillloop_user');
    if (stored) {
      try {
        const u = JSON.parse(stored);
        const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member';
        const initials = name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'SL';
        return {
          name,
          credits: u.credits ?? 3,
          avatar: initials
        };
      } catch (e) {
        console.error(e);
      }
    }
    return { name: "SkillLoop Member", credits: 3, avatar: "SL" };
  });

  useEffect(() => {
    if (propUser && propUser.name && propUser.name !== "User Account" && propUser.name !== "Member") {
      setCurrentUser(propUser);
      return;
    }

    const loadActiveUser = async () => {
      const stored = localStorage.getItem('skillloop_user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member';
          const initials = name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'SL';
          setCurrentUser({
            name,
            credits: u.credits ?? 3,
            avatar: initials
          });
        } catch (e) {
          console.error(e);
        }
      }

      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const res = await fetch('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (res.ok && data.data?.user) {
            const u = data.data.user;
            const name = u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'SkillLoop Member';
            const initials = name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'SL';
            const updated = {
              name,
              credits: u.credits ?? 3,
              avatar: initials
            };
            setCurrentUser(updated);
            localStorage.setItem('skillloop_user', JSON.stringify({ ...u, name }));
          }
        } catch (e) {
          // offline fallback
        }
      }
    };

    loadActiveUser();
  }, [propUser]);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('user_sidebar_collapsed') === 'true';
  });

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { label: 'Browse skills', icon: '🔍', path: '/browse' },
    { label: 'My requests', icon: '📥', path: '/requests', badge: 2 },
    { label: 'Sessions', icon: '📅', path: '/sessions' },
    { label: 'Credits', icon: '🪙', path: '/credits' },
    { label: 'Leaderboard', icon: '🏆', path: '/leaderboard' },
    { label: 'My profile', icon: '👤', path: '/profile' },
  ];

  const handleToggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem('user_sidebar_collapsed', String(nextState));
  };

  const handleMenuClick = (path) => {
    navigate(path);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    clearAuthSession();
    navigate('/login');
  };

  return (
    <>
      <aside className={`user-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div>
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

        <div className="user-sidebar-bottom">
          <Link className="user-chip-link" to="/profile" title="View Profile">
            <div className="subnav-avatar">{currentUser.avatar}</div>
            <div className="subnav-user-text">
              <span className="subnav-user-name">{currentUser.name}</span>
              <span className="subnav-user-credits">🪙 {currentUser.credits} credits</span>
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